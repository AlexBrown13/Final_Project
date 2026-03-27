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
