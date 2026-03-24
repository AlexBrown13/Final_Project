import { useContext } from 'react'
import { DirectionContext } from './directionContext.js'

export function useDirection() {
  return useContext(DirectionContext)
}
