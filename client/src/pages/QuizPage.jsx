import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import BackendDown from "../components/BackendDown.jsx";
import QuizProgress from "../components/QuizProgress.jsx";
import { getUiStrings } from "../config/uiStrings.js";
import {
  USER_ID_KEY,
  QUIZ_MESSAGES_KEY,
  QUIZ_META_KEY,
  SCORE_CACHE_KEY,
} from "../config/storageKeys.js";
import { useDirection } from "../context/useDirection.js";
import { detectTextDirection } from "../utils/detectLanguage.js";
import {
  fetchHealth,
  postChat,
  getResult,
  deleteSession,
} from "../utils/api.js";
import styles from "./QuizPage.module.css";

const MAX_CHARS = 1000;
const INIT_MESSAGE = " ";

/** Prevents duplicate first POST under React StrictMode double-mount. */
let quizBootstrapLock = null;

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function getOrCreateUserId() {
  try {
    let id = localStorage.getItem(USER_ID_KEY);
    if (id && id.length > 4) return id;
    id = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, id);
    return id;
  } catch {
    return `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }
}

export default function QuizPage() {
  const navigate = useNavigate();
  const { dir, locale } = useDirection();
  const s = getUiStrings(dir);

  const [health, setHealth] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(false);
  const [banner, setBanner] = useState(null);
  const listEndRef = useRef(null);

  // Scrolls the page when messages or loading changes
  const scrollToBottom = () => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Run this effect every time messages or loading changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const persistMessages = useCallback((next) => {
    setMessages(next);
    writeJson(QUIZ_MESSAGES_KEY, next);
  }, []);

  const persistMeta = useCallback((s, t) => {
    setStep(s);
    setTotalSteps(Math.max(1, t || 1));
    writeJson(QUIZ_META_KEY, { step: s, total_steps: t });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { ok } = await fetchHealth();
      if (!cancelled) setHealth(ok);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep alive function
  const recheckHealth = () => {
    (async () => {
      const { ok } = await fetchHealth();
      setHealth(ok);
    })();
  };

  const goResults = useCallback(
    (score) => {
      try {
        localStorage.setItem(SCORE_CACHE_KEY, String(score));
      } catch {
        /* ignore */
      }
      navigate("/results", { state: { score }, replace: true });
    },
    [navigate]
  );

  const handleChatResponse = useCallback(
    async (data, res) => {
      if (res.status === 429) {
        setBanner({ kind: "rate_limit" });
        return;
      }
      if (res.status === 400) {
        const err = data?.error || "";
        if (typeof err === "string" && err.toLowerCase().includes("too long")) {
          setBanner({ kind: "too_long" });
          return;
        }
        if (data?.completed && data.score != null) {
          goResults(Number(data.score));
          return;
        }
      }
      if (!res.ok) {
        setBanner({ kind: "generic" });
        return;
      }

      setBanner(null);
      if (data.total_steps != null) persistMeta(data.step, data.total_steps);
      else if (data.step != null) setStep(data.step);

      if (data.completed && data.score != null) {
        goResults(Number(data.score));
        return;
      }

      if (data.reply) {
        persistMessages((prev) => [
          ...prev,
          { role: "assistant", text: String(data.reply) },
        ]);
      }
    },
    [goResults, persistMessages, persistMeta]
  );

  useEffect(() => {
    if (health !== true) return;

    const run = async () => {
      if (quizBootstrapLock) {
        await quizBootstrapLock;
        return;
      }

      quizBootstrapLock = (async () => {
        const userId = getOrCreateUserId();
        const { res, data } = await getResult(userId);
        if (res.ok && data.completed && data.score != null) {
          goResults(Number(data.score));
          return;
        }

        let savedMsgs = readJson(QUIZ_MESSAGES_KEY, []);
        const meta = readJson(QUIZ_META_KEY, null);

        if (res.status === 404) {
          try {
            localStorage.removeItem(QUIZ_MESSAGES_KEY);
            localStorage.removeItem(QUIZ_META_KEY);
          } catch {
            /* ignore */
          }
          savedMsgs = [];
        }

        if (res.status === 400 && data?.completed === false) {
          if (!Array.isArray(savedMsgs) || savedMsgs.length === 0) {
            await deleteSession(userId); // delete session
          } else {
            setMessages(savedMsgs);
            if (meta && typeof meta.step === "number") {
              setStep(meta.step);
              setTotalSteps(Math.max(1, meta.total_steps || 1));
            }
            return;
          }
        }

        if (Array.isArray(savedMsgs) && savedMsgs.length > 0) {
          setMessages(savedMsgs);
          if (meta && typeof meta.step === "number") {
            setStep(meta.step);
            setTotalSteps(Math.max(1, meta.total_steps || 1));
          }
          return;
        }

        setBootLoading(true);
        try {
          const chatRes = await postChat(userId, INIT_MESSAGE);
          await handleChatResponse(chatRes.data, chatRes.res);
        } finally {
          setBootLoading(false);
        }
      })();

      try {
        await quizBootstrapLock;
      } finally {
        quizBootstrapLock = null;
      }
    };

    run();
  }, [health, goResults, handleChatResponse]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading || bootLoading) return;
    if (text.length > MAX_CHARS) {
      setBanner({ kind: "too_long" });
      return;
    }

    setBanner(null);
    const userId = getOrCreateUserId();
    const nextMsgs = [...messages, { role: "user", text }];
    persistMessages(nextMsgs);
    setInput("");
    setLoading(true);

    const { res, data } = await postChat(userId, text);
    setLoading(false);
    await handleChatResponse(data, res);
  };

  const dismissBanner = () => setBanner(null);

  const retryAfterError = async () => {
    setBanner(null);
    if (!messages.length) {
      setBootLoading(true);
      const userId = getOrCreateUserId();
      const { res, data } = await postChat(userId, INIT_MESSAGE);
      setBootLoading(false);
      await handleChatResponse(data, res);
    }
  };

  const bannerText =
    banner?.kind === "rate_limit"
      ? s.errorRateLimit
      : banner?.kind === "too_long"
      ? s.errorMessageTooLong
      : banner?.kind === "generic"
      ? s.errorGeneric
      : null;

  if (health === null) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main} lang={locale}>
          <p className={styles.muted}>{s.quizChecking}</p>
        </main>
      </div>
    );
  }

  if (health === false) {
    return (
      <div className={styles.page}>
        <Navbar />
        <BackendDown onRetry={recheckHealth} dir={dir} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main} lang={locale}>
        <header className={styles.header}>
          <h1 className={styles.title}>{s.quizTitle}</h1>
          <p className={styles.subtitle}>{s.quizSubtitle}</p>
        </header>

        {banner && bannerText ? (
          <div className={styles.banner} role="alert">
            <p className={styles.bannerText}>{bannerText}</p>
            <div className={styles.bannerActions}>
              {banner.kind === "generic" ? (
                <button
                  type="button"
                  className={styles.retry}
                  onClick={retryAfterError}
                >
                  {s.retry}
                </button>
              ) : null}
              <button
                type="button"
                className={styles.dismiss}
                onClick={dismissBanner}
              >
                {s.dismiss}
              </button>
            </div>
          </div>
        ) : null}

        <QuizProgress
          step={step}
          totalSteps={totalSteps}
          label={s.progressLabel}
        />

        <section className={styles.chat} aria-label={s.chatAriaLabel}>
          <div className={styles.messages}>
            {messages.map((m, i) => {
              const bubbleDir = detectTextDirection(m.text);
              return (
                <div
                  key={`${i}-${m.role}`}
                  dir={bubbleDir}
                  className={
                    m.role === "user" ? styles.bubbleUser : styles.bubbleAi
                  }
                >
                  <p className={styles.bubbleText}>{m.text}</p>
                </div>
              );
            })}
            {(loading || bootLoading) && (
              <div className={styles.typing} aria-live="polite">
                …
              </div>
            )}
            <div ref={listEndRef} />
          </div>

          <form className={styles.form} onSubmit={onSubmit}>
            <label className={styles.srOnly} htmlFor="quiz-input">
              {s.answerLabel}
            </label>
            <textarea
              id="quiz-input"
              dir={dir}
              className={styles.textarea}
              rows={3}
              maxLength={MAX_CHARS}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={s.placeholder}
              disabled={loading || bootLoading}
            />
            <div className={styles.formFooter}>
              <span className={styles.counter}>
                {input.length} / {MAX_CHARS}
              </span>
              <button
                type="submit"
                className={styles.send}
                disabled={
                  loading ||
                  bootLoading ||
                  !input.trim() ||
                  input.length > MAX_CHARS
                }
              >
                {s.send}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
