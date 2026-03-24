/**
 * Infer paragraph direction from typed text (Hebrew vs Latin).
 * Defaults to LTR when ambiguous or empty.
 */
export function detectTextDirection(text) {
  if (!text || typeof text !== 'string') return 'ltr'
  let hebrew = 0
  let latin = 0
  for (const ch of text) {
    const code = ch.codePointAt(0)
    if (code >= 0x0590 && code <= 0x05ff) hebrew += 1
    else if (
      (code >= 0x0041 && code <= 0x005a) ||
      (code >= 0x0061 && code <= 0x007a)
    ) {
      latin += 1
    }
  }
  if (hebrew === 0 && latin === 0) return 'ltr'
  return hebrew >= latin ? 'rtl' : 'ltr'
}
