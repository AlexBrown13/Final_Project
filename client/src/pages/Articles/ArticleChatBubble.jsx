import { useEffect, useRef, useState } from "react";
import { getApiBase } from "../../config/api.js";
import { AUTH_TOKEN_KEY, USER_ID_KEY } from "../../config/storageKeys.js";
import styles from "./ArticleChatBubble.module.css";

export default function ArticleChatBubble() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const quizUserId = localStorage.getItem(USER_ID_KEY);

  useEffect(() => {
    if (!token || !open) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    inputRef.current?.focus();
  }, [messages, open, token]);

  if (!token) return null;

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    const next = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${getApiBase()}/api/article-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: q, history: messages, quiz_user_id: quizUserId }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer || data.error || "No response." },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Could not reach the assistant. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        className={styles.bubble}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open article assistant"
        title="Ask about your articles"
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className={styles.panel} role="dialog" aria-label="Article assistant">
          <div className={styles.header}>
            <span>Article Assistant</span>
            <button className={styles.close} onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>

          <div className={styles.messages}>
            {messages.length === 0 && (
              <p className={styles.hint}>Ask a question about your articles…</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`${styles.msg} ${m.role === "user" ? styles.msgUser : styles.msgAssistant}`}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div className={`${styles.msg} ${styles.msgAssistant} ${styles.typing}`}>
                <span /><span /><span />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className={styles.inputRow}>
            <input
              ref={inputRef}
              type="text"
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about your articles…"
              disabled={loading}
              maxLength={500}
            />
            <button
              className={styles.send}
              onClick={send}
              disabled={!input.trim() || loading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
