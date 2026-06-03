import { useContext } from 'react'
import { PersonaContext } from './personaContext.js'

export function usePersona() {
  return useContext(PersonaContext)
}
