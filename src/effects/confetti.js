/**
 * confetti(x, y) — a one-shot "party popper" burst of colourful paper pieces.
 * Self-contained: creates a temporary full-screen canvas, animates the burst,
 * then removes itself. No dependencies.
 */
const COLORS = ['#e86a5c', '#f0a500', '#7bb662', '#4a90d9', '#c9569e', '#f5c542', '#ff8fab', '#9b6bd6']

export default function confetti(x, y) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const canvas = document.createElement('canvas')
  canvas.style.cssText =
    'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:96'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const W = innerWidth, H = innerHeight
  canvas.width = W * dpr; canvas.height = H * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const rand = (a, b) => a + Math.random() * (b - a)
  const parts = []
  const N = 200
  for (let i = 0; i < N; i++) {
    const a = rand(-Math.PI * 1.02, Math.PI * 0.02) // wide fan, nearly full upper arc
    const sp = rand(380, 900)                        // faster => spreads further
    parts.push({
      x, y,
      vx: Math.cos(a) * sp + rand(-110, 110),
      vy: Math.sin(a) * sp,
      w: rand(6, 11), h: rand(8, 15),
      rot: rand(0, Math.PI * 2), vrot: rand(-10, 10),
      color: COLORS[(Math.random() * COLORS.length) | 0],
      flip: rand(0, Math.PI * 2), vflip: rand(6, 12),
    })
  }

  let last = performance.now()
  const t0 = last
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now
    const life = (now - t0) / 1000
    ctx.clearRect(0, 0, W, H)
    for (const p of parts) {
      p.vy += 900 * dt          // gravity
      p.vx *= Math.pow(0.9, dt * 60)
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.rot += p.vrot * dt
      p.flip += p.vflip * dt
      ctx.save()
      ctx.globalAlpha = Math.max(0, 1 - life / 2.6)
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.scale(1, Math.cos(p.flip))   // fluttering
      ctx.fillStyle = p.color
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    }
    if (life < 2.8) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}
