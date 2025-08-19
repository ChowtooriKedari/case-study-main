import React, { useState, useEffect, useRef } from "react";
import "./ChatWindow.css";
import { getAIMessage } from "../api/api";
import { marked } from "marked";

function ChatWindow() {
  const defaultMessage = [
    { role: "assistant", content: "Hi, how can I help you today?" }
  ];

  const [messages, setMessages] = useState(defaultMessage);
  const [input, setInput] = useState("");

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const text = String(input ?? "").trim();
    if (!text) return;

    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");

    try {
      const newMessage = await getAIMessage(text);
      setMessages(prev => [...prev, newMessage]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong." }
      ]);
    }
  };

  return (
    <div className="messages-container">
      {messages.map((message, index) => (
        <div key={index} className={`${message.role}-message-container`}>
          {message.content && (
            <div className={`message ${message.role}-message`}>
              <div
                dangerouslySetInnerHTML={{
                  __html: marked(message.content).replace(/<p>|<\/p>/g, "")
                }}
              />
            </div>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button className="send-button" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
