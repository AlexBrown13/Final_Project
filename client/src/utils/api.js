import { getApiBase } from '../config/api.js'

async function parseJsonSafe(res) {
  const text = await res.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

export async function fetchHealth() {
  const base = getApiBase()
  const paths = [`${base}/health/`, `${base}/health`]
  let lastErr
  for (const url of paths) {
    try {
      const res = await fetch(url, { method: 'GET' })
      const data = await parseJsonSafe(res)
      if (res.ok && data.status === 'ok') return { ok: true, data }
      lastErr = new Error(data.error || `HTTP ${res.status}`)
    } catch (e) {
      lastErr = e
    }
  }
  return { ok: false, error: lastErr }
}


export async function registerUser(email, password) {
  return postJson("/auth/register", { email, password });
}


export async function loginUser(email, password) {
  return postJson("/auth/login", { email, password });
}


/**
 * POST /chat — returns { reply, step, total_steps, completed, score?, error? }
 */
export async function postChat(userId, message) {
  const base = getApiBase()
  const res = await fetch(`${base}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, message }),
  })
  const data = await parseJsonSafe(res)
  return { res, data }
}

export async function getResult(userId) {
  const base = getApiBase()
  const res = await fetch(`${base}/result/${encodeURIComponent(userId)}`)
  const data = await parseJsonSafe(res)
  return { res, data }
}

export async function deleteSession(userId) {
  const base = getApiBase()
  const res = await fetch(`${base}/session/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  })
  const data = await parseJsonSafe(res)
  return { res, data }
}



/**
 * GET /api/calls-map?year=YYYY&q=1..4 — aggregated points per city for that quarter.
 */
export async function fetchCallsMap(year, quarter) {
  const base = getApiBase();
  const url = `${base}/api/calls-map?year=${encodeURIComponent(
    year
  )}&q=${encodeURIComponent(quarter)}`;
  const res = await fetch(url);
  const data = await parseJsonSafe(res);
  return { res, data };
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
 * GET /api/v1/calls-map?from=YYYY-MM-DD&to=YYYY-MM-DD&gender=male&gender=female
 * Omit genders or pass [] to load all genders (no filter).
 * Pass string "male,female" or all
 */
export async function fetchCallsMapData(from, to, genders = "all") {
  const base = getApiBase();
  const params = new URLSearchParams({ from, to });

  // Normalize gender input
  let tokens = [];

  if (genders === "all" || genders == null) {
    tokens = []; // backend returns all
  } else if (Array.isArray(genders)) {
    tokens = genders;
  } else if (typeof genders === "string") {
    tokens = [genders];
  }

  // only allow valid values
  tokens = tokens
    .map((g) => g.toLowerCase().trim())
    .filter((g) => g === "male" || g === "female");

  // Append query params
  tokens.forEach((g) => params.append("gender", g));

  const url = `${base}/api/v1/calls-map?${params.toString()}`;

  try {
    const res = await fetch(url);

    if (!res.ok) {
      console.error("API error:", res.status);
      return { res, data: { points: [] } };
    }

    const data = await res.json();
    return { res, data };
  } catch (err) {
    console.error("Network error:", err);
    return {
      res: { ok: false },
      data: { points: [] },
    };
  }
}