import { useEffect, useMemo, useRef, useState } from "react";

const GATEWAY =
  import.meta.env.VITE_GATEWAY_BASE_URL || "http://localhost:3001";

const REALTIME_MODEL =
  import.meta.env.VITE_REALTIME_MODEL || "gpt-realtime";

const PIPECAT_WS_URL =
  import.meta.env.VITE_PIPECAT_WS_URL || "ws://localhost:7860/ws";

const TEMPERATURE = Number.isFinite(
  Number(import.meta.env.VITE_REALTIME_TEMPERATURE)
)
  ? Number(import.meta.env.VITE_REALTIME_TEMPERATURE)
  : 0.7;

async function unlockAudio() {
  const AudioCtx =
    window.AudioContext || window.webkitAudioContext;

  const ctx = new AudioCtx();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
}

export default function VoicePage() {
  const [voiceEngine, setVoiceEngine] =
    useState("openai_realtime");

  const [status, setStatus] = useState("idle");
  const [err, setErr] = useState("");

  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const audioRef = useRef(null);
  const toolArgsByCallId = useRef({});

  const pipecatRef = useRef(null);

  const [micOn, setMicOn] = useState(false);
  const [speech, setSpeech] = useState("idle");
  const [toolStatus, setToolStatus] = useState("idle");
  const [lastToolText, setLastToolText] = useState("");
  const [aiSpeaking, setAiSpeaking] = useState(false);

  const [brainState, setBrainState] = useState("");
  const [brainAssistantText, setBrainAssistantText] =
    useState("");
  const [externalId, setExternalId] = useState("");

  const speakRetryTimerRef = useRef(null);
  const micSenderRef = useRef(null);

  const [remoteAudioAttached, setRemoteAudioAttached] =
    useState(false);
  const [remoteAudioTracks, setRemoteAudioTracks] =
    useState(0);

  const [pipecatConnInfo, setPipecatConnInfo] =
    useState("");

  useEffect(() => {
    const key = "hai_external_id";
    let ext = localStorage.getItem(key) || "";

    if (!ext) {
      ext =
        (globalThis.crypto?.randomUUID?.()) ||
        `web-${Date.now()}-${Math.random()
          .toString(16)
          .slice(2)}`;

      localStorage.setItem(key, ext);
    }

    setExternalId(ext);
  }, []);

  const channel = "web-voice";
  const debug = useMemo(() => true, []);

  async function start() {
    await unlockAudio();

    setErr("");
    setStatus("connecting");
    setToolStatus("idle");
    setLastToolText("");
    setBrainState("");
    setBrainAssistantText("");
    setAiSpeaking(false);
    setRemoteAudioAttached(false);
    setRemoteAudioTracks(0);
    setPipecatConnInfo("");

    try {
      if (voiceEngine === "openai_realtime") {
        await startOpenAIRealtime();
      } else {
        await startPipecatWebSocket();
      }
    } catch (e) {
      setErr(e?.message || "Failed to start voice");
      setStatus("error");
      setMicOn(false);
    }
  }

  function stop() {
    if (speakRetryTimerRef.current)
      clearTimeout(speakRetryTimerRef.current);

    try {
      pipecatRef.current?.disconnect?.();
    } catch {}

    pipecatRef.current = null;

    try {
      dcRef.current?.close();
    } catch {}
    try {
      pcRef.current?.close();
    } catch {}

    dcRef.current = null;
    pcRef.current = null;
    micSenderRef.current = null;

    setStatus("idle");
    setMicOn(false);
    setSpeech("idle");
    setToolStatus("idle");
    setLastToolText("");
    setAiSpeaking(false);
  }

  function muteMic() {
    const sender = micSenderRef.current;
    if (!sender?.track) return;
    sender.track.enabled = false;
  }

  function unmuteMic() {
    const sender = micSenderRef.current;
    if (!sender?.track) return;
    sender.track.enabled = true;
  }

  function forcePlayAudio() {
    const el = audioRef.current;
    if (!el) return;

    el.muted = false;
    el.volume = 1;
    el.play()?.catch(() => {});
  }

  /* ---------------- OpenAI Realtime (unchanged logic) ---------------- */

  async function startOpenAIRealtime() {
    const s = await fetch(`${GATEWAY}/v1/voice/session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel,
        externalId,
        voice_engine: "openai_realtime",
      }),
    });

    if (!s.ok)
      throw new Error(`realtime-session failed: ${s.status}`);

    const sess = await s.json();
    const EPHEMERAL = sess.client_secret?.value;

    if (!EPHEMERAL)
      throw new Error("Missing client_secret.value");

    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    pc.ontrack = (event) => {
      const [stream] = event.streams;
      setRemoteAudioTracks(
        stream.getAudioTracks().length
      );
      setRemoteAudioAttached(true);

      if (audioRef.current) {
        audioRef.current.srcObject = stream;
        audioRef.current.play().catch(() => {});
      }
    };

    const dc = pc.createDataChannel("oai-events");
    dcRef.current = dc;

    dc.onopen = () => {
      setStatus("connected");

      dc.send(
        JSON.stringify({
          type: "session.update",
          session: {
            model: REALTIME_MODEL,
            temperature: TEMPERATURE,
            modalities: ["audio", "text"],
          },
        })
      );
    };

    dc.onmessage = async (ev) => {
      if (debug)
        await handleRealtimeEvent(ev.data);
    };

    pc.addTransceiver("audio", {
      direction: "sendrecv",
    });

    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

    setMicOn(true);

    stream.getTracks().forEach((t) => {
      const sender = pc.addTrack(t, stream);
      micSenderRef.current = sender;
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const sdpRes = await fetch(
      `https://api.openai.com/v1/realtime?model=${encodeURIComponent(
        sess.model
      )}`,
      {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL}`,
          "Content-Type": "application/sdp",
        },
      }
    );

    if (!sdpRes.ok) {
      const errText = await sdpRes.text();
      throw new Error(
        `OpenAI SDP exchange failed: ${errText}`
      );
    }

    const answerSdp = await sdpRes.text();
    await pc.setRemoteDescription({
      type: "answer",
      sdp: answerSdp,
    });

    setStatus("connected");
  }

  async function handleRealtimeEvent(raw) {
    let ev;
    try {
      ev = JSON.parse(raw);
    } catch {
      return;
    }

    const type = ev?.type;

    if (type === "response.audio.delta") {
      setAiSpeaking(true);
      muteMic();
      forcePlayAudio();
    }

    if (
      type === "response.audio.done" ||
      type === "output_audio_buffer.stopped"
    ) {
      setAiSpeaking(false);
      unmuteMic();
    }
  }

  /* ---------------- Pipecat ---------------- */

  async function startPipecatWebSocket() {
    const {
      PipecatClient,
      RTVIEvent,
    } = await import("@pipecat-ai/client-js");

    const {
      WebSocketTransport,
      ProtobufFrameSerializer,
    } = await import(
      "@pipecat-ai/websocket-transport"
    );

    const transport = new WebSocketTransport({
      wsUrl: PIPECAT_WS_URL,
      serializer: new ProtobufFrameSerializer(),
      recorderSampleRate: 16000,
      playerSampleRate: 16000,
    });

    const pcClient = new PipecatClient({
      transport,
      enableMic: true,
      enableCam: false,
    });

    pcClient.on(RTVIEvent.Connected, () => {
      setStatus("connected");
      setMicOn(true);
    });

    await pcClient.connect({ wsUrl: PIPECAT_WS_URL });

    pipecatRef.current = pcClient;
    setStatus("connected");
    setMicOn(true);
  }

  /* ---------------- UI ---------------- */

  return (
    <div
      style={{
        padding: 16,
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <h1>Voice</h1>

      <p>Status: {status}</p>
      {err && <p style={{ color: "red" }}>{err}</p>}

      <div style={{ marginTop: 10 }}>
        <select
          value={voiceEngine}
          onChange={(e) =>
            setVoiceEngine(e.target.value)
          }
        >
          <option value="openai_realtime">
            OpenAI Realtime
          </option>
          <option value="pipecat_ws">
            Pipecat WS
          </option>
        </select>

        <button onClick={start}>Start</button>
        <button onClick={stop}>Stop</button>
      </div>

      <div style={{ marginTop: 20 }}>
        <div>Mic: {micOn ? "ON" : "OFF"}</div>
        <div>
          AI speaking: {aiSpeaking ? "YES" : "NO"}
        </div>
      </div>

      <audio ref={audioRef} autoPlay playsInline />
    </div>
  );
}