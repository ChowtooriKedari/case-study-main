import React, { useState, useEffect, useRef } from "react";
import "./ChatWindow.css";
import { getAIMessage } from "../api/api";
import { marked } from "marked";

const MODES = [
  { id: "catalog", label: "Product Catalog" },
  { id: "orders",  label: "Order Support" },
  { id: "issues",  label: "Product Issues" },
];

function ChatWindow() {
  const [mode, setMode] = useState(null);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "What do you need help with today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages, loading, mode]);

  const selectMode = (m) => {
    setMode(m);
    setMessages(prev => [
      ...prev,
      { role: "user", content: MODES.find(x => x.id === m)?.label || m },
      { role: "assistant", content:
        m === "catalog" ? "Great! Ask me to find parts by part/model/brand." :
        m === "orders"  ? "Sure, share the email used for the order to see your history." :
                          "Okay, describe the issue or ask about install/compatibility."
      }
    ]);
  };

  const handleSend = async () => {
    const text = String(input ?? "").trim();
    if (!text || loading) return;

    if (!mode) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Please select Product Catalog, Order Support, or Product Issues."
      }]);
      return;
    }

    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await getAIMessage(text, mode);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: res.answer || "",
          products: res.products || [],
          orders: res.orders || [],
          follow_up: res.follow_up || []
        }
      ]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant", content: "Sorry, something went wrong."
      }]);
    } finally {
      setLoading(false);
    }
  };

const handleSuggestion = React.useCallback((text) => {
  setInput(text);
}, []);


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
              {/* {Array.isArray(m.follow_up) && m.follow_up.length > 0 && (
                <div className="quick-row">
                  {m.follow_up.map((q, idx) => (
                    <button
  key={idx}
  className="pill"
  onClick={() => handleSuggestion(q)}
>
  {q}
</button>

                  ))}
                </div>
              )} */}

              {/* Product cards */}
              {Array.isArray(m.products) && m.products.length > 0 && (
                <div className="product-grid">
                  {m.products.map((p) => (
                    <div key={p.part_id || p.title} className="product-card">
                      <div className="pc-title">{p.title}</div>
                      {(p.brand || p.category) && (
                        <div className="pc-meta">
                          {[p.brand, p.category].filter(Boolean).join(" • ")}
                        </div>
                      )}
                      {p.part_id && <div className="pc-id">Part: {p.part_id}</div>}
                      {p.price != null && <div className="pc-price">${Number(p.price).toFixed(2)}</div>}
                      {/* {p.part_select_url && (
                        <a className="pc-link" href={p.part_select_url} target="_blank" rel="noreferrer">
                          View on PartSelect
                        </a>
                      )} */}
                    </div>
                  ))}
                </div>
              )}

              {/* Order cards */}
              {Array.isArray(m.orders) && m.orders.length > 0 && (
                <div className="order-list">
                  {m.orders.slice(0, 5).map((o) => (
                    <div key={o.order_id} className="order-card">
                      <div className="oc-head">
                        <strong>{o.order_id}</strong> • {o.status} • {o.created_at}
                      </div>
                      <ul className="oc-items">
                        {(o.items || []).map((it, idx) => (
                          <li key={`${o.order_id}-${idx}`}>
                            {it.title} ×{it.qty}{it.part_id ? ` (Part ${it.part_id})` : ""}
                            {typeof it.price === "number" ? ` — $${it.price.toFixed(2)}` : ""}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Mode picker (shown only until a mode is chosen) */}
      {!mode && (
        <div className="assistant-message-container">
          <div className="message assistant-message">
            <div className="quick-row">
              {MODES.map((m) => (
                <button key={m.id} className="pill" onClick={() => selectMode(m.id)}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Skeleton while loading */}
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
