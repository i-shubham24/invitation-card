import { useEffect, useRef, useState } from 'react'
import { playMusic } from '../lib/music'
import './EnvelopeIntro.css'

/**
 * EnvelopeIntro — the sealed invitation. Shows the poster with a pulsing heart;
 * tapping the heart starts "Jogi" and plays the "opens upward" clip, then
 * cross-fades the site out of the opened envelope.
 *
 * The clip and poster share one responsive stage that always COVERS the screen
 * with no letterbox bars (full-bleed on phones/tablets; a matted 9:16 card only
 * on real desktops), so the seal stays in the same spot as the poster. If the
 * video can't autoplay or errors on a device, we finish gracefully and reveal
 * the site rather than getting stuck.
 */
const REVEAL_LEAD = 0.4 // start revealing the site this many seconds before the clip ends
const SAFETY_MS = 9000 // hard cap: never strand the guest on the opening screen

export default function EnvelopeIntro({ onOpened }) {
  const [phase, setPhase] = useState('idle') // idle | opening | done
  const videoRef = useRef(null)

  // iOS needs the video explicitly muted + inline at the DOM level (React's
  // `muted` prop is unreliable, and older iOS wants `webkit-playsinline`).
  // Without this, Safari rejects play() and the clip is skipped.
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.muted = true
    v.defaultMuted = true
    v.setAttribute('muted', '')
    v.setAttribute('playsinline', '')
    v.setAttribute('webkit-playsinline', 'true')
  }, [])

  // Strict opening page: lock all scrolling of the site behind the envelope
  // until it's opened (nothing but the heart tap should do anything).
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevH = html.style.overflow
    const prevB = body.style.overflow
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    return () => {
      html.style.overflow = prevH
      body.style.overflow = prevB
    }
  }, [])

  function finish() {
    setPhase((p) => (p === 'done' ? p : 'done'))
    window.setTimeout(() => onOpened?.(), 800)
  }

  function handleOpen() {
    if (phase !== 'idle') return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const v = videoRef.current

    if (reduced || !v) {
      playMusic().catch(() => {})
      finish()
      return
    }

    // iOS: kick the video off FIRST, synchronously inside the tap, before any
    // other media or async work — otherwise Safari rejects play() and the clip
    // is skipped. Don't seek first (iOS hasn't buffered it and the seek fails).
    v.muted = true
    const p = v.play()
    playMusic().catch(() => {}) // start the song in the same gesture
    setPhase('opening')
    if (p && p.catch) p.catch(() => finish()) // genuinely blocked → reveal the site
  }

  // While opening: reveal the site as the clip ends, and guarantee we finish
  // even if the video stalls or never fires its events (no stuck screen).
  useEffect(() => {
    const v = videoRef.current
    if (!v || phase !== 'opening') return
    const onTime = () => {
      if (v.duration && v.currentTime >= v.duration - REVEAL_LEAD) finish()
    }
    const onEnd = () => finish()
    const onError = () => finish()
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('ended', onEnd)
    v.addEventListener('error', onError)
    const safety = window.setTimeout(finish, SAFETY_MS)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('ended', onEnd)
      v.removeEventListener('error', onError)
      window.clearTimeout(safety)
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
