import { useEffect, useRef } from 'react'
import './petals.css'

/**
 * Petals — blossom petals drifting down + fluttering butterflies, with a small
 * flower burst on click/tap. One canvas, one rAF loop, delta-time physics,
 * parks when hidden, off for reduced-motion.
 */
const MAX = 156
const rand = (a, b) => a + Math.random() * (b - a)
const COLORS = ['#f6c9c0', '#f3b7ae', '#efd0c9', '#e9b7ac', '#f7dcd6', '#f2b6c8']

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
        vx: o.vx ?? rand(-10, 10),
        vy: o.vy ?? rand(16, 34),
        r: o.r ?? rand(4.6, 9.8),          // +30% size
        rot: rand(0, Math.PI * 2),
        vrot: rand(-1.2, 1.2),
        sway: rand(0.5, 1.3),
        phase: rand(0, Math.PI * 2),
        color: COLORS[(Math.random() * COLORS.length) | 0],
        alpha: o.alpha ?? rand(0.9, 1),    // more opaque
        life: o.life ?? Infinity,
        grav: o.grav ?? 0,
        drag: o.drag ?? 1,
        age: 0,
      })
    }
    function petal(p) {
      ctx.beginPath()
      ctx.moveTo(0, -p.r)
      ctx.quadraticCurveTo(p.r, 0, 0, p.r)
      ctx.quadraticCurveTo(-p.r, 0, 0, -p.r)
      ctx.fillStyle = p.color
      ctx.fill()
    }
    // Small flower burst on click/tap (4–5 blooms).
    function burst(x, y) {
      const n = 4 + ((Math.random() * 2) | 0)
      for (let i = 0; i < n; i++) {
        const a = rand(0, Math.PI * 2)
        const sp = rand(70, 180)
        make({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40,
          r: rand(6, 11), life: rand(1.0, 1.7), grav: rand(200, 340), drag: 0.9, alpha: 1,
        })
      }
    }

    // Butterflies (four, different colours).
    const flutter = [
      { x: W * 0.2, y: H * 0.35, vx: 26, vy: -8, phase: 0, flap: 0, size: 15, hue: '#e7a6c4' },
      { x: W * 0.75, y: H * 0.6, vx: -22, vy: 6, phase: 2, flap: 1, size: 13, hue: '#a9b6e0' },
      { x: W * 0.5, y: H * 0.82, vx: 20, vy: -6, phase: 4, flap: 0.5, size: 14, hue: '#f2cf6b' },
      { x: W * 0.35, y: H * 0.5, vx: -18, vy: -11, phase: 1, flap: 1.5, size: 12, hue: '#86cbb0' },
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
        ctx.fillStyle = b.hue; ctx.fill()
        ctx.beginPath()
        ctx.ellipse(s * b.size * 0.45, b.size * 0.4, wing * 0.4, b.size * 0.5, s * -0.4, 0, Math.PI * 2)
        ctx.fillStyle = b.hue; ctx.fill()
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

    function frame(now) {
      raf = requestAnimationFrame(frame)
      if (!running) return
      const dt = Math.min((now - last) / 1000, 0.05); last = now
      const target = W < 640 ? 42 : W < 1100 ? 44 : 55   // +30% quantity
      spawnT -= dt
      if (parts.reduce((n, p) => (p.life === Infinity ? n + 1 : n), 0) < target && spawnT <= 0) {
        make(); spawnT = 0.12
      }
      ctx.clearRect(0, 0, W, H)
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]
        if (p.grav) p.vy += p.grav * dt
        if (p.drag !== 1) { const d = Math.pow(p.drag, dt * 60); p.vx *= d; p.vy *= d }
        p.phase += p.sway * dt * 2
        p.x += (p.vx + Math.sin(p.phase) * 16) * dt
        p.y += p.vy * dt
        p.rot += p.vrot * dt
        p.age += dt
        let alpha = p.alpha
        if (p.life !== Infinity) {
          if (p.age >= p.life) { parts.splice(i, 1); continue }
          alpha = p.alpha * (1 - p.age / p.life)
        } else if (p.y > H + 30) { parts.splice(i, 1); continue }
        ctx.save()
        ctx.globalAlpha = Math.max(0, alpha)
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        petal(p)
        ctx.restore()
      }
      for (const b of flutter) { stepButterfly(b, dt); drawButterfly(b) }
    }

    function onPointer(e) {
      if (e.clientX == null) return
      burst(e.clientX, e.clientY)
    }
    function onVis() { running = !document.hidden; last = performance.now() }

    resize()
    for (let i = 0; i < 22; i++) make({ y: rand(0, H) })
    window.addEventListener('resize', resize)
    window.addEventListener('pointerdown', onPointer, { passive: true })
    document.addEventListener('visibilitychange', onVis)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas ref={ref} className="petals" aria-hidden="true" />
}
