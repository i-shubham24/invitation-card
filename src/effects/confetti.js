/**
 * confetti(x, y) — a one-shot "party popper" burst of drifting flower petals
 * (three different petal forms, soft-blush palette). Self-contained: creates a
 * temporary full-screen canvas, animates the burst, then removes itself.
 * No dependencies.
 */
// Blossom palette with real range — rose/coral/blush pinks, a peach, a lilac
// that echoes the background gradient, and warm golds — so a single burst reads
// as a mix of shades rather than one flat pink.
const COLORS = [
  '#f2b6c8', // rose pink
  '#e39aa0', // deeper rose
  '#f3b7ae', // coral blush
  '#f7dcd6', // pale blush
  '#efd0c9', // peach cream
  '#e8b7d0', // pink-lilac
  '#dcd3f2', // lilac (ties to the background)
  '#d8b77a', // soft gold
  '#e4b95e', // warm gold
  '#eed9b4', // pale champagne gold
]

// Three petal silhouettes, drawn centred at the origin with characteristic
// radius r. `form` picks one so a single burst mixes different petal shapes.
function drawPetal(ctx, form, r) {
  ctx.beginPath()
  if (form === 0) {
    // slim almond / leaf petal
    ctx.moveTo(0, -r)
    ctx.quadraticCurveTo(r * 0.9, 0, 0, r)
    ctx.quadraticCurveTo(-r * 0.9, 0, 0, -r)
  } else if (form === 1) {
    // rounded teardrop petal — point at top, full rounded base
    ctx.moveTo(0, -r)
    ctx.bezierCurveTo(r * 0.98, -r * 0.2, r * 0.7, r, 0, r)
    ctx.bezierCurveTo(-r * 0.7, r, -r * 0.98, -r * 0.2, 0, -r)
  } else {
    // cherry-blossom petal — two lobes with a soft notch at the outer edge
    ctx.moveTo(0, r)
    ctx.bezierCurveTo(r, r * 0.3, r * 0.82, -r * 0.9, r * 0.18, -r)
    ctx.quadraticCurveTo(0, -r * 0.72, -r * 0.18, -r)
    ctx.bezierCurveTo(-r * 0.82, -r * 0.9, -r, r * 0.3, 0, r)
  }
  ctx.fill()
}

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
      parts.push({
        x: c.x, y: c.y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        form: (Math.random() * 3) | 0,           // mix the three petal shapes
        size: rand(6, 11),
        rot: rand(0, Math.PI * 2), vrot: rand(-6, 6),
        color: COLORS[(Math.random() * COLORS.length) | 0],
        flip: rand(0, Math.PI * 2), vflip: rand(5, 10),
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
      ctx.rotate(p.rot)
      ctx.scale(1, Math.cos(p.flip))     // flutter — petal tips toward/away
      ctx.fillStyle = p.color
      drawPetal(ctx, p.form, p.size)
      ctx.restore()
    }
    if (life < 3.4) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}
