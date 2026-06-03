import { useCallback, useEffect, useMemo, useState } from 'react'
import { PersonaContext } from './personaContext.js'
import { PERSONA_CACHE_KEY } from '../config/storageKeys.js'

// "informed learner" → "informed-learner", everything else stays as-is
function normalizePersona(raw) {
  if (!raw) return 'beginner'
  const p = String(raw).toLowerCase().trim().replace(/\s+/g, '-')
  if (p === 'researcher' || p === 'informed-learner' || p === 'beginner') return p
  return 'beginner'
}

function readStoredPersona() {
  try {
    const stored = localStorage.getItem(PERSONA_CACHE_KEY)
    if (stored) return normalizePersona(stored)
  } catch {
    /* ignore */
  }
  return 'beginner'
}

export function PersonaProvider({ children }) {
  const [persona, setPersonaState] = useState(readStoredPersona)

  useEffect(() => {
    document.documentElement.setAttribute('data-persona', persona)
  }, [persona])

  const setPersona = useCallback((raw) => {
    const normalized = normalizePersona(raw)
    setPersonaState(normalized)
    try {
      localStorage.setItem(PERSONA_CACHE_KEY, normalized)
    } catch {
      /* ignore */
    }
  }, [])

  const value = useMemo(() => ({ persona, setPersona }), [persona, setPersona])

  return (
    <PersonaContext.Provider value={value}>
      {children}
    </PersonaContext.Provider>
  )
}
