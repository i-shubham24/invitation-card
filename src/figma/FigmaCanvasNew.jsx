import { CANVAS_N, ITEMS_N } from './manifest.newdesktop'
import { textColor, textWeight } from './textboost'
import ScratchFig from './ScratchFig'
import Countdown from '../invite/Countdown'
import './fcn.css'

/**
 * FigmaCanvasNew — the redesigned wide (1440) desktop, rendered natively from
 * the new Figma board (hero + Until/countdown + Grandparents + Families down to
 * "A CELEBRATION OF LOVE, FAITH & FOREVER"). Sits above the existing desktop
 * canvas, whose matching top is cropped away. Same generic renderer as the
 * mobile canvas; the scratch card and countdown are React components overlaid
 * on their Figma slots.
 */
const DESIGN_W = CANVAS_N.w
const cqw = (px) => `${(px / DESIGN_W) * 100}cqw`

// Figma nodes replaced by React components (skip generic render).
const SKIP = new Set([
  '683:2685', '683:2697', '683:2696', '771:253', '771:249', // scratch -> ScratchFig
  '771:256', // pink countdown box — keep only the countdown ("box is just a marking")
])

// Scratch box (683:2685: x567 y677 w306 h133) and countdown box (771:256:
// x411 y1164 w613 h128) as % of the 1440 x CANVAS_N.h board.
const pctX = (v) => (v / DESIGN_W) * 100
const pctY = (v) => (v / CANVAS_N.h) * 100
const SCRATCH = { x: pctX(567), y: pctY(677), w: pctX(306), h: pctY(133) }
const CD = { x: pctX(411), y: pctY(1164), w: pctX(613), h: pctY(128) }

function Item({ it }) {
  const base = {
    position: 'absolute', left: `${it.x}%`, top: `${it.y}%`,
    width: `${it.w}%`, height: `${it.h}%`, zIndex: it.z, opacity: it.o ?? 1,
  }

  if (it.kind === 'img') {
    const isBg = it.w > 96 // full-bleed section backgrounds bleed to the edges
    const style = isBg ? { ...base, left: '-1%', width: '102%' } : base
    return (
      <img className="fcn__img" src={it.src} alt="" aria-hidden draggable="false"
        loading={it.y < 12 ? 'eager' : 'lazy'} decoding="async" style={style} />
    )
  }

  if (it.kind === 'text') {
    return (
      <div className="fcn__text"
        style={{
          left: `${it.x}%`, top: `${it.y}%`, width: `${it.w}%`, zIndex: it.z,
          fontFamily: `'${it.font}', 'Cormorant Garamond', serif`,
          fontSize: cqw(it.size), fontWeight: textWeight(it),
          letterSpacing: it.spacing ? cqw(it.spacing) : 'normal',
          lineHeight: it.lineh ? cqw(it.lineh) : 1.15,
          color: textColor(it), textAlign: (it.align || 'left').toLowerCase(),
          textShadow: it.shadow || undefined,
          whiteSpace: it.align === 'CENTER' && !it.text.includes('\n') ? 'nowrap' : 'pre-line',
        }}>
        {it.text}
      </div>
    )
  }

  if (it.line || it.w < 0.5 || it.h < 0.5) {
    const horizontal = it.w >= it.h
    const thick = cqw(Math.max(it.sw || 1.2, 1.2))
    return (
      <div style={{
        position: 'absolute', left: `${it.x}%`, top: `${it.y}%`, zIndex: it.z,
        width: horizontal ? `${it.w}%` : thick,
        height: horizontal ? thick : `${it.h}%`,
        background: it.stroke || it.fill || '#c9a24a', opacity: it.o ?? 1,
      }} />
    )
  }
  return (
    <div style={{ ...base, background: it.fill || 'transparent',
      borderRadius: it.r ? cqw(it.r) : undefined }} />
  )
}

export default function FigmaCanvasNew() {
  return (
    <div className="fcn" style={{ aspectRatio: `${CANVAS_N.w} / ${CANVAS_N.h}` }}>
      {ITEMS_N.filter((it) => !SKIP.has(it.id)).map((it) => (
        <Item key={it.id} it={it} />
      ))}

      <ScratchFig rect={SCRATCH} date="3 December, 2026" />

      <div className="fcn__cd cd-inline"
        style={{ position: 'absolute', left: `${CD.x}%`, top: `${CD.y}%`, width: `${CD.w}%`, height: `${CD.h}%` }}>
        <Countdown />
      </div>
    </div>
  )
}
