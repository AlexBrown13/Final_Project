import { useCallback, useMemo, useState, useEffect } from 'react'
import { DirectionContext } from './directionContext.js'
import { TEXT_DIR_KEY, UI_LOCALE_KEY } from '../config/storageKeys.js'

function readInitialLocale() {
  try {
    const stored = localStorage.getItem(UI_LOCALE_KEY)
    if (stored === 'he' || stored === 'en') return stored
    const legacy = localStorage.getItem(TEXT_DIR_KEY)
    if (legacy === 'rtl') return 'he'
    if (legacy === 'ltr') return 'en'
  } catch {
    /* ignore */
  }
  return 'en'
}

export function DirectionProvider({ children }) {
  const [locale, setLocaleState] = useState(readInitialLocale)
  const dir = locale === 'he' ? 'rtl' : 'ltr'

  useEffect(() => {
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', locale)
    try {
      localStorage.setItem(UI_LOCALE_KEY, locale)
      localStorage.setItem(TEXT_DIR_KEY, dir)
    } catch {
      /* ignore */
    }
  }, [locale, dir])

  const setLocale = useCallback((loc) => {
    if (loc === 'he' || loc === 'en') setLocaleState(loc)
  }, [])

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === 'he' ? 'en' : 'he'))
  }, [])

  const value = useMemo(
    () => ({ dir, locale, setLocale, toggleLocale }),
    [dir, locale, setLocale, toggleLocale]
  )

  return (
    <DirectionContext.Provider value={value}>
      {children}
    </DirectionContext.Provider>
  )
}
