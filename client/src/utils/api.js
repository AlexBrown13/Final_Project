import { getApiBase } from "../config/api.js";
import { AUTH_TOKEN_KEY } from "../config/storageKeys.js";

async function parseJsonSafe(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

export async function fetchHealth() {
  const base = getApiBase();
  const paths = [`${base}/health/`, `${base}/health`];
  let lastErr;
  for (const url of paths) {
    try {
      const res = await fetch(url, { method: "GET" });
      const data = await parseJsonSafe(res);
      if (res.ok && data.status === "ok") return { ok: true, data };
      lastErr = new Error(data.error || `HTTP ${res.status}`);
    } catch (e) {
      lastErr = e;
    }
  }
  return { ok: false, error: lastErr };
}

/**
 * POST /auth/register
 */
export async function registerUser(email, password) {
  const base = getApiBase();

  const res = await fetch(`${base}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  try {
    const data = await res.json();
    return { res, data };
  } catch {
    return { res: { ok: false }, data: null };
  }
}

/**
 * POST /auth/login
 */
export async function loginUser(email, password, quizUserId = null) {
  const base = getApiBase();

  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, quiz_user_id: quizUserId }),
  });

  try {
    const data = await res.json();
    return { res, data };
  } catch {
    return { res: { ok: false }, data: null };
  }
}


/**
 * POST /auth/logout — revokes current JWT on the server; send Authorization Bearer.
 */
export async function logoutUser(token) {
  const base = getApiBase();
  const authToken =
    typeof token === "string" && token.trim()
      ? token.trim()
      : typeof localStorage !== "undefined"
        ? localStorage.getItem(AUTH_TOKEN_KEY)
        : null;

  if (!authToken) {
    return { res: { ok: false, status: 400 }, data: { error: "No token" } };
  }

  const res = await fetch(`${base}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${authToken}` },
  });

  const data = await parseJsonSafe(res);
  return { res, data };
}


/**
 * POST /chat — returns { reply, step, total_steps, completed, score?, error? }
 * messages: full UI message array [{role, text}] so the server can reconstruct
 * conversation context without storing it in the DB mid-quiz.
 */
export async function postChat(userId, message, messages = [], locale = "en") {
  const base = getApiBase();
  const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
  const headers = { "Content-Type": "application/json" };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  const res = await fetch(`${base}/chat`, {
    method: "POST",
    headers,
    body: JSON.stringify({ user_id: userId, message, messages, locale }),
  });
  const data = await parseJsonSafe(res);
  return { res, data };
}

export async function getResult(userId) {
  const base = getApiBase();
  const res = await fetch(`${base}/result/${encodeURIComponent(userId)}`);
  const data = await parseJsonSafe(res);
  return { res, data };
}

export async function trackArticleClick(articleId, token) {
  const base = getApiBase();
  const authToken = token || localStorage.getItem(AUTH_TOKEN_KEY);
  const res = await fetch(`${base}/api/articles/${encodeURIComponent(articleId)}/click`, {
    method: "POST",
    headers: { Authorization: `Bearer ${authToken}` },
  });
  return { res };
}

/**
 * DELETE session — requires auth token so the server can also delete articles by ObjectId
 */
export async function deleteSession(userId, token) {
  const base = getApiBase();
  const authToken = token || localStorage.getItem(AUTH_TOKEN_KEY);
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  const res = await fetch(`${base}/session/${encodeURIComponent(userId)}`, {
    method: "DELETE",
    headers,
  });
  const data = await parseJsonSafe(res);
  return { res, data };
}

/**
 * GET /api/articles — ranked academic articles for the logged-in user.
 * Graceful: never throws; returns { articles: [], persona_profile: null } on any error.
 */
export async function getArticles(quizUserId) {
  try {
    const base = getApiBase();
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) return { articles: [], persona_profile: null };
    const qs = quizUserId ? `?quiz_user_id=${encodeURIComponent(quizUserId)}` : "";
    const res = await fetch(`${base}/api/articles${qs}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { articles: [], persona_profile: null };
    const data = await parseJsonSafe(res);
    return {
      articles: Array.isArray(data.articles) ? data.articles : [],
      persona_profile: data.persona_profile ?? null,
    };
  } catch {
    return { articles: [], persona_profile: null };
  }
}

/**
 * GET /api/external/stories?topic= — Guardian stories (B-5; not yet built).
 * Graceful: never throws; returns [] on any error including 404 (B-5 absent today).
 */
export async function getExternalStories(topic) {
  try {
    if (!topic) return [];
    const base = getApiBase();
    const res = await fetch(
      `${base}/api/external/stories?topic=${encodeURIComponent(topic)}`
    );
    if (!res.ok) return [];           // 404 today (B-5 not built) → []
    const data = await parseJsonSafe(res);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];                         // network error → []
  }
}

/**
 * GET /api/calls-map-dates — returns the min/max dates.
 */
export async function fetchCallsMapDates() {
  try {
    const base = getApiBase();
    const res = await fetch(`${base}/api/calls-map-dates`);
    const data = await res.json();
    return { res, data };
  } catch (err) {
    console.error("fetchCallsMapDates error:", err);
    return { res: { ok: false }, data: null };
  }
}

/**
 * GET api/v1/calls-map-aggregated
 * Fetch aggregated calls between dates with optional gender filter
 */
export async function fetchCallsMapAggregated(
  from,
  to,
  gender = "all",
  ages = ""
) {
  const base = getApiBase();

  try {
    const params = new URLSearchParams({
      from,
      to,
      gender,
      ages,
    });

    const res = await fetch(`${base}/api/v1/calls-map-aggregated?${params}`);

    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return { res: { ok: false }, data: null };
  }
}
