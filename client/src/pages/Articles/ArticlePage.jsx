import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { getApiBase } from "../../config/api.js";
import { useDirection } from "../../context/useDirection.js";
import { getUiStrings } from "../../config/uiStrings.js";
import { AUTH_TOKEN_KEY, USER_ID_KEY, SCORE_CACHE_KEY } from "../../config/storageKeys.js";
import { getResult, trackArticleClick } from "../../utils/api.js";
import ArticleChatBubble from "./ArticleChatBubble.jsx";
import "./ArticlePage.css";

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

  const fetchArticles = useCallback(async () => {
    const ui = getUiStrings(locale);
    if (!token || !userId) { setError(ui.articlesErrorAuth); return; }

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
        setArticles(Array.isArray(data2.articles) ? data2.articles : []);
        setPersonaProfile(data2.persona_profile ?? null);
      } else {
        setArticles(normalizedArticles);
        setPersonaProfile(data.persona_profile ?? null);
      }
    } catch (err) {
      setError(err.message || ui.articlesErrorFetch);
    } finally {
      setLoading(false);
    }
  }, [token, userId, locale, redirectToLogin]);

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

      await fetchArticles();
      setActiveTab("articles");
    } catch (err) {
      setProfileError(err.message || s.profileSaveError);
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="article-reader-page">
      <Navbar />
      <main className="article-reader-container" lang={locale} dir={dir}>
        <div className="article-reader-header">
          <div className="article-reader-title-block">
            <h1>{s.articlesTitle}</h1>
          </div>
        </div>

        <div className="tab-bar">
          <button
            type="button"
            className={`tab-btn${activeTab === "articles" ? " active" : ""}`}
            onClick={() => setActiveTab("articles")}
          >
            {s.tabArticles}
          </button>
          <button
            type="button"
            className={`tab-btn${activeTab === "profile" ? " active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            {s.tabProfile}
          </button>
        </div>

        {error && <p className="feedback-banner feedback-error">{error}</p>}

        {activeTab === "articles" && (
          <>
            {!loading && articles.length === 0 && !error && (
              <p className="empty-state">{s.articlesEmpty}</p>
            )}
            <section className="article-list">
              {articles.map((article) => {
                const urlValue = getArticleUrlValue(article);
                const articleHref = getArticleUrlHref(urlValue);
                const hasPdf = article.pdf_url && article.pdf_url !== "N/A";
                return (
                  <article
                    key={article._id || article.openalex_id || `${article.title}-${article.year}`}
                    className="article-card"
                  >
                    <div className="article-top">
                      <h2 className="article-title" dir="auto">
                        {article.title || s.articlesNoTitle}
                      </h2>
                      <span className="article-year-pill">
                        {article.year || s.articlesYearNa}
                      </span>
                    </div>

                    {article.authors && (
                      <p className="article-authors" dir="auto">
                        <strong>{s.articlesAuthors}:</strong>{" "}
                        {getAuthorNames(article)}
                      </p>
                    )}

                    {article.journal && (
                      <p dir="auto">
                        <span className="meta-label">{s.articlesJournal}:</span>
                        {article.journal}
                      </p>
                    )}

                    <p className="meta-row-article-url">
                      <span className="meta-label">{s.articlesUrl}:</span>
                      {articleHref ? (
                        <a
                          className="article-url-link"
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
                        className="pdf-btn"
                        href={article.pdf_url}
                        target="_blank"
                        rel="noreferrer"
                        download
                      >
                        {s.articlesDownloadPdf}
                      </a>
                    )}

                    <div className="abstract-block">
                      <p className="abstract-label">{s.articlesAbstract}</p>
                      <p className="abstract-text" dir="auto">
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
          <div className="profile-form">
            {personaProfile ? (
              <>
                {personaProfile.persona && (
                  <div className="profile-field">
                    <span className="profile-label">{s.profilePersonaLabel}</span>
                    <span className="profile-value">
                      <span className="persona-badge">{personaProfile.persona}</span>
                    </span>
                  </div>
                )}

                {Array.isArray(personaProfile.interest_tags) && personaProfile.interest_tags.length > 0 && (
                  <div className="profile-field">
                    <span className="profile-label">{s.profileTagsLabel}</span>
                    <div className="tag-list">
                      {personaProfile.interest_tags.map((tag) => (
                        <span key={tag} className="tag-chip">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {personaProfile.preferred_content && (
                  <div className="profile-field">
                    <span className="profile-label">{s.profilePreferredLabel}</span>
                    <span className="profile-value">{personaProfile.preferred_content}</span>
                  </div>
                )}
              </>
            ) : null}

            <div className="profile-field">
              <span className="profile-label">{s.profileQueryLabel}</span>
              <p className="profile-hint">{s.profileQueryHint}</p>
              <div className="tag-input-wrap">
                {editTags.map((tag) => (
                  <span key={tag} className="tag-chip tag-chip-editable">
                    {tag}
                    <button
                      type="button"
                      className="tag-remove"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  className="tag-text-input"
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
              <p className="feedback-banner feedback-error">{profileError}</p>
            )}

            <button
              type="button"
              className="profile-save-btn"
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
