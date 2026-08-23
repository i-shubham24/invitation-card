import { useEffect, useRef, useState } from 'react'
import { playMusic } from '../lib/music'
import './EnvelopeIntro.css'

/**
 * EnvelopeIntro — the AI video envelope. Shows the sealed poster with a pulsing
 * heart; tapping the heart starts "Jogi" and plays the "opens upward" clip,
 * then cross-fades the site out of the opened envelope. Presented inside the
 * site's portrait card column on a blush field (no cropping of the heart).
 */
const REVEAL_LEAD = 0.4 // start revealing the site this many seconds before the clip ends

export default function EnvelopeIntro({ onOpened }) {
  const [phase, setPhase] = useState('idle') // idle | opening | done
  const videoRef = useRef(null)

  function finish() {
    setPhase((p) => (p === 'done' ? p : 'done'))
    window.setTimeout(() => onOpened?.(), 800)
  }

  function handleOpen() {
    if (phase !== 'idle') return
    playMusic().catch(() => {}) // this tap is the gesture that lets sound play

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish()
      return
    }
    setPhase('opening')
    const v = videoRef.current
    if (v) {
      v.currentTime = 0
      const p = v.play()
      if (p && p.catch) p.catch(() => finish())
    } else {
      finish()
    }
  }

  useEffect(() => {
    const v = videoRef.current
    if (!v || phase !== 'opening') return
    const onTime = () => {
      if (v.duration && v.currentTime >= v.duration - REVEAL_LEAD) finish()
    }
    const onEnd = () => finish()
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('ended', onEnd)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('ended', onEnd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  return (
    <div className={`env2 env2--${phase}`} aria-hidden={phase === 'done'}>
      <div className="env2__stage">
        <img
          className="env2__poster"
          src="/media/poster.jpg"
          alt="Akashdeep & Harmandip wedding invitation, sealed with a heart"
          draggable="false"
        />
        <video
          ref={videoRef}
          className="env2__video"
          src="/media/opening_short.mp4"
          poster="/media/poster.jpg"
          playsInline
          muted
          preload="auto"
        />

        {phase === 'idle' && (
          <button
            type="button"
            className="env2__heart"
            onClick={handleOpen}
            aria-label="Tap the heart to open the invitation"
          >
            <span className="env2__pulse" />
            <span className="env2__pulse env2__pulse--2" />
          </button>
        )}
      </div>
    </div>
  )
}
