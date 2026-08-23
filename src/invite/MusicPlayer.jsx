import { useEffect, useRef, useState } from 'react'

/**
 * MusicPlayer — static vinyl disc with a tonearm/needle that swings onto the
 * record while playing (the disc itself does not spin). Drop your song at
 * /public/media/music.mp3.
 */
export default function MusicPlayer() {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = new Audio('/media/music.mp3')
    audio.loop = true
    audio.volume = 0.5
    audioRef.current = audio
    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [])

  function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
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
      {/* tonearm / needle — swings onto the disc when playing */}
      <span className="music-btn__arm" aria-hidden="true">
        <span className="music-btn__needle" />
      </span>
    </button>
  )
}
