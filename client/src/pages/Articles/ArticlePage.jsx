import React, { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import { getApiBase } from "../../config/api.js";
import { useDirection } from "../../context/useDirection.js";
import { getUiStrings } from "../../config/uiStrings.js";
import "./ArticlePage.css";

export default function ArticlePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const { dir, locale } = useDirection();
  const s = useMemo(() => getUiStrings(locale), [locale]);

  const token = localStorage.getItem("trauma_auth_token");
  const userId = localStorage.getItem("trauma_user_id");

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
    if (!Array.isArray(article?.authors) || article.authors.length === 0) {
      return null;
    }

    const names = article.authors.filter(Boolean);

    if (names.length >= 2) {
      return `${names[0]}, ${names[1]}`;
    }

    return names[0]; // only one author
  };

  /** Resolves `url` (or legacy `doi`) to a usable href; supports full URLs and bare DOI strings. */
  const getArticleUrlHref = (raw) => {
    if (!raw || raw === "N/A") return "";
    const value = String(raw).trim();
    if (value.startsWith("http://") || value.startsWith("https://"))
      return value;
    const cleaned = value.replace(/^doi:\s*/i, "").trim();
    return `https://doi.org/${cleaned}`;
  };

  const getArticleUrlValue = (article) => article?.url ?? article?.doi ?? null;

  const fetchArticles = useCallback(async () => {
    const ui = getUiStrings(locale);
    if (!token || !userId) {
      setError(ui.articlesErrorAuth);
      return;
    }

    setLoading(true);
    setError("");
    setStatus("");

    const base = getApiBase();

    try {
      const res = await fetch(`${base}/api/articles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`${ui.articlesErrorFetchPrefix} (${res.status})`);
      }

      const data = await res.json();
      const normalizedArticles = Array.isArray(data)
        ? data
        : Array.isArray(data.articles)
        ? data.articles
        : [];

      setArticles(normalizedArticles);
    } catch (err) {
      setError(err.message || ui.articlesErrorFetch);
    } finally {
      setLoading(false);
    }
  }, [token, userId, locale]);

  const triggerArticleIngestion = async () => {
    if (!token || !userId) {
      setError(s.articlesErrorAuth);
      return;
    }

    setLoading(true);
    setError("");
    setStatus("");

    const base = getApiBase();

    try {
      const res = await fetch(`${base}/api/articles`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || s.articlesErrorSync);
      }

      setStatus(s.articlesSyncSuccess);
      await fetchArticles();
    } catch (err) {
      setError(err.message || s.articlesErrorSync);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return (
    <div className="article-reader-page">
      <Navbar />
      <main className="article-reader-container" lang={locale} dir={dir}>
        <div className="article-reader-header">
          <div className="article-reader-title-block">
            <h1>{s.articlesTitle}</h1>
          </div>
          <div className="reader-actions">
            <button
              type="button"
              className="reader-btn reader-btn-primary"
              onClick={triggerArticleIngestion}
              disabled={loading}
            >
              {loading ? s.articlesSyncing : s.articlesSync}
            </button>
          </div>
        </div>

        {status && <p className="feedback-banner feedback-success">{status}</p>}

        {error && <p className="feedback-banner feedback-error">{error}</p>}

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
                key={
                  article._id ||
                  article.openalex_id ||
                  `${article.title}-${article.year}`
                }
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
                  <p className="" dir="auto">
                    <span className="meta-label">{s.articlesJournal}:</span>
                    {article.journal}
                  </p>
                )}

                <p className=" meta-row-article-url">
                  <span className="meta-label">{s.articlesUrl}:</span>
                  {articleHref ? (
                    <a
                      className="article-url-link"
                      href={articleHref}
                      target="_blank"
                      rel="noreferrer"
                      dir="ltr"
                    >
                      {urlValue}
                    </a>
                  ) : (
                    "—"
                  )}
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
      </main>
    </div>
  );
}
