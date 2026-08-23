import { useState } from 'react'
import { playMusic } from '../lib/music'
import './EnvelopeIntro.css'

/**
 * EnvelopeIntro — a fully native (CSS/SVG) envelope that opens on the heart.
 *
 * No video: the flap lifts, the letter rises out, and the whole cover fades to
 * reveal the site. Because it is built from layout + transforms, it fills any
 * screen responsively — a designed blush field, never cropped bands.
 */
export default function EnvelopeIntro({ onOpened }) {
  const [open, setOpen] = useState(false)

  function handleOpen() {
    if (open) return
    // Start the music now — this tap is the user gesture browsers require.
    playMusic().catch(() => {})
    setOpen(true)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.setTimeout(() => onOpened?.(), reduced ? 300 : 2100)
  }

  return (
    <div className={`env ${open ? 'is-open' : ''}`} aria-hidden={open}>
      {/* Floral corners so the blush field reads as designed, not empty */}
      <img className="env__decor env__decor--tl" src="/decor/floral-spray.png" alt="" aria-hidden />
      <img className="env__decor env__decor--tr" src="/decor/floral-spray.png" alt="" aria-hidden />
      <img className="env__decor env__decor--bl" src="/decor/floral-spray.png" alt="" aria-hidden />
      <img className="env__decor env__decor--br" src="/decor/floral-spray.png" alt="" aria-hidden />

      <div className="env__scene">
        {/* The letter that rises out of the envelope */}
        <div className="env__card">
          <img className="env__card-mono" src="/decor/wreath-ah.png" alt="" aria-hidden />
          <p className="env__card-invite">You&rsquo;re invited to the wedding of</p>
          <p className="env__card-names">Akashdeep &amp; Harmandip</p>
          <p className="env__card-date">3 December 2026</p>
        </div>

        {/* Envelope front pocket (V) */}
        <div className="env__front" />

        {/* Top flap that opens */}
        <div className="env__flap" />

        {/* Heart wax seal — the button */}
        <button
          type="button"
          className="env__seal"
          onClick={handleOpen}
          aria-label="Tap the heart to open the invitation"
        >
          <svg viewBox="0 0 100 92" width="100%" height="100%" aria-hidden>
            <defs>
              <radialGradient id="wax" cx="38%" cy="32%" r="75%">
                <stop offset="0%" stopColor="#e7b6a3" />
                <stop offset="55%" stopColor="#c98a76" />
                <stop offset="100%" stopColor="#9c5749" />
              </radialGradient>
            </defs>
            <path
              d="M50 88 C12 60 4 36 20 20 C33 7 47 14 50 28 C53 14 67 7 80 20 C96 36 88 60 50 88 Z"
              fill="url(#wax)"
              stroke="#8a4c3f"
              strokeWidth="1.5"
            />
            <text
              x="50"
              y="52"
              textAnchor="middle"
              fontFamily="Great Vibes, cursive"
              fontSize="30"
              fill="#f6e2d7"
            >
              A&amp;H
            </text>
          </svg>
          <span className="env__pulse" />
          <span className="env__pulse env__pulse--2" />
        </button>
      </div>

      <p className="env__hint">Tap the heart to open</p>
    </div>
  )
}
