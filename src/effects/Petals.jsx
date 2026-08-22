import { useEffect, useRef } from 'react'
import './petals.css'

/**
 * Petals — gentle falling flowers + leaves, with a burst on click/tap.
 *
 * One canvas, one rAF loop. Flowers are drawn from a small PNG token; leaves
 * are drawn as vector paths. Performance-guarded: DPR capped at 2, hard cap on
 * particle count, delta-time physics, parks itself when the tab is hidden, and
 * disabled entirely under prefers-reduced-motion.
 */
const MAX = 90
const rand = (a, b) => a + Math.random() * (b - a)

export default function Petals() {
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const flower = new Image()
    flower.src = '/decor/petal.png'

    let W = 0, H = 0, dpr = 1
    let raf = 0, last = performance.now(), spawnT = 0, running = true
    const parts = []

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = W + 'px'
      canvas.style.height = H + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function make(o = {}) {
      if (parts.length >= MAX) parts.shift()
      const kind = o.kind ?? (Math.random() < 0.62 ? 'flower' : 'leaf')
      parts.push({
        kind,
        x: o.x ?? rand(-20, W + 20),
        y: o.y ?? rand(-40, -10),
        vx: o.vx ?? rand(-16, 16),
        vy: o.vy ?? rand(24, 52),
        r: o.r ?? (kind === 'leaf' ? rand(7, 12) : rand(10, 20)),
        rot: rand(0, Math.PI * 2),
        vrot: rand(-1.3, 1.3),
        sway: rand(0.6, 1.5),
        phase: rand(0, Math.PI * 2),
        alpha: o.alpha ?? rand(0.75, 1),
        life: o.life ?? Infinity,
        age: 0,
        grav: o.grav ?? 0,
        drag: o.drag,
      })
    }

    function leaf(p) {
      ctx.beginPath()
      ctx.moveTo(0, -p.r)
      ctx.quadraticCurveTo(p.r * 0.9, 0, 0, p.r)
      ctx.quadraticCurveTo(-p.r * 0.9, 0, 0, -p.r)
      ctx.fillStyle = '#8ab06a'
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(0, -p.r); ctx.lineTo(0, p.r)
      ctx.strokeStyle = 'rgba(90,120,70,0.6)'; ctx.lineWidth = 0.8; ctx.stroke()
    }

    function burst(x, y) {
      for (let i = 0; i < 16; i++) {
        const a = (Math.PI * 2 * i) / 16 + rand(-0.2, 0.2)
        const s = rand(90, 240)
        make({
          x, y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s - 40,
          r: rand(9, 18),
          life: rand(1, 1.7),
          grav: rand(240, 380),
          drag: 0.9,
        })
      }
    }

    function frame(now) {
      raf = requestAnimationFrame(frame)
      if (!running) return
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      const target = W < 640 ? 16 : W < 1100 ? 24 : 32
      const ambient = parts.reduce((n, p) => (p.life === Infinity ? n + 1 : n), 0)
      spawnT -= dt
      if (ambient < target && spawnT <= 0) { make(); spawnT = 0.32 }

      ctx.clearRect(0, 0, W, H)
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]
        p.age += dt
        if (p.grav) p.vy += p.grav * dt
        if (p.drag) { const d = Math.pow(p.drag, dt * 60); p.vx *= d; p.vy *= d }
        p.phase += p.sway * dt * 2
        p.x += (p.vx + Math.sin(p.phase) * 22) * dt
        p.y += p.vy * dt
        p.rot += p.vrot * dt

        let a = p.alpha
        if (p.life !== Infinity) {
          if (p.age >= p.life) { parts.splice(i, 1); continue }
          a = p.alpha * (1 - p.age / p.life)
        } else if (p.y > H + 50) { p.y = rand(-50, -10); p.x = rand(-20, W + 20); continue }

        ctx.save()
        ctx.globalAlpha = Math.max(0, Math.min(1, a))
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        if (p.kind === 'flower' && flower.complete && flower.naturalWidth) {
          ctx.drawImage(flower, -p.r, -p.r, p.r * 2, p.r * 2)
        } else {
          leaf(p)
        }
        ctx.restore()
      }
    }

    function onPointer(e) {
      if (e.clientX == null) return
      // ignore clicks on real controls so we don't spawn over buttons/inputs
      const t = e.target
      if (t && t.closest && t.closest('button, input, a, .scratch, .rsvp-card')) return
      burst(e.clientX, e.clientY)
    }
    function onVis() { running = !document.hidden; last = performance.now() }

    resize()
    for (let i = 0; i < 8; i++) make({ y: rand(0, H) })
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
