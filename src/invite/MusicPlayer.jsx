import { useState } from 'react'

/**
 * MusicPlayer — a static vinyl button (needle swings on when open) that toggles
 * a compact Audiomack player for "Jogi" (Arijit Singh). The player iframe stays
 * mounted so playback continues when the panel is collapsed; press play inside
 * the embed to start (browsers block autoplay until you interact).
 */
export default function MusicPlayer() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className={`music-btn ${open ? 'is-playing' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Hide music player' : 'Play music'}
        title={open ? 'Hide music player' : 'Play music'}
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

      {/* Always mounted so audio keeps playing when collapsed */}
      <div className={`music-embed ${open ? 'is-open' : ''}`}>
        <iframe
          src="https://audiomack.com//embed/arijitsingh/song/jogi"
          scrolling="no"
          width="100%"
          height="252"
          frameBorder="0"
          title="Jogi — Arijit Singh"
          allow="autoplay"
        />
      </div>
    </>
  )
}
