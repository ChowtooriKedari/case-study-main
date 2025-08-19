import React, { useState, useEffect, useRef } from "react";
import "./ChatWindow.css";
import { getAIMessage } from "../api/api";
import { marked } from "marked";

const MODES = [
  { id: "catalog", label: "Product Catalog" },
  { id: "orders", label: "Order Support" },
  { id: "issues", label: "Product Issues" },
  { id: "other", label: "Other" },
];

function ChatWindow() {
  const [mode, setMode] = useState(null); // NEW
  const [messages, setMessages] = useState([
    { role: "assistant", content: "What do you need help with today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages, loading, mode]);

  // choose a mode
  const selectMode = (m) => {
    setMode(m);
    setMessages(prev => [
      ...prev,
      { role: "user", content: MODES.find(x => x.id === m)?.label || m },
      { role: "assistant", content:
        m === "catalog" ? "Great! Ask me to find parts by part/model/brand." :
        m === "orders"  ? "Sure, give me your email to see your order history." :
        m === "issues"  ? "Okay, describe the issue or ask about install/compatibility." :
                          "I can help with refrigerators & dishwashers only. What would you like to know?"
      }
    ]);
  };

// inside ChatWindow
const handleSend = async () => {
  const text = String(input ?? "").trim();
  if (!text || loading) return;

  if (!mode) {
    setMessages(prev => [...prev,
      { role: "assistant", content: "Please select Product Catalog, Order Support, Product Issues, or Other." }
    ]);
    return;
  }

  setMessages(prev => [...prev, { role: "user", content: text }]);
  setInput("");
  setLoading(true);
  try {
    const data = await getAIMessage(text, mode);   // <-- PASS THE MODE
    setMessages(prev => [...prev, { role: "assistant", content: data.answer }]);
  } catch {
    setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong." }]);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="messages-container" aria-live="polite">
      {messages.map((m, i) => (
        <div key={i} className={`${m.role}-message-container`}>
          {m.content && (
            <div className={`message ${m.role}-message`}>
              <div dangerouslySetInnerHTML={{ __html: marked(m.content).replace(/<p>|<\/p>/g, "") }} />
            </div>
          )}
        </div>
      ))}

      {/* Mode picker appears ONLY until user chooses a mode */}
      {!mode && (
        <div className="assistant-message-container">
          <div className="message assistant-message">
            <div className="quick-row">
              {MODES.map((m) => (
                <button key={m.id} className="pill" onClick={() => selectMode(m.id)}>{m.label}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Skeleton while waiting */}
      {loading && (
        <div className="assistant-message-container">
          <div className="message assistant-message skeleton">
            <div className="s-rows"><span className="s-row"/><span className="s-row short"/></div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />

      {/* Input row */}
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode ? "Type your message..." : "Select an option above to begin"}
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
          }}
        />
        <button className="send-button" onClick={handleSend} disabled={loading}>Send</button>
      </div>
    </div>
  );
}

export default ChatWindow;
