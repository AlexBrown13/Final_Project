import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getApiBase } from "../../config/api.js";
import { useDirection } from "../../context/useDirection.js";
import { getUiStrings } from "../../config/uiStrings.js";
import { AUTH_TOKEN_KEY, USER_ID_KEY, SCORE_CACHE_KEY } from "../../config/storageKeys.js";
import { getResult, trackArticleClick } from "../../utils/api.js";
import ArticleChatBubble from "./ArticleChatBubble.jsx";
import styles from "./ArticlePage.module.css";

export default function ArticlePage() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [personaProfile, setPersonaProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("articles");
  const [editTags, setEditTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  const { dir, locale } = useDirection();
  const s = useMemo(() => getUiStrings(locale), [locale]);

  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const userId = localStorage.getItem(USER_ID_KEY);
  const score = localStorage.getItem(SCORE_CACHE_KEY);

  useEffect(() => {
    if (!token) navigate("/auth/login", { replace: true });
  }, [token, navigate]);

  // If score isn't cached locally, verify against the DB before redirecting.
  // Covers fresh sessions, new devices, or cleared localStorage.
  useEffect(() => {
    if (!token || !userId || score) return;
    let cancelled = false;
    getResult(userId).then(({ res, data }) => {
      if (cancelled) return;
      if (res.ok && data?.completed && data?.score != null) {
        try { localStorage.setItem(SCORE_CACHE_KEY, String(data.score)); } catch {}
      } else {
        navigate("/quiz", { replace: true });
      }
    }).catch(() => {
      if (!cancelled) navigate("/quiz", { replace: true });
    });
    return () => { cancelled = true; };
  }, [token, userId, score, navigate]);

  // Seed edit tags from persona when it loads
  useEffect(() => {
    if (Array.isArray(personaProfile?.interest_tags) && personaProfile.interest_tags.length) {
      setEditTags(personaProfile.interest_tags);
    }
  }, [personaProfile]);

  const sanitizeTag = (raw) =>
    raw.replace(/[^\p{L}\p{N}\s\-]/gu, "").trim().slice(0, 50);

  const addTag = () => {
    const tag = sanitizeTag(tagInput);
    if (!tag) { setTagInput(""); return; }
    if (editTags.length >= 5) { setTagInput(""); return; }
    if (!editTags.includes(tag)) setEditTags((prev) => [...prev, tag]);
    setTagInput("");
  };

  const removeTag = (tag) => setEditTags((prev) => prev.filter((t) => t !== tag));

  const handleTagKey = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
  };

  const redirectToLogin = useCallback(() => {
    try { localStorage.removeItem(AUTH_TOKEN_KEY); } catch {}
    navigate("/auth/login", { replace: true });
  }, [navigate]);

  const getAbstractPreview = (article) => {
    const abstractText =
      article?.abstract ||
      article?.abstract_preview ||
      article?.abstract_text ||
      s.articlesNoAbstract;
    return abstractText.length > 1000
      ? `${abstractText.slice(0, 1000)}…`
      : abstractText;
  };

  const getAuthorNames = (article) => {
    if (!Array.isArray(article?.authors) || article.authors.length === 0) return null;
    const names = article.authors.filter(Boolean);
    return names.length >= 2 ? `${names[0]}, ${names[1]}` : names[0];
  };

  const getArticleUrlHref = (raw) => {
    if (!raw || raw === "N/A") return "";
    const value = String(raw).trim();
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    return `https://doi.org/${value.replace(/^doi:\s*/i, "").trim()}`;
  };

  const getArticleUrlValue = (article) => article?.url ?? article?.doi ?? null;

  const cacheKey = userId ? `articles_cache_${userId}` : null;
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  const fetchArticles = useCallback(async ({ bustCache = false } = {}) => {
    const ui = getUiStrings(locale);
    if (!token || !userId) { setError(ui.articlesErrorAuth); return; }

    // Serve from sessionStorage if fresh and not explicitly busting
    if (!bustCache && cacheKey) {
      try {
        const raw = sessionStorage.getItem(cacheKey);
        if (raw) {
          const { articles: cached, personaProfile: cachedProfile, ts } = JSON.parse(raw);
          if (Date.now() - ts < CACHE_TTL) {
            setArticles(cached);
            setPersonaProfile(cachedProfile ?? null);
            return;
          }
        }
      } catch { /* ignore */ }
    }

    setLoading(true);
    setError("");

    const base = getApiBase();
    const authHeaders = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      const params = new URLSearchParams({ quiz_user_id: userId });
      const res = await fetch(`${base}/api/articles?${params}`, {
        method: "GET",
        headers: authHeaders,
      });

      if (res.status === 401) { redirectToLogin(); return; }
      if (!res.ok) throw new Error(`${ui.articlesErrorFetchPrefix} (${res.status})`);

      const data = await res.json();
      const normalizedArticles = Array.isArray(data)
        ? data
        : Array.isArray(data.articles)
        ? data.articles
        : [];

      if (normalizedArticles.length === 0) {
        const postRes = await fetch(`${base}/api/articles`, {
          method: "POST",
          headers: authHeaders,
          body: JSON.stringify({ quiz_user_id: userId }),
        });
        if (postRes.status === 401) { redirectToLogin(); return; }
        if (!postRes.ok) throw new Error(`${ui.articlesErrorFetchPrefix} (${postRes.status})`);

        const res2 = await fetch(`${base}/api/articles?${params}`, {
          method: "GET",
          headers: authHeaders,
        });
        if (res2.status === 401) { redirectToLogin(); return; }

        const data2 = await res2.json();
        const freshArticles = Array.isArray(data2.articles) ? data2.articles : [];
        const freshProfile = data2.persona_profile ?? null;
        setArticles(freshArticles);
        setPersonaProfile(freshProfile);
        if (cacheKey && freshProfile?.interest_tags?.length) {
          try { sessionStorage.setItem(cacheKey, JSON.stringify({ articles: freshArticles, personaProfile: freshProfile, ts: Date.now() })); } catch { /* ignore */ }
        }
      } else {
        const profile = data.persona_profile ?? null;
        setArticles(normalizedArticles);
        setPersonaProfile(profile);
        if (cacheKey && profile?.interest_tags?.length) {
          try { sessionStorage.setItem(cacheKey, JSON.stringify({ articles: normalizedArticles, personaProfile: profile, ts: Date.now() })); } catch { /* ignore */ }
        }
      }
    } catch (err) {
      setError(err.message || ui.articlesErrorFetch);
    } finally {
      setLoading(false);
    }
  }, [token, userId, locale, redirectToLogin, cacheKey]);

  useEffect(() => {
    if (token && userId) fetchArticles();
  }, [token, userId, fetchArticles]);

  const saveProfile = async () => {
    if (!editTags.length) return;

    setProfileSaving(true);
    setProfileError("");

    const base = getApiBase();
    try {
      const res = await fetch(`${base}/api/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quiz_user_id: userId, tags: editTags }),
      });

      if (res.status === 401) { redirectToLogin(); return; }
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || s.profileSaveError);
      }

      if (cacheKey) { try { sessionStorage.removeItem(cacheKey); } catch { /* ignore */ } }
      await fetchArticles({ bustCache: true });
      setActiveTab("articles");
    } catch (err) {
      setProfileError(err.message || s.profileSaveError);
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className={styles.articleReaderPage}>
      <Navbar />
      <main className={styles.articleReaderContainer} lang={locale} dir={dir}>
        <div className={styles.articleReaderHeader}>
          <div className={styles.articleReaderTitleBlock}>
            <h1>{s.articlesTitle}</h1>
          </div>
        </div>

        <div className={styles.tabBar}>
          <button
            type="button"
            className={`${styles.tabBtn}${activeTab === "articles" ? ` ${styles.active}` : ""}`}
            onClick={() => setActiveTab("articles")}
          >
            {s.tabArticles}
          </button>
          <button
            type="button"
            className={`${styles.tabBtn}${activeTab === "profile" ? ` ${styles.active}` : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            {s.tabProfile}
          </button>
        </div>

        {error && <p className={`${styles.feedbackBanner} ${styles.feedbackError}`}>{error}</p>}

        {activeTab === "articles" && (
          <>
            {loading && (
              <section className={styles.articleList}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={styles.articleSkeleton}>
                    <div className={`${styles.skeletonLine} ${styles.skeletonLineTitle}`} />
                    <div className={`${styles.skeletonLine} ${styles.skeletonLineAuthor}`} />
                    <div className={`${styles.skeletonLine} ${styles.skeletonLineText}`} />
                    <div className={`${styles.skeletonLine} ${styles.skeletonLineTextShort}`} />
                    <div className={`${styles.skeletonLine} ${styles.skeletonLineText}`} />
                  </div>
                ))}
              </section>
            )}
            {!loading && articles.length === 0 && !error && (
              <p className={styles.emptyState}>{s.articlesEmpty}</p>
            )}
            <section className={styles.articleList}>
              {articles.map((article) => {
                const urlValue = getArticleUrlValue(article);
                const articleHref = getArticleUrlHref(urlValue);
                const hasPdf = article.pdf_url && article.pdf_url !== "N/A";
                return (
                  <article
                    key={article._id || article.openalex_id || `${article.title}-${article.year}`}
                    className={styles.articleCard}
                  >
                    <div className={styles.articleTop}>
                      <h2 className={styles.articleTitle} dir="auto">
                        {article.title || s.articlesNoTitle}
                      </h2>
                      <span className={styles.articleYearPill}>
                        {article.year || s.articlesYearNa}
                      </span>
                    </div>

                    {article.authors && (
                      <p className={styles.articleAuthors} dir="auto">
                        <strong>{s.articlesAuthors}:</strong>{" "}
                        {getAuthorNames(article)}
                      </p>
                    )}

                    {article.journal && (
                      <p dir="auto">
                        <span className={styles.metaLabel}>{s.articlesJournal}:</span>
                        {article.journal}
                      </p>
                    )}

                    <p className={styles.metaRowArticleUrl}>
                      <span className={styles.metaLabel}>{s.articlesUrl}:</span>
                      {articleHref ? (
                        <a
                          className={styles.articleUrlLink}
                          href={articleHref}
                          target="_blank"
                          rel="noreferrer"
                          dir="ltr"
                          onClick={() => article._id && trackArticleClick(article._id, token)}
                        >
                          {urlValue}
                        </a>
                      ) : "—"}
                    </p>

                    {hasPdf && (
                      <a
                        className={styles.pdfBtn}
                        href={article.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        download
                      >
                        {s.articlesDownloadPdf}
                      </a>
                    )}

                    <div className={styles.abstractBlock}>
                      <p className={styles.abstractLabel}>{s.articlesAbstract}</p>
                      <p className={styles.abstractText} dir="auto">
                        {getAbstractPreview(article)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        )}

        {activeTab === "profile" && (
          <div className={styles.profileForm}>
            {personaProfile ? (
              <>
                {personaProfile.persona && (
                  <div className={styles.profileField}>
                    <span className={styles.profileLabel}>{s.profilePersonaLabel}</span>
                    <span className={styles.profileValue}>
                      <span className={styles.personaBadge}>{personaProfile.persona}</span>
                    </span>
                  </div>
                )}

                {Array.isArray(personaProfile.interest_tags) && personaProfile.interest_tags.length > 0 && (
                  <div className={styles.profileField}>
                    <span className={styles.profileLabel}>{s.profileTagsLabel}</span>
                    <div className={styles.tagList}>
                      {personaProfile.interest_tags.map((tag) => (
                        <span key={tag} className={styles.tagChip}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {personaProfile.preferred_content && (
                  <div className={styles.profileField}>
                    <span className={styles.profileLabel}>{s.profilePreferredLabel}</span>
                    <span className={styles.profileValue}>{personaProfile.preferred_content}</span>
                  </div>
                )}
              </>
            ) : null}

            <div className={styles.profileField}>
              <span className={styles.profileLabel}>{s.profileQueryLabel}</span>
              <p className={styles.profileHint}>{s.profileQueryHint}</p>
              <div className={styles.tagInputWrap}>
                {editTags.map((tag) => (
                  <span key={tag} className={`${styles.tagChip} ${styles.tagChipEditable}`}>
                    {tag}
                    <button
                      type="button"
                      className={styles.tagRemove}
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  className={styles.tagTextInput}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKey}
                  onBlur={addTag}
                  placeholder={editTags.length >= 5 ? s.profileTagsMax : s.profileTagsPlaceholder}
                  dir="auto"
                />
              </div>
            </div>

            {profileError && (
              <p className={`${styles.feedbackBanner} ${styles.feedbackError}`}>{profileError}</p>
            )}

            <button
              type="button"
              className={styles.profileSaveBtn}
              onClick={saveProfile}
              disabled={profileSaving || editTags.length === 0}
            >
              {profileSaving ? s.profileSaving : s.profileSave}
            </button>
          </div>
        )}
      </main>
      <ArticleChatBubble />
    </div>
  );
}
