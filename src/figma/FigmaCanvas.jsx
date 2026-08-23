import { useEffect } from 'react'
import { CANVAS, ITEMS } from './manifest'
import ScratchFig from './ScratchFig'
import RsvpFormFig from './RsvpFormFig'
import Countdown from '../invite/Countdown'
import './fig.css'

const DESIGN_W = CANVAS.w
const cqw = (px) => `${(px / DESIGN_W) * 100}cqw`

// Figma nodes replaced by React components (skip generic render).
const SKIP = new Set([
  '234:199',                                              // full-page base rect
  '234:236', '234:232', '234:233', '234:229', '234:230', // scratch -> ScratchFig
  '197:54',                                               // countdown placeholder -> Countdown
  '329:39', '329:36', '329:46', '329:49', '533:683',     // form labels/inputs -> RsvpFormFig
  '448:31',                                               // duplicate footer disc (real music button instead)
])
const GOLD = '#c9a24a'

function variantFor(it) {
  const center = it.x + it.w / 2
  if (it.align === 'CENTER' || (it.size || 0) >= 28) return 'up'
  if (center < 44) return 'left'
  if (center > 56) return 'right'
  return 'up'
}

function Item({ it }) {
  const base = {
    position: 'absolute', left: `${it.x}%`, top: `${it.y}%`,
    width: `${it.w}%`, height: `${it.h}%`, zIndex: it.z, opacity: it.o ?? 1,
  }

  if (it.kind === 'img') {
    // Full-width section backgrounds bleed to the site edges (no side gaps on
    // mobile). The inset event cards (~86% wide) and photos/florals keep their
    // exact Figma placement.
    const isBg = it.w > 92
    const style = isBg ? { ...base, left: '-2%', width: '104%' } : base
    return (
      <img className="fig__img" src={it.src} alt="" aria-hidden draggable="false"
        loading={it.y < 18 ? 'eager' : 'lazy'} decoding="async" style={style} />
    )
  }

  if (it.kind === 'text') {
    return (
      <div className={`fig__text rv rv--${variantFor(it)}`}
        style={{
          left: `${it.x}%`, top: `${it.y}%`, width: `${it.w}%`, zIndex: it.z,
          fontFamily: `'${it.font}', 'Cormorant Garamond', serif`,
          fontSize: cqw(it.size), fontWeight: it.weight,
          letterSpacing: it.spacing ? cqw(it.spacing) : 'normal',
          lineHeight: it.lineh ? cqw(it.lineh) : 1.15,
          color: it.color, textAlign: (it.align || 'left').toLowerCase(),
          // Short centred headings shouldn't wrap (keeps "SEPTEMBER 30, 2026" on one line)
          whiteSpace: it.align === 'CENTER' && !it.text.includes('\n') ? 'nowrap' : 'pre-line',
        }}>
        {it.text}
      </div>
    )
  }

  // shapes: dots (ellipse), connector/divider lines, or solid rects
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

/** Robust scroll-based reveal (IntersectionObserver proved unreliable). */
function useScrollReveal() {
  useEffect(() => {
    const root = document.querySelector('.fig')
    if (!root) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const reveal = () => {
      const vh = window.innerHeight
      root.querySelectorAll('.rv:not(.is-in)').forEach((el) => {
        const r = el.getBoundingClientRect()
        if (reduced || (r.top < vh * 0.9 && r.bottom > vh * 0.02)) el.classList.add('is-in')
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
    // re-run while images load and layout settles
    const iv = setInterval(reveal, 300)
    const stop = setTimeout(() => clearInterval(iv), 6000)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      clearInterval(iv); clearTimeout(stop)
    }
  }, [])
}

export default function FigmaCanvas({ onRsvpSaved }) {
  useScrollReveal()
  const scratch = ITEMS.find((i) => i.id === '234:236')
  const cdBox = ITEMS.find((i) => i.id === '197:54')

  return (
    <div className="fig" style={{ aspectRatio: `${CANVAS.w} / ${CANVAS.h}` }}>
      {ITEMS.filter((it) => !SKIP.has(it.id)).map((it) => (
        <Item key={it.id} it={it} />
      ))}

      {scratch && <ScratchFig rect={{ x: scratch.x, y: scratch.y, w: scratch.w, h: scratch.h }} />}

      {/* Inline countdown, in the empty space below "Until Our Forever Begins" */}
      {cdBox && (
        <div className="cd-inline" style={{ left: '8%', top: `${cdBox.y}%`, width: '84%' }}>
          <Countdown />
        </div>
      )}

      {/* Light backing panel for form legibility — sits BELOW the frame's
          lake & flowers (z 86) so it never covers the decorations, only fills
          the clear centre. */}
      <div className="fig__formbg" />

      {/* Real form inside the Figma RSVP background */}
      <div className="fig__form">
        <RsvpFormFig onSaved={onRsvpSaved} />
      </div>
    </div>
  )
}
