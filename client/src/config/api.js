export function getApiBase() {
  const url = import.meta.env.VITE_API_URL
  if (url && String(url).trim()) return String(url).replace(/\/$/, '')
  return 'http://localhost:5500'
}
