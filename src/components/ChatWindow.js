import React, { useState, useEffect, useRef } from "react";
import "./ChatWindow.css";
import { getAIMessage } from "../api/api";
import { marked } from "marked";

function ChatWindow() {
  const defaultMessage = [{ role: "assistant", content: "Hi, how can I help you today?" }];

  const [messages, setMessages] = useState(defaultMessage);   // no localStorage
  const [input, setInput] = useState("");                     // no localStorage
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    const text = String(input ?? "").trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const newMessage = await getAIMessage(text);
      setMessages(prev => [...prev, newMessage]);
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
              <div
                dangerouslySetInnerHTML={{
                  __html: marked(m.content).replace(/<p>|<\/p>/g, "")
                }}
              />
            </div>
          )}
        </div>
      ))}

      {loading && (
        <div className="assistant-message-container">
          <div className="message assistant-message skeleton">
            <div className="s-rows"><span className="s-row"/><span className="s-row short"/></div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={loading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button className="send-button" onClick={handleSend} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
