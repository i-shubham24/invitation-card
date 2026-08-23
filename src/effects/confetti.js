/**
 * confetti(x, y) — a one-shot "party popper" burst of colourful paper pieces.
 * Self-contained: creates a temporary full-screen canvas, animates the burst,
 * then removes itself. No dependencies.
 */
const COLORS = ['#e86a5c', '#f0a500', '#7bb662', '#4a90d9', '#c9569e', '#f5c542', '#ff8fab', '#9b6bd6']

/* A synthesized "party popper" pop + sparkle (Web Audio — no sound file). */
let audioCtx = null
function popSound() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    audioCtx = audioCtx || new AC()
    if (audioCtx.state === 'suspended') audioCtx.resume()
    const ctx = audioCtx
    const now = ctx.currentTime

    // 1) the pop — short noise burst through a bandpass
    const dur = 0.09
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2)
    const src = ctx.createBufferSource(); src.buffer = buf
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1300; bp.Q.value = 0.7
    const g = ctx.createGain(); g.gain.setValueAtTime(0.55, now); g.gain.exponentialRampToValueAtTime(0.001, now + dur)
    src.connect(bp).connect(g).connect(ctx.destination); src.start(now)

    // 2) a quick descending "thump" for the cork
    const osc = ctx.createOscillator(); osc.type = 'triangle'
    osc.frequency.setValueAtTime(880, now); osc.frequency.exponentialRampToValueAtTime(160, now + 0.08)
    const og = ctx.createGain(); og.gain.setValueAtTime(0.28, now); og.gain.exponentialRampToValueAtTime(0.001, now + 0.1)
    osc.connect(og).connect(ctx.destination); osc.start(now); osc.stop(now + 0.11)

    // 3) sparkle shimmer trailing off
    const sdur = 0.55
    const sbuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * sdur), ctx.sampleRate)
    const sd = sbuf.getChannelData(0)
    for (let i = 0; i < sd.length; i++) sd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / sd.length, 3)
    const ssrc = ctx.createBufferSource(); ssrc.buffer = sbuf
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4200
    const sg = ctx.createGain()
    sg.gain.setValueAtTime(0.0001, now + 0.02)
    sg.gain.linearRampToValueAtTime(0.16, now + 0.06)
    sg.gain.exponentialRampToValueAtTime(0.001, now + sdur)
    ssrc.connect(hp).connect(sg).connect(ctx.destination); ssrc.start(now + 0.02)
  } catch { /* audio not available — visual burst still fires */ }
}

export default function confetti(x, y) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  popSound()

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

  // Two "cannons" at the bottom-left and bottom-right corners, both firing a
  // stream of colourful sprinkles up toward the scratch text (x, y).
  // Two cannons at the bottom corners fire a strong, wide fan up and toward the
  // upper centre, so the sprinkles spread across most of the page for a moment.
  const cannons = [
    { x: W * 0.02, y: H * 1.0 },
    { x: W * 0.98, y: H * 1.0 },
  ]
  const aimX = W * 0.5, aimY = H * 0.1
  const per = 165
  for (const c of cannons) {
    const base = Math.atan2(aimY - c.y, aimX - c.x)
    const reach = Math.hypot(aimX - c.x, aimY - c.y)
    for (let i = 0; i < per; i++) {
      const a = base + rand(-0.62, 0.62)         // wide fan toward both sides
      const sp = rand(reach * 1.7, reach * 3.0)  // fired strongly
      const round = Math.random() < 0.4
      parts.push({
        x: c.x, y: c.y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        w: rand(6, 12), h: rand(8, 16), round,
        rot: rand(0, Math.PI * 2), vrot: rand(-10, 10),
        color: COLORS[(Math.random() * COLORS.length) | 0],
        flip: rand(0, Math.PI * 2), vflip: rand(6, 12),
      })
    }
  }

  let last = performance.now()
  const t0 = last
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05); last = now
    const life = (now - t0) / 1000
    ctx.clearRect(0, 0, W, H)
    for (const p of parts) {
      p.vy += 560 * dt          // gentler gravity => travels further
      const drag = Math.pow(0.965, dt * 60)
      p.vx *= drag; p.vy *= drag
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.rot += p.vrot * dt
      p.flip += p.vflip * dt
      ctx.save()
      ctx.globalAlpha = Math.max(0, 1 - life / 3.2)
      ctx.translate(p.x, p.y)
      ctx.fillStyle = p.color
      if (p.round) {
        ctx.beginPath()
        ctx.arc(0, 0, p.w * 0.4, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.rotate(p.rot)
        ctx.scale(1, Math.cos(p.flip))   // fluttering
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      }
      ctx.restore()
    }
    if (life < 3.4) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}
