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
      
      {/* LEFT PANEL */}
      <div style={styles.sidebar}>
        <h3 style={styles.header}>Chats</h3>

        {conversations.map(c => (
          <div
            key={c.id}
            onClick={() => openChat(c)}
            style={{
              ...styles.chatItem,
              background: selected?.id === c.id ? "#e5ddd5" : ""
            }}
          >
            <b>{c.phone_number}</b>
            <div style={styles.preview}>{c.last_message}</div>
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div style={styles.chatWindow}>
        {!selected && <div>Select a chat</div>}

        {selected && (
          <>
            <div style={styles.chatHeader}>
              {selected.phone_number}
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
        background: isBot ? "#56bb09" : "#e51818"
      }}
    >
      {msg.type === "text" && msg.text_message}

      {msg.type === "image" && (
        <img 
  src={`http://localhost:3001${msg.media_url}`} 
  style={{ maxWidth: 250, borderRadius: 8 }}
/>
      )}
      {msg.type === "audio" && (
  <audio controls style={{ width: 220 }}>
    <source 
      src={`http://localhost:3001${msg.media_url}`} 
      type="audio/ogg"
    />
    Your browser does not support audio.
  </audio>
)}
{msg.type === "video" && (
  <video
    controls
    style={{ maxWidth: 260, borderRadius: 8 }}
  >
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
    style={{
      color: "#075e54",
      fontWeight: "bold",
      textDecoration: "none"
    }}
  >
    📄 Download document
  </a>
)}

    </div>
  );
}
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial"
  },
  sidebar: {
    width: 300,
    borderRight: "1px solid #ddd",
    overflowY: "auto"
  },
  header: {
    padding: 12,
    borderBottom: "1px solid #ddd"
  },
  chatItem: {
    padding: 12,
    cursor: "pointer",
    borderBottom: "1px solid #eee"
  },
  preview: {
    fontSize: 12,
    color: "#666"
  },
  chatWindow: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },
  chatHeader: {
    padding: 12,
    borderBottom: "1px solid #ddd",
    fontWeight: "bold"
  },
  messages: {
    flex: 1,
    padding: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflowY: "auto",
    background: "#ece5dd"
  },
  bubble: {
    padding: 10,
    borderRadius: 8,
    maxWidth: "60%",
    boxShadow: "0 1px 1px rgba(0,0,0,.1)"
  }
};
