import { useEffect, useRef } from 'react'
import './petals.css'

/**
 * Petals — small, simple blossom petals drifting down. No click/touch burst.
 * One canvas, one rAF loop, delta-time physics, parks when hidden, off for
 * reduced-motion. Petals are tiny drawn shapes (not big flower images).
 */
const MAX = 120
const rand = (a, b) => a + Math.random() * (b - a)
const COLORS = ['#f6c9c0', '#f3b7ae', '#efd0c9', '#e9b7ac', '#f7dcd6']

export default function Petals() {
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let W = 0, H = 0, dpr = 1, raf = 0, last = performance.now(), spawnT = 0, running = true
    const parts = []

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = innerWidth; H = innerHeight
      canvas.width = W * dpr; canvas.height = H * dpr
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    function make(o = {}) {
      if (parts.length >= MAX) parts.shift()
      parts.push({
        x: o.x ?? rand(-10, W + 10),
        y: o.y ?? rand(-30, -6),
        vx: rand(-10, 10),
        vy: rand(16, 34),
        r: rand(3.5, 7.5),           // small
        rot: rand(0, Math.PI * 2),
        vrot: rand(-1, 1),
        sway: rand(0.5, 1.3),
        phase: rand(0, Math.PI * 2),
        color: COLORS[(Math.random() * COLORS.length) | 0],
        alpha: rand(0.75, 1),
      })
    }
    function petal(p) {
      // simple teardrop petal
      ctx.beginPath()
      ctx.moveTo(0, -p.r)
      ctx.quadraticCurveTo(p.r, 0, 0, p.r)
      ctx.quadraticCurveTo(-p.r, 0, 0, -p.r)
      ctx.fillStyle = p.color
      ctx.fill()
    }
    function frame(now) {
      raf = requestAnimationFrame(frame)
      if (!running) return
      const dt = Math.min((now - last) / 1000, 0.05); last = now
      const target = W < 640 ? 32 : W < 1100 ? 34 : 42
      spawnT -= dt
      if (parts.length < target && spawnT <= 0) { make(); spawnT = 0.16 }
      ctx.clearRect(0, 0, W, H)
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]
        p.phase += p.sway * dt * 2
        p.x += (p.vx + Math.sin(p.phase) * 16) * dt
        p.y += p.vy * dt
        p.rot += p.vrot * dt
        if (p.y > H + 30) { parts.splice(i, 1); continue }
        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        petal(p)
        ctx.restore()
      }
      for (const b of flutter) { stepButterfly(b, dt); drawButterfly(b) }
    }
    // A couple of butterflies that flutter across the site.
    const flutter = [
      { x: W * 0.2, y: H * 0.4, vx: 26, vy: -8, phase: 0, flap: 0, size: 14, hue: '#e7a6c4' },
      { x: W * 0.7, y: H * 0.65, vx: -22, vy: 6, phase: 2, flap: 1, size: 12, hue: '#a9b6e0' },
    ]
    function drawButterfly(b) {
      const wing = Math.abs(Math.cos(b.flap)) * b.size + b.size * 0.25
      ctx.save()
      ctx.translate(b.x, b.y)
      ctx.rotate(Math.atan2(b.vy, b.vx))
      ctx.globalAlpha = 0.96
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.ellipse(s * b.size * 0.5, -b.size * 0.3, wing * 0.55, b.size * 0.7, s * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = b.hue
        ctx.fill()
        ctx.beginPath()
        ctx.ellipse(s * b.size * 0.45, b.size * 0.4, wing * 0.4, b.size * 0.5, s * -0.4, 0, Math.PI * 2)
        ctx.fillStyle = b.hue
        ctx.fill()
      }
      ctx.fillStyle = '#6b4a44'
      ctx.fillRect(-1, -b.size * 0.7, 2, b.size * 1.4)
      ctx.restore()
    }
    function stepButterfly(b, dt) {
      b.flap += dt * 12
      b.phase += dt
      b.x += b.vx * dt
      b.y += (b.vy + Math.sin(b.phase) * 14) * dt
      if (b.x < -30) b.x = W + 30
      if (b.x > W + 30) b.x = -30
      if (b.y < -30) b.y = H + 30
      if (b.y > H + 30) b.y = -30
    }

    function onVis() { running = !document.hidden; last = performance.now() }
    resize()
    for (let i = 0; i < 16; i++) make({ y: rand(0, H) })
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVis)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas ref={ref} className="petals" aria-hidden="true" />
}
