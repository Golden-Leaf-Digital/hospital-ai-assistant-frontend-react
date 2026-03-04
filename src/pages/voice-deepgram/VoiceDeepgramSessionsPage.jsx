import { useEffect, useMemo, useRef, useState } from "react";

const GATEWAY =
  import.meta.env.VITE_GATEWAY_BASE_URL ||
  "http://localhost:3001";

const WS_URL =
  GATEWAY.replace(/^http/, "ws") + "/ws/deepgram";

function getOrCreateLocal(key, gen) {
  let v = "";
  try {
    v = localStorage.getItem(key) || "";
    if (!v) {
      v = gen();
      localStorage.setItem(key, v);
    }
  } catch {
    v = gen();
  }
  return v;
}

function genId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

function floatTo16BitPCM(float32) {
  const out = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    let s = Math.max(-1, Math.min(1, float32[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

function downsampleBuffer(buffer, inputRate, outputRate) {
  if (outputRate === inputRate) return buffer;

  const ratio = inputRate / outputRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);

  let offsetResult = 0;
  let offsetBuffer = 0;

  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round(
      (offsetResult + 1) * ratio
    );

    let accum = 0;
    let count = 0;

    for (
      let i = offsetBuffer;
      i < nextOffsetBuffer && i < buffer.length;
      i++
    ) {
      accum += buffer[i];
      count++;
    }

    result[offsetResult] = accum / count;
    offsetResult++;
    offsetBuffer = nextOffsetBuffer;
  }

  return result;
}

export default function VoiceDeepgramSessionsPage() {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const [language, setLanguage] = useState("en-IN");
  const [sessionId, setSessionId] = useState("");
  const [externalId, setExternalId] = useState("");
  const [channel] = useState("web-voice");

  const [interim, setInterim] = useState("");
  const [finalText, setFinalText] = useState("");
  const [assistantText, setAssistantText] =
    useState("");
  const [brainState, setBrainState] = useState("");

  const [ttsOn, setTtsOn] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const wsRef = useRef(null);
  const audioCtxRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);

  /* -------- Load voices once -------- */
  useEffect(() => {
    const loadVoices = () =>
      window.speechSynthesis.getVoices();

    loadVoices();
    window.speechSynthesis.onvoiceschanged =
      loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged =
        null;
    };
  }, []);

  function stopTtsNow() {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }

  function speak(text) {
    if (!ttsOn || !text) return;

    try {
      stopTtsNow();

      const u =
        new SpeechSynthesisUtterance(text);
      u.rate = 1;

      let ttsLang =
        language === "hi" || language === "mr"
          ? "hi-IN"
          : "en-IN";

      u.lang = ttsLang;

      const voices =
        window.speechSynthesis.getVoices();

      let voice = voices.find(
        (v) =>
          v.lang.toLowerCase() ===
          ttsLang.toLowerCase()
      );

      if (!voice) {
        const prefix = ttsLang
          .slice(0, 2)
          .toLowerCase();
        voice = voices.find((v) =>
          v.lang.toLowerCase().startsWith(prefix)
        );
      }

      if (voice) u.voice = voice;

      u.onstart = () => setIsSpeaking(true);
      u.onend = () => setIsSpeaking(false);
      u.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(u);
    } catch (err) {
      console.error("TTS error:", err);
    }
  }

  useEffect(() => {
    const ext = getOrCreateLocal(
      "hai_external_id",
      () =>
        globalThis.crypto?.randomUUID?.() ||
        genId("web")
    );
    setExternalId(ext);

    const sid = getOrCreateLocal(
      "hai_session_id",
      () => genId("sess")
    );
    setSessionId(sid);

    const lang =
      localStorage.getItem("hai_language") ||
      "en-IN";
    setLanguage(lang);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "hai_language",
        language
      );
    } catch {}
  }, [language]);

  async function start() {
    setError("");
    setInterim("");
    setFinalText("");
    setAssistantText("");
    setBrainState("");
    setStatus("connecting");

    const ws = new WebSocket(WS_URL);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = async () => {
      try {
        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
              },
            }
          );

        streamRef.current = stream;

        const AudioCtx =
          window.AudioContext ||
          window.webkitAudioContext;

        const audioCtx = new AudioCtx();
        audioCtxRef.current = audioCtx;

        const source =
          audioCtx.createMediaStreamSource(
            stream
          );
        sourceRef.current = source;

        const processor =
          audioCtx.createScriptProcessor(
            4096,
            1,
            1
          );
        processorRef.current = processor;

        const inputRate =
          audioCtx.sampleRate;
        const outputRate = 16000;

        processor.onaudioprocess = (e) => {
          const w = wsRef.current;
          if (
            !w ||
            w.readyState !== WebSocket.OPEN
          )
            return;

          const inBuf =
            e.inputBuffer.getChannelData(0);

          const down = downsampleBuffer(
            inBuf,
            inputRate,
            outputRate
          );

          const pcm16 =
            floatTo16BitPCM(down);

          w.send(pcm16.buffer);
        };

        source.connect(processor);
        processor.connect(audioCtx.destination);

        ws.send(
          JSON.stringify({
            type: "start",
            session_id: sessionId,
            channel,
            externalId,
            language,
            stt_settings: {},
          })
        );

        setStatus("connected");
      } catch (e) {
        setError(
          e?.message || "mic start failed"
        );
        setStatus("error");
      }
    };

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);

        if (msg.type === "stt_interim")
          setInterim(msg.text || "");

        if (msg.type === "stt_final") {
          setFinalText((prev) =>
            prev
              ? prev + "\n" + msg.text
              : msg.text
          );
          setInterim("");
        }

        if (
          msg.type === "user_speech_started"
        ) {
          if (isSpeaking) stopTtsNow();
        }

        if (msg.type === "brain_reply") {
          setAssistantText(
            msg.assistantText || ""
          );
          setBrainState(msg.state || "");
          if (msg.assistantText)
            speak(msg.assistantText);
        }

        if (msg.type === "error")
          setError(
            msg.message || "error"
          );
      } catch {}
    };

    ws.onerror = () => {
      setError("WebSocket error");
      setStatus("error");
    };

    ws.onclose = () => {
      stop();
    };
  }

  function stop() {
    try {
      wsRef.current?.send(
        JSON.stringify({ type: "stop" })
      );
    } catch {}

    try {
      wsRef.current?.close();
    } catch {}

    wsRef.current = null;

    processorRef.current?.disconnect?.();
    sourceRef.current?.disconnect?.();
    audioCtxRef.current?.close?.();

    streamRef.current
      ?.getTracks()
      .forEach((t) => t.stop());

    stopTtsNow();
    setStatus("idle");
  }

  const languageLabel = useMemo(() => {
    if (language === "hi") return "Hindi";
    if (language === "mr") return "Marathi";
    return "English (India)";
  }, [language]);

  return (
    <div
      style={{
        padding: 16,
        maxWidth: 950,
        margin: "0 auto",
      }}
    >
      <h1>Voice (Deepgram Sessions)</h1>

      <p>
        WS endpoint: <code>{WS_URL}</code>
      </p>

      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>

      <p>Status: {status}</p>
      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      <h3>Interim</h3>
      <div>{interim || "-"}</div>

      <h3>Final transcript</h3>
      <div>{finalText || "-"}</div>

      <h3>Brain assistantText</h3>
      <div>{assistantText || "-"}</div>

      <h3>Brain state</h3>
      <div>{brainState || "-"}</div>

      <p style={{ fontSize: 12 }}>
        Barge-in rule: when speech starts,
        TTS is cancelled immediately.
      </p>
    </div>
  );
}