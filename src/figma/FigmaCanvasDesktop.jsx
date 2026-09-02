import { useEffect } from 'react'
import { CANVAS_D, ITEMS_D } from './manifest.desktop'
import { textColor, textWeight } from './textboost'
import ScratchFig from './ScratchFig'
import ScallopPanel from './ScallopPanel'
import RsvpFormFig from './RsvpFormFig'
import NoteCard from './NoteCard'
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
  // flat form panel (ellipses + rect) -> ScallopPanel (3-hill scalloped top)
  '683:2674', '683:2675', '683:2676', '683:2677',
  // dummy footer vinyl disc — the real music button is rendered separately
  '683:2810',
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
    const style = isBg
      ? { ...base, left: '-1%', width: '102%' }
      : { ...base, borderRadius: it.r ? cqw(it.r) : undefined } // round the schedule cards
    return (
      <img className="fig__img" src={it.src} alt="" aria-hidden draggable="false"
        loading={it.y < 12 ? 'eager' : 'lazy'} decoding="async" style={style} />
    )
  }

  if (it.kind === 'text') {
    // footer texts render statically (reveal fires too late that far down)
    const reveal = it.y < 93.5
    // The footer block (y > 96) reads too small on the wide desktop — scale it up.
    const fscale = it.y > 96 ? 2 : 1
    return (
      <div className={reveal ? `fig__text rv rv--${variantFor(it)}` : 'fig__text'}
        style={{
          left: `${it.x}%`, top: `${it.y}%`, width: `${it.w}%`, zIndex: it.z,
          fontFamily: `'${it.font}', 'Cormorant Garamond', serif`,
          fontSize: cqw(it.size * fscale), fontWeight: textWeight(it),
          letterSpacing: it.spacing ? cqw(it.spacing) : 'normal',
          lineHeight: it.lineh ? cqw(it.lineh * fscale) : 1.15,
          color: textColor(it), textAlign: (it.align || 'left').toLowerCase(),
          textShadow: it.shadow || undefined,
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
// y/h shifted with the taller canvas (Sukhmani card inserted in the schedule).
const SCRATCH_RECT = { x: 26.06, y: 5.068, w: 48.13, h: 1.241 }
// Countdown — matched to the translucent box (node 683:2714), shifted with the
// taller canvas, so the cells still sit vertically centred inside it.
const CD_BOX = { x: 26.66, y: 11.014, w: 46.01 }
// RSVP form region — aligned to the Figma name-input width; shifted down with
// the taller canvas (Sukhmani card inserted above in the schedule).
const FORM_BOX = { x: 20.37, y: 88.47, w: 60.44 }

// RSVP heading block (RSVP / Kindly Respond / BEFORE / SEPTEMBER 30)
const RSVP_HEAD = new Set(['683:2679', '683:2775', '683:2776', '683:2684'])

export default function FigmaCanvasDesktop({ onRsvpSaved, opened }) {
  useScrollReveal(opened)

  return (
    <div className="figd" style={{ aspectRatio: `${CANVAS_D.w} / ${CANVAS_D.h}` }}>
      {ITEMS_D.filter((it) => !skip(it.id)).map((it) => (
        <Item key={it.id} it={it} />
      ))}

      {/* Decorative images for Note section (scaled for desktop heights) */}
      <Item it={{ id: 'msg1', kind: 'img', z: 89, x: -5, y: 76.36, w: 58.5, h: 3.05, src: '/figma/msg1.png', contain: true }} />
      <Item it={{ id: 'msg3', kind: 'img', z: 89, x: 5, y: 76.36, w: 81.0, h: 3.57, src: '/figma/msg3.png', contain: true }} />
      <Item it={{ id: 'msg2', kind: 'img', z: 89, x: 10, y: 76.36, w: 83.5, h: 4.31, src: '/figma/msg2.png', contain: true }} />

      {/* Form background — scalloped "3 curve hills" panel, sized to end just
          below SEND RSVP with the single-column events; vbh scales with the
          height so the bumps keep their proportion (stay round). */}
      <ScallopPanel x={5.526} y={86.78} w={85.992} h={5.63} vbh={935} />

      <ScratchFig rect={SCRATCH_RECT} date="3 December, 2026" />

      <div className="cd-inline" style={{ left: `${CD_BOX.x}%`, top: `${CD_BOX.y}%`, width: `${CD_BOX.w}%` }}>
        <Countdown />
      </div>

      <NoteCard style={{ top: '77.82%', width: '51%', left: '24.5%' }} />

      <div className="figd__form" style={{ left: `${FORM_BOX.x}%`, top: `${FORM_BOX.y}%`, width: `${FORM_BOX.w}%` }}>
        <RsvpFormFig onSaved={onRsvpSaved} />
      </div>
    </div>
  )
}
