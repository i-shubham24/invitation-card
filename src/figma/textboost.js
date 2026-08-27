/**
 * Global text "visibility" tweaks — the client asked for text a little bolder
 * and darker across the site. Applied to the manifest-driven canvas text on
 * both mobile and desktop (the form is left as-is until confirmed).
 */

/** Nudge weight up one step (little bolder), capped so nothing turns heavy. */
export function boostWeight(w) {
  return Math.min((Number(w) || 400) + 100, 700)
}

/** Darken a #rrggbb colour by `f` (default 18%) for more contrast. Non-hex
 *  values are returned unchanged. */
export function darken(hex, f = 0.18) {
  if (typeof hex !== 'string' || hex[0] !== '#' || hex.length < 7) return hex
  const n = parseInt(hex.slice(1, 7), 16)
  if (Number.isNaN(n)) return hex
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    .map((x) => Math.round(x * (1 - f)).toString(16).padStart(2, '0'))
  return '#' + ch.join('')
}

/** Final colour/weight for a manifest text item. Nodes flagged `exact` (the
 *  designer's final styling) render their colour/weight as-is; everything else
 *  gets the visibility boost (slightly bolder + darker). */
export function textColor(it) {
  return it && it.exact ? it.color : darken(it && it.color)
}
export function textWeight(it) {
  return it && it.exact ? (Number(it.weight) || 700) : boostWeight(it && it.weight)
}
