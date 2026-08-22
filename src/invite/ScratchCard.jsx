import { useEffect, useRef, useState } from 'react'
import { SCRATCH, C, WEDDING_DATE } from './layout'
import SaveDatePop from './SaveDatePop'

/**
 * ScratchCard — the "SCRATCH HERE" interaction on the hero.
 *
 * The artwork only contains the pink coating; the date behind it is drawn here
 * so it can be revealed. A canvas sits on top filled with the coating colour;
 * dragging erases it (destination-out) to uncover the Save-the-Date beneath.
 * Once ~55% is scratched away, the rest fades out automatically.
 */
export default function ScratchCard() {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const [revealed, setRevealed] = useState(false)
  const [showPop, setShowPop] = useState(false)
  const scratching = useRef(false)
  const painted = useRef(false)

  // When first revealed, celebrate with the Save-the-Date + countdown pop-up.
  useEffect(() => {
    if (revealed) {
      const t = window.setTimeout(() => setShowPop(true), 350)
      return () => window.clearTimeout(t)
    }
  }, [revealed])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')

    function paintCoat() {
      const rect = wrap.getBoundingClientRect()
      if (rect.width < 2) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // coating
      const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height)
      grad.addColorStop(0, '#f6ccc6')
      grad.addColorStop(1, C.scratchCoat)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, rect.width, rect.height)

      // "SCRATCH HERE" label to match the artwork
      ctx.fillStyle = 'rgba(150,95,85,0.65)'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `600 ${Math.round(rect.height * 0.32)}px "Josefin Sans", sans-serif`
      ctx.letterSpacing = '3px'
      ctx.fillText('SCRATCH HERE', rect.width / 2, rect.height / 2)
      painted.current = true
    }

    paintCoat()
    const ro = new ResizeObserver(() => {
      if (!revealed) paintCoat()
    })
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [revealed])

  function scratchAt(clientX, clientY) {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    const r = rect.height * 0.5
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
  }

  function measureCleared() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { width, height } = canvas
    const data = ctx.getImageData(0, 0, width, height).data
    let clear = 0
    const total = width * height
    for (let i = 3; i < data.length; i += 40) {
      if (data[i] === 0) clear++
    }
    return clear / (total / 10)
  }

  function onDown(e) {
    if (revealed) return
    scratching.current = true
    const p = e.touches ? e.touches[0] : e
    scratchAt(p.clientX, p.clientY)
  }
  function onMove(e) {
    if (!scratching.current || revealed) return
    const p = e.touches ? e.touches[0] : e
    scratchAt(p.clientX, p.clientY)
  }
  function onUp() {
    if (!scratching.current || revealed) return
    scratching.current = false
    if (measureCleared() > 0.5) setRevealed(true)
  }

  return (
    <div
      ref={wrapRef}
      className={`scratch ${revealed ? 'is-revealed' : ''}`}
      style={{
        left: `${SCRATCH.left}%`,
        top: `${SCRATCH.top}%`,
        width: `${SCRATCH.width}%`,
        height: `${SCRATCH.height}%`,
      }}
      role="button"
      aria-label="Scratch to reveal the save the date"
    >
      {/* Reveal underneath */}
      <div className="scratch__reveal" style={{ background: C.scratchCard }}>
        <span className="scratch__label">Save the Date</span>
        <span className="scratch__date">{WEDDING_DATE}</span>
      </div>

      {/* Scratch coating */}
      <canvas
        ref={canvasRef}
        className="scratch__canvas"
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchStart={onDown}
        onTouchMove={onMove}
        onTouchEnd={onUp}
      />

      {showPop && <SaveDatePop onClose={() => setShowPop(false)} />}
    </div>
  )
}
