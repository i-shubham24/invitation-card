import { useEffect, useRef, useState } from 'react'
import confetti from '../effects/confetti'

/**
 * ScratchFig — the interactive scratch card on the hero, positioned over the
 * Figma "SCRATCH HERE" rectangle. Touch + mouse. Scratching uncovers the
 * Save-the-Date beneath; at ~55% cleared it fires a confetti popper and opens
 * the countdown pop-up ("Until Our Forever Begins").
 *
 * Props: rect = { x, y, w, h } in canvas percentages.
 */
export default function ScratchFig({ rect, date = '3 December, 2026' }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const [revealed, setRevealed] = useState(false)
  const scratching = useRef(false)
  const hasScratched = useRef(false) // once true, never repaint (would wipe scratches)

  // paint the coating
  useEffect(() => {
    const wrap = wrapRef.current, canvas = canvasRef.current
    if (!wrap || !canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    function paint() {
      const r = wrap.getBoundingClientRect()
      if (r.width < 2) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = r.width * dpr; canvas.height = r.height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // rose / blush foil (our main colours)
      const g = ctx.createLinearGradient(0, 0, r.width, r.height)
      g.addColorStop(0, '#f6dad2'); g.addColorStop(0.42, '#e2ab9f')
      g.addColorStop(0.5, '#f0cbc2'); g.addColorStop(0.58, '#dda294'); g.addColorStop(1, '#d0917f')
      ctx.fillStyle = g; ctx.fillRect(0, 0, r.width, r.height)
      // diagonal sheen
      const sh = ctx.createLinearGradient(0, 0, r.width, r.height)
      sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(255,255,255,0.42)'); sh.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = sh; ctx.fillRect(0, 0, r.width, r.height)
      // paper-like speckle texture
      const specks = Math.floor((r.width * r.height) / 45)
      for (let i = 0; i < specks; i++) {
        ctx.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.14)' : 'rgba(140,80,70,0.10)'
        ctx.fillRect(Math.random() * r.width, Math.random() * r.height, 1.3, 1.3)
      }
      // premium label, auto-sized to fit the width
      const label = '✦ SCRATCH TO REVEAL ✦'
      ctx.fillStyle = '#7a3f38'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      try { ctx.letterSpacing = `${Math.max(1, r.height * 0.03)}px` } catch { /* older browsers */ }
      let fs = Math.round(r.height * 0.42)
      ctx.font = `700 ${fs}px "Cinzel", "Cormorant Garamond", serif`
      while (ctx.measureText(label).width > r.width * 0.84 && fs > 8) {
        fs -= 1
        ctx.font = `700 ${fs}px "Cinzel", "Cormorant Garamond", serif`
      }
      ctx.fillText(label, r.width / 2, r.height / 2)
    }
    paint()
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { if (!revealed && !hasScratched.current) paint() })
    }
    const ro = new ResizeObserver(() => { if (!revealed && !hasScratched.current) paint() })
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [revealed])

  function scratchAt(cx, cy) {
    hasScratched.current = true
    const canvas = canvasRef.current, ctx = canvas.getContext('2d')
    const r = canvas.getBoundingClientRect()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(cx - r.left, cy - r.top, r.height * 0.55, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
  }
  function cleared() {
    const canvas = canvasRef.current, ctx = canvas.getContext('2d')
    const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    let clear = 0, n = 0
    for (let i = 3; i < d.length; i += 40) { n++; if (d[i] === 0) clear++ }
    return clear / n
  }
  function done() {
    if (revealed) return
    setRevealed(true)
    const r = wrapRef.current.getBoundingClientRect()
    confetti(r.left + r.width / 2, r.top + r.height / 2)
  }
  const moves = useRef(0)
  function down(e) {
    if (revealed) return
    scratching.current = true
    try { e.currentTarget.setPointerCapture?.(e.pointerId) } catch { /* noop */ }
    scratchAt(e.clientX, e.clientY)
  }
  function move(e) {
    if (!scratching.current || revealed) return
    scratchAt(e.clientX, e.clientY)
    // fire + reveal automatically once ~65% is scratched (throttled check)
    if (++moves.current % 6 === 0 && cleared() > 0.65) done()
  }
  function up() { if (!scratching.current || revealed) return; scratching.current = false; if (cleared() > 0.65) done() }

  return (
    <>
      <div
        ref={wrapRef}
        className="scratchfig"
        style={{ left: `${rect.x}%`, top: `${rect.y}%`, width: `${rect.w}%`, height: `${rect.h}%` }}
      >
        <div className="scratchfig__reveal">
          <span className="scratchfig__label">Save the Date</span>
          <span className="scratchfig__date">{date}</span>
        </div>
        <canvas
          ref={canvasRef}
          className={`scratchfig__coat ${revealed ? 'is-gone' : ''}`}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        />
      </div>
    </>
  )
}
