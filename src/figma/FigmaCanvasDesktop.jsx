import { useEffect } from 'react'
import { CANVAS_D, ITEMS_D } from './manifest.desktop'
import ScratchFig from './ScratchFig'
import RsvpFormFig from './RsvpFormFig'
import Countdown from '../invite/Countdown'
import './fig.css'
import './figd.css'

const DESIGN_W = CANVAS_D.w
const cqw = (px) => `${(px / DESIGN_W) * 100}cqw`

// Figma nodes replaced by React components (skip generic render).
//  - all `719:*` nodes are the interactive RSVP controls the teammate added
//  - the `683:*` ids below are the hero scratch box + its buried text, and the
//    RSVP field labels/input that <RsvpFormFig/> re-renders itself.
const SKIP_IDS = new Set([
  // hero scratch (box, coating, buried Save-the-Date + date, "SCRATCH HERE")
  '683:2685', '683:2697', '683:2704', '683:2692', '683:2696',
  // RSVP field label + input (the rest of the form is the 719:* namespace)
  '683:2678', '683:2681', '683:2682', '683:2683',
])
const skip = (id) => id.startsWith('719:') || SKIP_IDS.has(id)

const GOLD = '#c9a24a'

function variantFor(it) {
  const center = it.x + it.w / 2
  if (it.align === 'CENTER' || (it.size || 0) >= 40) return 'up'
  if (center < 42) return 'left'
  if (center > 58) return 'right'
  return 'up'
}

function Item({ it }) {
  const base = {
    position: 'absolute', left: `${it.x}%`, top: `${it.y}%`,
    width: `${it.w}%`, height: `${it.h}%`, zIndex: it.z, opacity: it.o ?? 1,
  }

  if (it.kind === 'img') {
    const isBg = it.w > 96
    const style = isBg ? { ...base, left: '-1%', width: '102%' } : base
    return (
      <img className="fig__img" src={it.src} alt="" aria-hidden draggable="false"
        loading={it.y < 12 ? 'eager' : 'lazy'} decoding="async" style={style} />
    )
  }

  if (it.kind === 'text') {
    // footer texts render statically (reveal fires too late that far down)
    const reveal = it.y < 93.5
    return (
      <div className={reveal ? `fig__text rv rv--${variantFor(it)}` : 'fig__text'}
        style={{
          left: `${it.x}%`, top: `${it.y}%`, width: `${it.w}%`, zIndex: it.z,
          fontFamily: `'${it.font}', 'Cormorant Garamond', serif`,
          fontSize: cqw(it.size), fontWeight: it.weight,
          letterSpacing: it.spacing ? cqw(it.spacing) : 'normal',
          lineHeight: it.lineh ? cqw(it.lineh) : 1.15,
          color: it.color, textAlign: (it.align || 'left').toLowerCase(),
          whiteSpace: it.align === 'CENTER' && !it.text.includes('\n') ? 'nowrap' : 'pre-line',
        }}>
        {it.text}
      </div>
    )
  }

  if (it.ellipse) {
    return <div style={{ ...base, background: it.fill || it.stroke || '#c98a76', borderRadius: '50%' }} />
  }
  if (it.line || it.w < 0.5 || it.h < 0.5) {
    const horizontal = it.w >= it.h
    const thick = cqw(Math.max(it.sw || 1.2, 1.2))
    return (
      <div style={{
        position: 'absolute', left: `${it.x}%`, top: `${it.y}%`, zIndex: it.z,
        width: horizontal ? `${it.w}%` : thick,
        height: horizontal ? thick : `${it.h}%`,
        background: it.stroke || it.fill || GOLD, opacity: it.o ?? 1,
      }} />
    )
  }
  return (
    <div style={{ ...base, background: it.fill || 'transparent',
      opacity: it.fillOpacity != null ? it.fillOpacity : base.opacity,
      borderRadius: it.r ? cqw(it.r) : undefined }} />
  )
}

function useScrollReveal(active) {
  useEffect(() => {
    if (!active) return
    const root = document.querySelector('.figd')
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const reveal = () => {
      const vh = window.innerHeight
      root.querySelectorAll('.rv:not(.is-in)').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (reduced || (r.top < vh * 0.72 && r.bottom > vh * 0.04)) el.classList.add('is-in')
      })
    }
    reveal()
    let tick = false
    const onScroll = () => {
      if (tick) return
      tick = true
      requestAnimationFrame(() => { tick = false; reveal() })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    const iv = setInterval(reveal, 300)
    const stop = setTimeout(() => clearInterval(iv), 6000)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      clearInterval(iv); clearTimeout(stop)
    }
  }, [active])
}

// Hero scratch box (Figma rect 683:2685 / 2697), buried "3 December, 2026".
const SCRATCH_RECT = { x: 26.06, y: 5.576, w: 48.13, h: 1.366 }
// Countdown, centred just below the "Until Our Forever Begins" heading.
const CD_BOX = { x: 26, y: 12.55, w: 48 }
// RSVP form region — aligned to the Figma name-input width.
const FORM_BOX = { x: 20.37, y: 88.85, w: 60.44 }

export default function FigmaCanvasDesktop({ onRsvpSaved, opened }) {
  useScrollReveal(opened)

  return (
    <div className="figd" style={{ aspectRatio: `${CANVAS_D.w} / ${CANVAS_D.h}` }}>
      {ITEMS_D.filter((it) => !skip(it.id)).map((it) => (
        <Item key={it.id} it={it} />
      ))}

      <ScratchFig rect={SCRATCH_RECT} date="3 December, 2026" />

      <div className="cd-inline" style={{ left: `${CD_BOX.x}%`, top: `${CD_BOX.y}%`, width: `${CD_BOX.w}%` }}>
        <Countdown />
      </div>

      <div className="figd__form" style={{ left: `${FORM_BOX.x}%`, top: `${FORM_BOX.y}%`, width: `${FORM_BOX.w}%` }}>
        <RsvpFormFig onSaved={onRsvpSaved} />
      </div>
    </div>
  )
}
