import React, { useState } from "react";
import ChatWindow from "./ChatWindow";
import "./FloatingChat.css";

export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [unread, setUnread] = useState(0);

  const handleAssistant = () => {
    if (!open || minimized) setUnread((u) => u + 1);
  };

  const endChat = () => {
    setOpen(false);
    setMinimized(false);
    setUnread(0);
  };

  const maximize = () => {
    setOpen(true);
    setMinimized(false);
    setUnread(0);
  };

  const minimize = () => setMinimized(true);

  return (
    <>
      {!open && !minimized && (
        <button className="ps-launcher" aria-label="Open chat" onClick={() => setOpen(true)}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path d="M4 3h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H8l-4 4v-4H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" fill="currentColor"/>
          </svg>
          {unread > 0 && <span className="ps-badge">{unread}</span>}
        </button>
      )}


      <div
        className={`ps-panel ${open ? "open" : ""} ${minimized ? "is-min" : ""}`}
        role="dialog"
        aria-modal="false"
        aria-label="PartSelect Chat"
      >
        <div className="ps-headerNew">
          <div className="ps-left">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="5" cy="12" r="2" fill="#fff"/><circle cx="12" cy="12" r="2" fill="#fff"/><circle cx="19" cy="12" r="2" fill="#fff"/>
            </svg>
            <span className="ps-title">How can we help?</span>
          </div>
          <div className="ps-right">
            <button className="ps-end" onClick={endChat}>End chat</button>
            {!minimized ? (
              <button className="ps-min" onClick={minimize} aria-label="Minimize">
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#fff" d="M7 10l5 5 5-5z"/></svg>
              </button>
            ) : (
              <button className="ps-min" onClick={maximize} aria-label="Maximize">
                <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#fff" d="M7 14l5-5 5 5z"/></svg>
              </button>
            )}
          </div>
        </div>

        {open && !minimized && (
          <div className="ps-body">
            <ChatWindow onAssistant={handleAssistant} />
          </div>
        )}
      </div>
    </>
  );
}
