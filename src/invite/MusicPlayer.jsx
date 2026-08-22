import { useEffect, useRef, useState } from 'react'

/**
 * MusicPlayer — a small spinning vinyl toggle, echoing the record motif in the
 * artwork's footer. Starts on the first user gesture (autoplay-safe) after the
 * card is opened. Drop your own track at /public/media/music.mp3 to replace it.
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
    </button>
  )
}
