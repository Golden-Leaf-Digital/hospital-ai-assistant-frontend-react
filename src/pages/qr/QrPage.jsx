import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
function frontendBaseUrl() {
  return window.location.origin || "http://localhost:3000";
}

export default function QrPage() {
  const [dataUrl, setDataUrl] = useState("");
  const { orgId } = useParams();
  const chatUrl = useMemo(
  () => `${frontendBaseUrl()}/${orgId}`,
  [orgId]
);
  
  useEffect(() => {
    (async () => {
      const url = await QRCode.toDataURL(chatUrl, {
        margin: 1,
        width: 340,
      });
      setDataUrl(url);
    })();
  }, [chatUrl]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b1220",
        color: "#e5e7eb",
      }}
    >
      <div
        style={{
          maxWidth: 820,
          margin: "0 auto",
          padding: "18px 16px",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div
              style={{ fontSize: 18, fontWeight: 700 }}
            >
              QR for Web Chat
            </div>
            <div
              style={{ fontSize: 12, opacity: 0.8 }}
            >
              Print this and place it at reception/OPD
            </div>
          </div>

          <Link
  to={`/${orgId}/webchat`}
  style={{
    textDecoration: "none",
    color: "#e5e7eb",
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.16)",
    fontSize: 13,
  }}
>
  Back to chat
</Link>
        </header>

        <main style={{ marginTop: 18 }}>
          <div
            style={{
              display: "flex",
              gap: 18,
              alignItems: "flex-start",
              flexWrap: "wrap",
              background: "rgba(255,255,255,0.04)",
              border:
                "1px solid rgba(255,255,255,0.10)",
              borderRadius: 14,
              padding: 14,
            }}
          >
            <div
              style={{
                width: 360,
                height: 360,
                borderRadius: 14,
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {dataUrl ? (
                <img
                  src={dataUrl}
                  alt="QR Code"
                  style={{
                    width: 340,
                    height: 340,
                  }}
                />
              ) : (
                <div style={{ color: "#111827" }}>
                  Generating…
                </div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 240 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  marginBottom: 8,
                }}
              >
                Hospital AI Assistant
              </div>

              <div
                style={{
                  opacity: 0.9,
                  lineHeight: 1.6,
                }}
              >
                <div>
                  <b>Scan to book appointment</b>
                </div>

                <div style={{ marginTop: 10 }}>
                  Link:
                </div>

                <code
                  style={{
                    display: "block",
                    marginTop: 6,
                    padding: 10,
                    borderRadius: 10,
                    background:
                      "rgba(0,0,0,0.35)",
                  }}
                >
                  {chatUrl}
                </code>

                <div
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    opacity: 0.9,
                  }}
                >
                  Supports Marathi / Hindi /
                  English.
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}