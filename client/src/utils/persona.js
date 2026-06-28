// Pure persona-resolution helpers — shared by the quiz/results flow and unit-testable.

// Numeric quiz score → persona key.
export function scoreToPersona(s) {
  if (s === 3) return 'researcher'
  if (s === 2) return 'informed'
  return 'beginner'
}

// Free-text persona label → canonical key, or null when unrecognized.
// Returning null (not 'beginner') lets callers fall back to the score instead
// of silently defaulting a researcher/informed user to the beginner landing.
export function normalizePersonaLabel(p) {
  const s = String(p || '').toLowerCase().trim()
  if (s.startsWith('research')) return 'researcher'
  if (s.startsWith('informed')) return 'informed' // "informed learner" → "informed"
  if (s.startsWith('begin')) return 'beginner'
  return null
}

// Decide which landing to render. The persona profile is authoritative when it
// carries a recognized persona; otherwise we derive it from the numeric score.
// This prevents a missing/blank persona_profile from shadowing the real persona.
export function resolveRenderedPersona(personaProfile, score) {
  return normalizePersonaLabel(personaProfile?.persona) || scoreToPersona(score)
}
