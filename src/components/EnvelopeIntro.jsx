import { useEffect, useRef, useState } from 'react'
import { playMusic } from '../lib/music'
import './EnvelopeIntro.css'

/**
 * EnvelopeIntro — the sealed invitation. Shows the poster with a pulsing heart;
 * tapping the heart starts the song and plays the "opens upward" clip, then
 * cross-fades the site out of the opened envelope.
 *
 * The clip and poster share one responsive stage that always COVERS the screen
 * with no letterbox bars (full-bleed on phones/tablets; a matted 9:16 card only
 * on real desktops), so the seal stays in the same spot as the poster. If the
 * video can't autoplay or errors on a device, we finish gracefully and reveal
 * the site rather than getting stuck.
 */
const REVEAL_LEAD = 0.4 // start revealing the site this many seconds before the clip ends
const SAFETY_MS = 11000 // hard cap: never strand the guest on the opening screen (desktop clip is ~10s)

// The wide "card opens upward" clip is only for laptops/desktops (wide screen
// AND a mouse). Phones and all touch tablets/iPads get the portrait clip —
// matching the site's mobile-on-touch layout rule.
const WIDE_Q = '(min-width: 1024px) and (pointer: fine)'
const WIDE_RATE = 1.7 // play the wide clip faster — the card lifts up more briskly
function useWideClip() {
  const [d, setD] = useState(() => typeof window !== 'undefined' && window.matchMedia(WIDE_Q).matches)
  useEffect(() => {
    const mq = window.matchMedia(WIDE_Q)
    const on = () => setD(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return d
}

// Add ?vdebug to the URL to show an on-screen log of why the clip did / didn't
// play (useful for diagnosing iOS Safari without a desktop debugger).
const DEBUG = typeof location !== 'undefined' && /(\?|&)vdebug\b/.test(location.search)

export default function EnvelopeIntro({ onOpened }) {
  const wide = useWideClip()
  const [phase, setPhase] = useState('idle') // idle | opening | done
  const [diag, setDiag] = useState([])
  const videoRef = useRef(null)
  const log = (m) => { if (DEBUG) setDiag((d) => [...d.slice(-14), `${(performance.now() / 1000).toFixed(1)}s · ${m}`]) }

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
    const v = videoRef.current
    playMusic().catch(() => {}) // this tap is the gesture that lets sound play

    if (!v) {
      finish()
      return
    }

    // Always attempt the clip — do NOT skip it for prefers-reduced-motion, since
    // many iPhones/iPads have Reduce Motion on and that was silently opening the
    // site straight away.
    log(`tap · reduced=${window.matchMedia('(prefers-reduced-motion: reduce)').matches} muted=${v.muted} ready=${v.readyState}`)
    setPhase('opening')
    v.muted = true // iOS: must be muted to start inline
    v.playbackRate = wide ? WIDE_RATE : 1 // lift the card up more briskly on the wide clip
    const p = v.play()
    if (p && p.then) {
      p.then(() => log('play() resolved')).catch((e) => {
        log(`play() rejected: ${e && e.name}`)
        // Couldn't start on the tap. A muted, inline clip is allowed to start
        // without a fresh gesture on iOS, so retry once it has buffered; only
        // reveal the site if it genuinely never becomes playable.
        const retry = () => { log('retry play()'); v.play().catch((e2) => log(`retry rejected: ${e2 && e2.name}`)) }
        v.addEventListener('canplay', retry, { once: true })
        v.addEventListener('loadeddata', retry, { once: true })
        window.setTimeout(() => { if (v.paused) { log('still paused → reveal'); finish() } }, 2500)
      })
    }
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
    const onError = () => { log(`video error code=${v.error && v.error.code}`); finish() }
    const onPlaying = () => log(`playing (dur=${(v.duration || 0).toFixed?.(1)})`)
    const onStalled = () => log('stalled')
    v.addEventListener('timeupdate', onTime)
    v.addEventListener('ended', onEnd)
    v.addEventListener('error', onError)
    if (DEBUG) { v.addEventListener('playing', onPlaying); v.addEventListener('stalled', onStalled) }
    const safety = window.setTimeout(finish, SAFETY_MS)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('ended', onEnd)
      v.removeEventListener('error', onError)
      v.removeEventListener('playing', onPlaying)
      v.removeEventListener('stalled', onStalled)
      window.clearTimeout(safety)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  return (
    <div className={`env2 env2--${phase}${wide ? ' env2--wide' : ''}`} aria-hidden={phase === 'done'}>
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
          src={wide ? '/media/opening_desktop.mp4' : '/media/opening_short.mp4'}
          poster={wide ? undefined : '/media/poster.jpg'}
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

      {DEBUG && (
        <pre style={{
          position: 'fixed', left: 0, right: 0, bottom: 0, margin: 0, zIndex: 9999,
          maxHeight: '45vh', overflow: 'auto', padding: '8px 10px',
          font: '11px/1.4 monospace', color: '#0f0', background: 'rgba(0,0,0,0.82)',
          whiteSpace: 'pre-wrap', pointerEvents: 'none',
        }}>
          {diag.join('\n') || 'vdebug on — tap the heart…'}
        </pre>
      )}
    </div>
  )
}
