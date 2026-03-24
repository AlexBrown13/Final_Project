import { createContext } from 'react'

export const DirectionContext = createContext({
  dir: 'ltr',
  locale: 'en',
  setLocale: () => {},
  toggleLocale: () => {},
})
