import { createContext } from 'react'

export const PersonaContext = createContext({
  persona: 'beginner',
  setPersona: () => {},
})
