import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001", {
  transports: ["websocket"],
  reconnection: true,
});

export default function WhatsAppWeb() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/api/conversations")
      .then(res => res.json())
      .then(setConversations);
  }, []);

  const openChat = async (conv) => {
    setSelected(conv);

    const res = await fetch(
      `http://localhost:3001/api/messages/${conv.id}`
    );
    const data = await res.json();
    setMessages(data);
  };

  useEffect(() => {
    socket.on("new-message", ({ conversationId, message }) => {

      if (selected?.id === conversationId) {
        setMessages(prev => [...prev, message]);
      }

      setConversations(prev => {
        const exists = prev.find(c => c.id === conversationId);

        if (!exists) {
          fetch("http://localhost:3001/api/conversations")
            .then(res => res.json())
            .then(setConversations);
          return prev;
        }

        return prev.map(c =>
          c.id === conversationId
            ? { ...c, last_message: message.text_message || "Media" }
            : c
        );
      });
    });

    return () => {
      socket.off("new-message");
    };
  }, [selected]);

  return (
    <div style={styles.container}>

      {/* LEFT SIDEBAR */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <h3>Hospital AI Chat</h3>
        </div>

        {conversations.map(c => (
          <div
            key={c.id}
            onClick={() => openChat(c)}
            style={{
              ...styles.chatItem,
              background: selected?.id === c.id ? "#eef2ff" : ""
            }}
          >
            <div style={styles.avatar}>
  {(c.phone_number || "NA").slice(-2)}
</div>

            <div style={{ flex: 1 }}>
              <div style={styles.chatName}>
                {c.phone_number}
              </div>

              <div style={styles.preview}>
                {c.last_message}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div style={styles.chatWindow}>
        {!selected && (
          <div style={styles.empty}>
            Select a conversation
          </div>
        )}

        {selected && (
          <>
            <div style={styles.chatHeader}>
              <div style={styles.headerAvatar}>
  {(selected?.phone_number || "NA").slice(-2)}
</div>

              <div>
                <b>{selected.phone_number}</b>
                <div style={{fontSize:12,color:"#777"}}>
                  WhatsApp Patient
                </div>
              </div>
            </div>

            <div style={styles.messages}>
              {messages.map((m, index) => (
                <MessageBubble key={m.id || index} msg={m} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ msg }) {
  const isBot = msg.direction === "OUTBOUND";

  return (
    <div
      style={{
        ...styles.bubble,
        alignSelf: isBot ? "flex-end" : "flex-start",
        background: isBot ? "rgb(235, 37, 37)" : "#ffffff",
        color: isBot ? "#fff" : "#000"
      }}
    >
      {msg.type === "text" && msg.text_message}

      {msg.type === "image" && (
        <img
          src={`http://localhost:3001${msg.media_url}`}
          style={{ maxWidth: 260, borderRadius: 10 }}
        />
      )}

      {msg.type === "audio" && (
        <audio controls style={{ width: 220 }}>
          <source
            src={`http://localhost:3001${msg.media_url}`}
            type="audio/ogg"
          />
        </audio>
      )}

      {msg.type === "video" && (
        <video controls style={{ maxWidth: 260 }}>
          <source
            src={`http://localhost:3001${msg.media_url}`}
            type="video/mp4"
          />
        </video>
      )}

      {msg.type === "document" && (
        <a
          href={`http://localhost:3001${msg.media_url}`}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.document}
        >
          📄 Download Document
        </a>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Inter, sans-serif",
    background: "#f5f7fb"
  },

  sidebar: {
    width: 320,
    borderRight: "1px solid #e5e7eb",
    background: "#fff",
    overflowY: "auto"
  },

  sidebarHeader: {
    padding: 16,
    fontWeight: "bold",
    borderBottom: "1px solid #eee",
    background: "rgb(235, 37, 37)",
    color: "#fff"
  },

  chatItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 14,
    cursor: "pointer",
    borderBottom: "1px solid #f1f1f1",
    transition: "all .2s"
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "rgb(235, 37, 37)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold"
  },

  chatName: {
    fontWeight: "600",
    fontSize: 14
  },

  preview: {
    fontSize: 12,
    color: "#777"
  },

  chatWindow: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },

  chatHeader: {
    padding: 16,
    borderBottom: "1px solid #eee",
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#fff"
  },

  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "rgb(235, 37, 37)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold"
  },

  messages: {
    flex: 1,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    overflowY: "auto",
    background: "#f3f4f6"
  },

  bubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: "60%",
    fontSize: 14,
    boxShadow: "0 2px 4px rgba(0,0,0,0.08)"
  },

  document: {
    color: "rgb(235, 37, 37)",
    fontWeight: "bold",
    textDecoration: "none"
  },

  empty: {
    margin: "auto",
    color: "#888",
    fontSize: 18
  }
};