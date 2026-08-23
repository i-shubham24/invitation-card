import { useEffect, useState } from 'react'
import { toggleMusic, isMusicPlaying, onMusicChange } from '../lib/music'

/**
 * MusicPlayer — vinyl button bound to the shared "Jogi" audio element (started
 * on the envelope's heart-tap). Tap to pause/resume. Static disc; the tonearm
 * needle tracks in while playing.
 */
export default function MusicPlayer() {
  const [playing, setPlaying] = useState(isMusicPlaying())

  useEffect(() => onMusicChange(() => setPlaying(isMusicPlaying())), [])

  return (
    <button
      type="button"
      className={`music-btn ${playing ? 'is-playing' : ''}`}
      onClick={() => toggleMusic().catch(() => {})}
      aria-label={playing ? 'Pause music' : 'Play music'}
      title={playing ? 'Pause music' : 'Play music'}
    >
      <img
        className="music-btn__vinyl"
        src="/decor/vinyl.png"
        alt=""
        aria-hidden="true"
        draggable="false"
      />
      <span className="music-btn__arm" aria-hidden="true">
        <span className="music-btn__needle" />
      </span>
    </button>
  )
}
