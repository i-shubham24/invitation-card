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
      const g = ctx.createLinearGradient(0, 0, r.width, r.height)
      g.addColorStop(0, '#f0c9c2'); g.addColorStop(1, '#e7b3aa')
      ctx.fillStyle = g; ctx.fillRect(0, 0, r.width, r.height)
      ctx.fillStyle = 'rgba(150,95,85,0.7)'
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
      ctx.font = `600 ${Math.round(r.height * 0.3)}px "Cormorant Garamond", serif`
      ctx.fillText('SCRATCH HERE', r.width / 2, r.height / 2)
    }
    paint()
    const ro = new ResizeObserver(() => { if (!revealed) paint() })
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [revealed])

  function scratchAt(cx, cy) {
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
  const pt = (e) => (e.touches ? e.touches[0] : e)
  function down(e) { if (revealed) return; scratching.current = true; const p = pt(e); scratchAt(p.clientX, p.clientY) }
  function move(e) { if (!scratching.current || revealed) return; const p = pt(e); scratchAt(p.clientX, p.clientY) }
  function up() { if (!scratching.current || revealed) return; scratching.current = false; if (cleared() > 0.5) done() }

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
          onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up}
          onTouchStart={down} onTouchMove={move} onTouchEnd={up}
        />
      </div>
    </>
  )
}
