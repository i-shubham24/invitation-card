import ScratchFig from './ScratchFig'
import Countdown from '../invite/Countdown'
import './hero.css'

/**
 * NewDesktopHero — the redesigned wide (1440) desktop hero from Figma
 * ("Rectangle 43" board: ornate frame 770:233 + names + scratch + hashtag +
 * "Until Our Forever Begins" + countdown). Rendered full-width above the
 * existing desktop canvas (whose old hero is cropped away). Coordinates are the
 * Figma positions as % of the 1440 x 1330 hero box; text is centred on the hero
 * (the design is symmetric). Fonts sized in cqw so it scales at any width.
 */
const W = 1440
const H = 1330
const yp = (v) => `${(v / H) * 100}%`
const cqw = (v) => `${(v / W) * 100}cqw`

// A horizontally-centred element at Figma y, styled as given.
const centered = (y, extra = {}) => ({
  position: 'absolute', left: '50%', top: yp(y), transform: 'translateX(-50%)',
  whiteSpace: 'nowrap', textAlign: 'center', ...extra,
})

export default function NewDesktopHero() {
  return (
    <div className="ndh">
      <img className="ndh__frame" src="/hero-desktop/hero-frame.png" alt="" aria-hidden draggable="false" />

      <img className="ndh__mono" src="/hero-desktop/monogram.png" alt="" aria-hidden draggable="false"
        style={{ position: 'absolute', left: '50%', top: yp(100), transform: 'translateX(-50%)', width: `${(300 / W) * 100}%` }} />

      <div style={centered(412, { fontFamily: "'Beau Rivage', cursive", fontSize: cqw(50), lineHeight: 1.1, color: '#000' })}>
        Akashdeep Singh Sehdev
      </div>

      <img className="ndh__flourish" src="/hero-desktop/flourish-l.png" alt="" aria-hidden
        style={{ position: 'absolute', left: `${(537 / W) * 100}%`, top: yp(448), width: `${(170 / W) * 100}%` }} />
      <img className="ndh__flourish" src="/hero-desktop/flourish-r.png" alt="" aria-hidden
        style={{ position: 'absolute', left: `${(697 / W) * 100}%`, top: yp(448), width: `${(170 / W) * 100}%` }} />

      <div style={centered(500, { fontFamily: "'Great Vibes', cursive", fontSize: cqw(40), color: '#cda163' })}>
        Weds
      </div>

      <div style={centered(568, { fontFamily: "'Beau Rivage', cursive", fontSize: cqw(48), lineHeight: 1.1, color: '#000' })}>
        Harmandip Kaur
      </div>

      {/* Scratch card reveals the date (same mechanic as the rest of the site) */}
      <ScratchFig rect={{ x: 39.4, y: (677 / H) * 100, w: 21.25, h: (133 / H) * 100 }} date="3 December, 2026" />

      <div style={centered(824, { fontFamily: "'Cormorant Garamond', serif", fontSize: cqw(20), letterSpacing: cqw(0.6), color: '#000' })}>
        #AKASHKAMANN
      </div>

      <img className="ndh__decor" src="/hero-desktop/decor.png" alt="" aria-hidden draggable="false"
        style={{ position: 'absolute', left: `${(1104 / W) * 100}%`, top: yp(1057), width: `${(476 / W) * 100}%` }} />

      <div style={centered(1120, { fontFamily: "'Niconne', cursive", fontSize: cqw(38), color: '#485979' })}>
        “Until Our Forever Begins”
      </div>

      {/* Countdown inside the pink Figma box (Rectangle 44) */}
      <div className="ndh__cdbox" style={{ ...centered(1164), width: `${(613 / W) * 100}%`, height: yp(128) }}>
        <Countdown />
      </div>
    </div>
  )
}
