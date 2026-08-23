import { useEffect, useRef, useState } from 'react'

/**
 * MusicPlayer — vinyl button that plays "Jogi" directly. Static disc; the
 * tonearm needle rests on the record and tracks in when playing.
 */
export default function MusicPlayer() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = new Audio('/media/jogi.mp3')
    audio.loop = true
    audio.volume = 0.6
    audio.addEventListener('play', () => setPlaying(true))
    audio.addEventListener('pause', () => setPlaying(false))
    audioRef.current = audio
    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().catch(() => setPlaying(false))
    } else {
      audio.pause()
    }
  }

  return (
    <button
      type="button"
      className={`music-btn ${playing ? 'is-playing' : ''}`}
      onClick={toggle}
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
