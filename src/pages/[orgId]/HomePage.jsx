
import DashboardNavbar from "@/components/DashboardNavbar";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
function backendBaseUrl() {
  return (
    import.meta.env.VITE_GATEWAY_BASE_URL ||
    "http://localhost:3001"
  );
}

function brainBaseUrl() {
  return import.meta.env.VITE_BRAIN_BASE_URL || "http://localhost:8081";
}

const LS_SESSION_KEY = "hai_session_id";
const LS_MESSAGES_KEY = "hai_messages";
const LS_EXTERNAL_ID_KEY = "hai_external_id";

function formatSlotLabel(slot) {
  if (!slot.startAt || !slot.endAt) return "";
  const start = new Date(slot.startAt);
  const end = new Date(slot.endAt);

  const day = start.toLocaleDateString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const startTime = start.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${day} • ${startTime} - ${endTime}`;
}

function formatWhen(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

function langLabel(code) {
  if (!code) return "-";
  if (code === "mr") return "Marathi (mr)";
  if (code === "hi") return "Hindi (hi)";
  if (code === "en") return "English (en)";
  return code;
}

export default function HomePage() {
  const { orgId } = useParams();

  const [sessionId, setSessionId] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);
  const [externalId, setExternalId] = useState("");

  // const [showReception, setShowReception] = useState(false);
  // const [receptionStatus, setReceptionStatus] = useState("NEW");
  // const [emergencies, setEmergencies] = useState([]);
  // const [receptionBusy, setReceptionBusy] = useState(false);
  // const [receptionError, setReceptionError] = useState("");
  // const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const savedSession = localStorage.getItem(LS_SESSION_KEY) || "";

    let ext = localStorage.getItem(LS_EXTERNAL_ID_KEY) || "";
    if (!ext) {
      ext =
        (globalThis.crypto &&
          "randomUUID" in globalThis.crypto &&
          globalThis.crypto.randomUUID?.()) ||
        `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(LS_EXTERNAL_ID_KEY, ext);
    }
    setExternalId(ext);

    const savedMsgs = localStorage.getItem(LS_MESSAGES_KEY);
    if (savedSession) setSessionId(savedSession);

    if (savedMsgs) {
      try {
        setMessages(JSON.parse(savedMsgs));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_SESSION_KEY, sessionId || "");
  }, [sessionId]);

  useEffect(() => {
    localStorage.setItem(LS_MESSAGES_KEY, JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const canSend = useMemo(
    () => input.trim().length > 0 && !busy,
    [input, busy]
  );

  // const receptionApiUrl = useMemo(() => {
  //   const base = brainBaseUrl();
  //   const qs = receptionStatus
  //     ? `?status=${encodeURIComponent(receptionStatus)}`
  //     : "";
  //   return `${base}/api/v1/reception/emergencies${qs}`;
  // }, [receptionStatus]);

  async function ensureSession() {
    if (sessionId) return sessionId;

    setBusy(true);
    try {
      const res = await fetch(`${backendBaseUrl()}/v1/sessions/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "web",
          externalId: externalId || "local-dev-user",
          orgId: orgId,
        }),
      });

      if (!res.ok) throw new Error(`Resolve session failed: ${res.status}`);
      const data = await res.json();

      setSessionId(data.sessionId);
      return data.sessionId;
    } finally {
      setBusy(false);
    }
  }

  async function send(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", text: trimmed, ts: Date.now() }]);

    setBusy(true);
    try {
      const sid = await ensureSession();

      const res = await fetch(`${backendBaseUrl()}/v1/brain/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sid,
          text: trimmed,
          channel: "web",
          externalId: externalId || "local-dev-user",
          orgId: orgId,
        }),
      });

      if (!res.ok) {
        let msg = "Something went wrong";
        try {
          const err = await res.json();
          msg = err?.message || msg;
        } catch {}

        if (
          msg.toLowerCase().includes("slot") ||
          msg.toLowerCase().includes("available")
        ) {
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              text:
                "Sorry, that slot was just taken by another patient. Let me show you fresh availability…",
              ts: Date.now(),
            },
          ]);

          const sid = sessionId || (await ensureSession());

          const retry = await fetch(`${backendBaseUrl()}/v1/brain/message`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: sid,
              text: "show available slots",
              channel: "web",
              externalId,
              orgId,
            }),
          });

          if (retry.ok) {
            const data = await retry.json();
            setMessages((m) => [
              ...m,
              {
                role: "assistant",
                text: data.assistantText || "Here are new slots:",
                ts: Date.now(),
                actions: data.actions,
              },
            ]);
          }

          return;
        }

        throw new Error(msg);
      }

      const data = await res.json();

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: data.assistantText || "(no response)",
          ts: Date.now(),
          actions: data.actions,
        },
      ]);

      // const created = data.actions?.some(
      //   (a) => a.type === "EMERGENCY_CREATED"
      // );
      // if (created) {
      //   setShowReception(true);
      //   loadEmergencies();
      // }
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: `Error: ${e?.message || "unknown"}`,
          ts: Date.now(),
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function newChat() {
    localStorage.removeItem(LS_SESSION_KEY);
    localStorage.removeItem(LS_MESSAGES_KEY);

    const newExt =
      (globalThis.crypto &&
        "randomUUID" in globalThis.crypto &&
        globalThis.crypto.randomUUID?.()) ||
      `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    localStorage.setItem(LS_EXTERNAL_ID_KEY, newExt);
    setExternalId(newExt);

    setSessionId("");
    setMessages([]);
    setInput("");
  }

  // async function loadEmergencies() {
  //   setReceptionBusy(true);
  //   setReceptionError("");
  //   try {
  //     const res = await fetch(receptionApiUrl, { cache: "no-store" });
  //     if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  //     const data = await res.json();
  //     setEmergencies(Array.isArray(data) ? data : []);
  //   } catch (e) {
  //     setReceptionError(e?.message || "Failed to load emergencies");
  //   } finally {
  //     setReceptionBusy(false);
  //   }
  // }

  // async function updateEmergencyStatus(id, status) {
  //   setReceptionBusy(true);
  //   setReceptionError("");
  //   try {
  //     const res = await fetch(
  //       `${brainBaseUrl()}/api/v1/reception/emergencies/${id}/status?status=${encodeURIComponent(
  //         status
  //       )}`,
  //       { method: "POST" }
  //     );
  //     if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  //     await loadEmergencies();
  //   } catch (e) {
  //     setReceptionError(e?.message || "Failed to update status");
  //   } finally {
  //     setReceptionBusy(false);
  //   }
  // }

  // useEffect(() => {
  //   if (!showReception) return;
  //   loadEmergencies();
  // }, [showReception, receptionApiUrl]);

  // useEffect(() => {
  //   if (!showReception || !autoRefresh) return;
  //   const t = setInterval(() => {
  //     loadEmergencies();
  //   }, 4000);
  //   return () => clearInterval(t);
  // }, [showReception, autoRefresh, receptionApiUrl]);
  function handleLogout() {
  localStorage.removeItem("token");
  localStorage.removeItem(LS_SESSION_KEY);
  localStorage.removeItem(LS_MESSAGES_KEY);
  localStorage.removeItem(LS_EXTERNAL_ID_KEY);

  window.location.href = "/login";
}
  return (
    <div
      style={{ minHeight: "100vh", background: "#f9fafb", color: "#111827" }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "18px 16px" }}>
        {/* <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>
              Hospital AI Assistant — {orgId}
            </div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>
              Web + QR booking assistant • Backend: {backendBaseUrl()}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          > */}
        <header 
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  }}
>
  <div>
    <h1 style={{ fontSize: 24, fontWeight: 700 }}>
      Hospital AI Assistant
    </h1>
    <div style={{ fontSize: 13, color: "#6b7280" }}>
      Organization: {orgId}
    </div>
  </div>

   <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
    <DashboardNavbar />
  

            {/* <button
              onClick={() => setShowReception((v) => !v)}
              style={{
                padding: "8px 10px",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.16)",
                background: showReception
                  ? "rgba(59,130,246,0.20)"
                  : "transparent",
                color: "#e5e7eb",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              {showReception ? "Hide Reception" : "Reception Dashboard"}
            </button> */}

            
              <Link
  to={`/${orgId}/qr`}
  style={{
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    fontSize: 13,
    color: "rgb(255, 255, 255)",
    background: "#ef4444",
  }}
>
  QR
</Link>
            <button
  onClick={newChat}
  style={{
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #e5e7eb",
    background: "#FF4242",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: 13,
  }}
>
  New chat
</button>
{/* Logout */}
  <button
    onClick={handleLogout}
    style={{
      padding: "8px 12px",
      borderRadius: 10,
      border: "1px solid #e5e7eb",
      background: "#ef4444",
      color: "#ffffff",
      cursor: "pointer",
      fontSize: 13,
    }}
  >
    Logout
  </button>
            {/* <Link to="/login">
              <button
                style={{
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: "transparent",
                  color: "#e5e7eb",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Login
              </button>
            </Link> */}
          </div>
        </header>

        <main style={{ marginTop: 14 }}>
          <div
            style={{
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 12,
}}
          >
            {/* CHAT PANEL */}
            <div
              style={{
                background: "#ffffff",
border: "1px solid #e5e7eb",
boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                borderRadius: 14,
                padding: 12,
                minHeight: "70vh",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 10,
                  opacity: 0.8,
                }}
              >
                <div style={{ fontSize: 12 }}>
                  Session:{" "}
                  <span
                    style={{
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
                    }}
                  >
                    {sessionId || "(not created yet)"}
                  </span>
                </div>
                <div style={{ fontSize: 12 }}>
                  {busy ? "Thinking…" : "Ready"}
                </div>
              </div>

              <div style={{ flex: 1, overflowY: "auto", paddingRight: 6 }}>
                {messages.length === 0 ? (
                  <div style={{ padding: 14, opacity: 0.85, lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>Try:</div>
                    <ul style={{ marginTop: 0 }}>
                      <li>“मला ताप आहे, उद्या संध्याकाळी अपॉइंटमेंट हवी”</li>
                      <li>“मुझे बुखार है, कल शाम अपॉइंटमेंट चाहिए”</li>
                      <li>“I have fever, need appointment tomorrow evening”</li>
                      <li>“cancel my appointment, my number is 9876543210”</li>
                      <li>
                        “reschedule my appointment, my number is 9876543210”
                      </li>
                      <li>
                        “माझ्या छातीत खूप दुखतंय आणि श्वास घेता येत नाही”
                        (Emergency)
                      </li>
                    </ul>
                  </div>
                ) : (
                  messages.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent:
                          m.role === "user" ? "flex-end" : "flex-start",
                        margin: "10px 0",
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "78%",
                          whiteSpace: "pre-wrap",
                          padding: "10px 12px",
                          borderRadius: 14,
                          lineHeight: 1.4,
                          background:
  m.role === "user"
    ? "#e0f2fe"
    : "#f3f4f6",
                          border: "1px solid rgba(255,255,255,0.10)",
                        }}
                      >
                        {m.text}
                        <div
                          style={{ marginTop: 6, fontSize: 11, opacity: 0.7 }}
                        >
                          {new Date(m.ts).toLocaleTimeString()}
                        </div>

                        {/* ACTIONS UI (SLOTS + APPOINTMENTS + EMERGENCY) */}
                        {m.role === "assistant" &&
                          m.actions?.map((a, i) => {
                            if (a.type === "EMERGENCY_CREATED") {
                              const id = a.payload?.emergencyId ?? "-";
                              const status = a.payload?.status;

                              return (
                                <div
                                  key={i}
                                  style={{
                                    marginTop: 10,
                                    padding: 12,
                                    borderRadius: 12,
                                    background: "rgba(239,68,68,0.18)",
                                    border: "1px solid rgba(239,68,68,0.45)",
                                    lineHeight: 1.4,
                                  }}
                                >
                                  <div style={{ fontWeight: 800 }}>
                                    🚨 Emergency request forwarded to
                                    receptionist
                                  </div>
                                  <div
                                    style={{
                                      marginTop: 6,
                                      fontSize: 13,
                                      opacity: 0.95,
                                    }}
                                  >
                                    Reference ID:{" "}
                                    <span
                                      style={{
                                        fontFamily:
                                          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
                                      }}
                                    >
                                      {String(id)}
                                    </span>
                                    {status ? ` • Status: ${status}` : ""}
                                  </div>
                                  <div
                                    style={{
                                      marginTop: 6,
                                      fontSize: 13,
                                      opacity: 0.9,
                                    }}
                                  >
                                    Please go to the emergency desk immediately
                                    or wait for a call.
                                  </div>
                                </div>
                              );
                            }

                            if (a.type === "EMERGENCY_ALREADY_CREATED") {
                              const id = a.payload?.emergencyId ?? "-";
                              return (
                                <div
                                  key={i}
                                  style={{
                                    marginTop: 10,
                                    padding: 12,
                                    borderRadius: 12,
                                    background: "rgba(239,68,68,0.12)",
                                    border: "1px solid rgba(239,68,68,0.35)",
                                    lineHeight: 1.4,
                                  }}
                                >
                                  <div style={{ fontWeight: 800 }}>
                                    🚨 Emergency request already raised
                                  </div>
                                  <div
                                    style={{
                                      marginTop: 6,
                                      fontSize: 13,
                                      opacity: 0.95,
                                    }}
                                  >
                                    Reference ID:{" "}
                                    <span
                                      style={{
                                        fontFamily:
                                          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
                                      }}
                                    >
                                      {String(id)}
                                    </span>
                                  </div>
                                </div>
                              );
                            }

                            if (a.type === "APPOINTMENT_CANCELLED") {
                              const id = a.payload?.appointmentId ?? "-";
                              return (
                                <div
                                  key={i}
                                  style={{
                                    marginTop: 10,
                                    padding: 12,
                                    borderRadius: 12,
                                    background: "#FF4242",
color: "#ffffff",
                                    border: "1px solid rgba(59,130,246,0.35)",
                                    lineHeight: 1.4,
                                  }}
                                >
                                  <div style={{ fontWeight: 800 }}>
                                    ✅ Appointment cancelled
                                  </div>
                                  <div
                                    style={{
                                      marginTop: 6,
                                      fontSize: 13,
                                      opacity: 0.95,
                                    }}
                                  >
                                    Appointment ID:{" "}
                                    <span
                                      style={{
                                        fontFamily:
                                          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
                                      }}
                                    >
                                      {String(id)}
                                    </span>
                                  </div>
                                </div>
                              );
                            }

                            if (a.type === "APPOINTMENT_RESCHEDULED") {
                              const fromId =
                                a.payload?.fromAppointmentId ?? "-";
                              const toId = a.payload?.toAppointmentId ?? "-";
                              return (
                                <div
                                  key={i}
                                  style={{
                                    marginTop: 10,
                                    padding: 12,
                                    borderRadius: 12,
                                    background: "rgba(34,197,94,0.14)",
                                    border: "1px solid rgba(34,197,94,0.35)",
                                    lineHeight: 1.4,
                                  }}
                                >
                                  <div style={{ fontWeight: 800 }}>
                                    ✅ Appointment rescheduled
                                  </div>
                                  <div
                                    style={{
                                      marginTop: 6,
                                      fontSize: 13,
                                      opacity: 0.95,
                                    }}
                                  >
                                    Old ID:{" "}
                                    <span
                                      style={{
                                        fontFamily:
                                          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
                                      }}
                                    >
                                      {String(fromId)}
                                    </span>
                                    {"  "}→ New ID:{" "}
                                    <span
                                      style={{
                                        fontFamily:
                                          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
                                      }}
                                    >
                                      {String(toId)}
                                    </span>
                                  </div>
                                </div>
                              );
                            }

                            if (a.type === "APPOINTMENT_OPTIONS") {
                              const appts = a.payload || [];
                              if (!Array.isArray(appts) || appts.length === 0)
                                return null;

                              return (
                                <div
                                  key={i}
                                  style={{
                                    marginTop: 10,
                                    display: "grid",
                                    gap: 8,
                                  }}
                                >
                                  {appts.map((p, pi) => {
                                    const label = formatSlotLabel(p);
                                    const optionNum = p.option ?? pi + 1;
                                    const apptId = p.appointmentId;

                                    return (
                                      <div
                                        key={`${optionNum}-${apptId || pi}`}
                                        style={{
                                          padding: "10px 10px",
                                          borderRadius: 12,
                                          border:
                                            "1px solid rgba(255,255,255,0.14)",
                                          background: "#f9fafb",
border: "1px solid #e5e7eb",
                                          display: "flex",
                                          justifyContent: "space-between",
                                          gap: 10,
                                          alignItems: "center",
                                        }}
                                      >
                                        <div style={{ minWidth: 0 }}>
                                          <div
                                            style={{
                                              fontWeight: 700,
                                              fontSize: 13,
                                            }}
                                          >
                                            Option {optionNum}
                                            {apptId ? (
                                              <span
                                                style={{
                                                  opacity: 0.85,
                                                  fontWeight: 500,
                                                }}
                                              >
                                                {" "}
                                                • ID{" "}
                                                <span
                                                  style={{
                                                    fontFamily:
                                                      "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
                                                  }}
                                                >
                                                  {String(apptId)}
                                                </span>
                                              </span>
                                            ) : null}
                                          </div>

                                          {label && (
                                            <div
                                              style={{
                                                fontSize: 12,
                                                opacity: 0.92,
                                              }}
                                            >
                                              {label}
                                            </div>
                                          )}

                                          <div
                                            style={{
                                              fontSize: 12,
                                              opacity: 0.85,
                                            }}
                                          >
                                            {p.doctorName || "Doctor"}
                                            {p.department
                                              ? ` • ${p.department}`
                                              : ""}
                                            {p.status ? ` • ${p.status}` : ""}
                                          </div>
                                        </div>

                                        <button
                                          onClick={() =>
                                            send(String(optionNum))
                                          }
                                          style={{
                                            padding: "8px 10px",
                                            borderRadius: 10,
                                            border:
                                              "1px solid rgba(255,255,255,0.14)",
                                            background: "#FF4242",
color: "#ffffff",
                                            cursor: "pointer",
                                            whiteSpace: "nowrap",
                                          }}
                                        >
                                          Select
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            }

                            if (a.type === "SLOT_OPTIONS") {
                              const slots = a.payload || [];
                              if (!Array.isArray(slots) || slots.length === 0)
                                return null;

                              return (
                                <div
                                  key={i}
                                  style={{
                                    marginTop: 10,
                                    display: "grid",
                                    gap: 8,
                                  }}
                                >
                                  {slots.map((s, si) => {
                                    const label = formatSlotLabel(s);
                                    const optionNum = s.option ?? si + 1;

                                    return (
                                      <div
                                        key={`${optionNum}-${s.startAt || si}`}
                                        style={{
                                          padding: "10px 10px",
                                          borderRadius: 12,
                                          border:
                                            "1px solid rgba(255,255,255,0.14)",
                                          background: "#f9fafb",
border: "1px solid #e5e7eb",
                                          display: "flex",
                                          justifyContent: "space-between",
                                          gap: 10,
                                          alignItems: "center",
                                        }}
                                      >
                                        <div style={{ minWidth: 0 }}>
                                          <div
                                            style={{
                                              fontWeight: 700,
                                              fontSize: 13,
                                            }}
                                          >
                                            Option {optionNum}
                                          </div>
                                          {label && (
                                            <div
                                              style={{
                                                fontSize: 12,
                                                opacity: 0.92,
                                              }}
                                            >
                                              {label}
                                            </div>
                                          )}
                                          <div
                                            style={{
                                              fontSize: 12,
                                              opacity: 0.85,
                                            }}
                                          >
                                            {s.doctorName || "Doctor"}
                                            {s.department
                                              ? ` • ${s.department}`
                                              : ""}
                                          </div>
                                        </div>
<button
  onClick={() => send(String(optionNum))}
  style={{
    padding: "8px 12px",
    borderRadius: 10,
    border: "none",
    background: "#FF4242",
    color: "#ffffff",
    cursor: "pointer",
    whiteSpace: "nowrap",
  }}
>
  Select
</button>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            }

                            return null;
                          })}
                      </div>
                    </div>
                  ))
                )}

                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (canSend) send(input);
                }}
                style={{ display: "flex", gap: 10, marginTop: 12 }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message… (Marathi/Hindi/English)"
                  style={{
                    flex: 1,
                    padding: "12px 12px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: "#ffffff",
color: "#111827",
border: "1px solid #e5e7eb",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.14)",
                    background: canSend ? "#FF4242" : "#e5e7eb",
color: canSend ? "#ffffff" : "#9ca3af",
                    cursor: canSend ? "pointer" : "not-allowed",
                    minWidth: 90,
                  }}
                >
                  Send
                </button>
              </form>
            </div>

            {/* RECEPTION PANEL
            {showReception && (
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 14,
                  padding: 12,
                  minHeight: "70vh",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontWeight: 800 }}>Reception Dashboard</div>
                  <button
                    onClick={() => void loadEmergencies()}
                    disabled={receptionBusy}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.16)",
                      background: "transparent",
                      color: "#e5e7eb",
                      cursor: receptionBusy ? "not-allowed" : "pointer",
                      fontSize: 13,
                    }}
                  >
                    {receptionBusy ? "Loading…" : "Refresh"}
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    marginTop: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <select
                    value={receptionStatus}
                    onChange={(e) => setReceptionStatus(e.target.value)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.16)",
                      background: "rgba(255,255,255,0.03)",
                      color: "#e5e7eb",
                      outline: "none",
                      fontSize: 13,
                    }}
                  >
                    <option value="NEW">NEW</option>
                    <option value="FORWARDED">FORWARDED</option>
                    <option value="CLOSED">CLOSED</option>
                    <option value="">ALL</option>
                  </select>

                  <label
                    style={{
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      fontSize: 13,
                      opacity: 0.95,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={autoRefresh}
                      onChange={(e) => setAutoRefresh(e.target.checked)}
                    />
                    Auto-refresh
                  </label>
                </div>

                <div
                  style={{
                    marginTop: 10,
                    fontSize: 11,
                    opacity: 0.75,
                    lineHeight: 1.4,
                  }}
                >
                  <div>
                    Endpoint:{" "}
                    <span
                      style={{
                        fontFamily:
                          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
                      }}
                    >
                      {receptionApiUrl}
                    </span>
                  </div>
                  <div>
                    {receptionBusy
                      ? "Updating…"
                      : `Showing ${emergencies.length} item(s)`}
                  </div>
                </div>

                {receptionError && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: 10,
                      borderRadius: 12,
                      background: "rgba(239,68,68,0.14)",
                      border: "1px solid rgba(239,68,68,0.35)",
                      fontSize: 13,
                    }}
                  >
                    {receptionError}
                  </div>
                )}

                <div
                  style={{
                    marginTop: 10,
                    overflowY: "auto",
                    flex: 1,
                    paddingRight: 4,
                  }}
                >
                  {emergencies.length === 0 ? (
                    <div style={{ padding: 12, opacity: 0.85 }}>
                      No emergencies found.
                    </div>
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      {emergencies.map((er) => (
                        <div
                          key={er.id}
                          style={{
                            padding: 12,
                            borderRadius: 14,
                            border: "1px solid rgba(255,255,255,0.12)",
                            background: "rgba(0,0,0,0.25)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 10,
                              alignItems: "flex-start",
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  display: "flex",
                                  gap: 10,
                                  alignItems: "center",
                                  flexWrap: "wrap",
                                }}
                              >
                                <div style={{ fontWeight: 900 }}>
                                  🚨 #{er.id}
                                </div>
                                <div
                                  style={{
                                    fontSize: 12,
                                    padding: "2px 8px",
                                    borderRadius: 999,
                                    border: "1px solid rgba(255,255,255,0.14)",
                                    background:
                                      er.status === "NEW"
                                        ? "rgba(239,68,68,0.18)"
                                        : er.status === "FORWARDED"
                                          ? "rgba(59,130,246,0.18)"
                                          : "rgba(34,197,94,0.18)",
                                  }}
                                >
                                  {er.status || "-"}
                                </div>
                                <div style={{ fontSize: 12, opacity: 0.85 }}>
                                  {formatWhen(er.createdAt)}
                                </div>
                              </div>

                              <div
                                style={{
                                  marginTop: 8,
                                  fontSize: 13,
                                  opacity: 0.95,
                                  lineHeight: 1.5,
                                }}
                              >
                                <div>
                                  <b>Name:</b> {er.patientName || "-"}
                                </div>
                                <div>
                                  <b>Phone:</b>{" "}
                                  {er.phone ? (
                                    <a
                                      href={`tel:${er.phone}`}
                                      style={{ color: "#e5e7eb" }}
                                    >
                                      {er.phone}
                                    </a>
                                  ) : (
                                    "-"
                                  )}
                                </div>
                                <div>
                                  <b>Language:</b> {langLabel(er.language)}
                                </div>
                                <div style={{ marginTop: 8 }}>
                                  <b>Symptoms:</b> {er.symptoms || "-"}
                                </div>
                                <div style={{ marginTop: 6 }}>
                                  <b>Summary:</b> {er.handoverSummary || "-"}
                                </div>
                                <div
                                  style={{
                                    marginTop: 8,
                                    fontSize: 11,
                                    opacity: 0.8,
                                  }}
                                >
                                  <b>Session:</b>{" "}
                                  <span
                                    style={{
                                      fontFamily:
                                        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas",
                                    }}
                                  >
                                    {er.sessionId || "-"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div
                              style={{ display: "grid", gap: 8, minWidth: 150 }}
                            >
                              <button
                                onClick={() =>
                                  void updateEmergencyStatus(er.id, "FORWARDED")
                                }
                                disabled={
                                  receptionBusy ||
                                  er.status === "FORWARDED" ||
                                  er.status === "CLOSED"
                                }
                                style={{
                                  padding: "9px 10px",
                                  borderRadius: 12,
                                  border: "1px solid rgba(255,255,255,0.14)",
                                  background: "rgba(59,130,246,0.18)",
                                  color: "#e5e7eb",
                                  cursor: receptionBusy
                                    ? "not-allowed"
                                    : "pointer",
                                  opacity:
                                    er.status === "FORWARDED" ||
                                    er.status === "CLOSED"
                                      ? 0.55
                                      : 1,
                                }}
                              >
                                FORWARDED
                              </button>
                              <button
                                onClick={() =>
                                  void updateEmergencyStatus(er.id, "CLOSED")
                                }
                                disabled={
                                  receptionBusy || er.status === "CLOSED"
                                }
                                style={{
                                  padding: "9px 10px",
                                  borderRadius: 12,
                                  border: "1px solid rgba(255,255,255,0.14)",
                                  background: "rgba(34,197,94,0.18)",
                                  color: "#e5e7eb",
                                  cursor: receptionBusy
                                    ? "not-allowed"
                                    : "pointer",
                                  opacity: er.status === "CLOSED" ? 0.55 : 1,
                                }}
                              >
                                CLOSED
                              </button>
                              {er.phone ? (
                                <a
                                  href={`tel:${er.phone}`}
                                  style={{
                                    textAlign: "center",
                                    padding: "9px 10px",
                                    borderRadius: 12,
                                    border: "1px solid rgba(255,255,255,0.14)",
                                    background: "rgba(255,255,255,0.06)",
                                    color: "#e5e7eb",
                                    textDecoration: "none",
                                  }}
                                >
                                  Call
                                </a>
                              ) : (
                                <div
                                  style={{
                                    textAlign: "center",
                                    padding: "9px 10px",
                                    borderRadius: 12,
                                    border: "1px solid rgba(255,255,255,0.10)",
                                    background: "rgba(255,255,255,0.03)",
                                    color: "#e5e7eb",
                                    opacity: 0.6,
                                    fontSize: 13,
                                  }}
                                >
                                  No phone
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div> */}

          {/* <div
            style={{
              marginTop: 12,
              fontSize: 12,
              opacity: 0.85,
              lineHeight: 1.5,
            }}
          >
            Tip: Click <b>Reception Dashboard</b> to open the receptionist
            panel. It auto-refreshes every 4 seconds.
          </div> */}
          </div> 
        </main>
      </div>
    </div>
  );
}
