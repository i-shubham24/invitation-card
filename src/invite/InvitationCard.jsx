import { useEffect, useState } from 'react'
import FigmaCanvas from '../figma/FigmaCanvas'
import FigmaCanvasDesktop from '../figma/FigmaCanvasDesktop'
import FigmaCanvasNew from '../figma/FigmaCanvasNew'
import MusicPlayer from './MusicPlayer'
import Credit from './Credit'
import Petals from '../effects/Petals'

/** True on wide viewports — renders the desktop Figma layout (frame 11). */
function useIsDesktop() {
  const q = '(min-width: 1024px)'
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(q).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = (e) => setIsDesktop(e.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return isDesktop
}

/**
 * InvitationCard — the whole invitation rendered natively from the Figma data
 * (real text + exported assets), with the scratch card, the RSVP form inside
 * the Figma RSVP background, falling petals, and the music button. Renders the
 * mobile layout (frame 10) on narrow screens and the desktop layout (frame 11)
 * on wide ones.
 */
export default function InvitationCard({ onRsvpSaved, opened }) {
  const isDesktop = useIsDesktop()
  return (
    <div className="invite">
      {isDesktop ? (
        <>
          <FigmaCanvasNew />
          <div className="figd-crop">
            <FigmaCanvasDesktop onRsvpSaved={onRsvpSaved} opened={opened} />
          </div>
        </>
      ) : (
        <FigmaCanvas onRsvpSaved={onRsvpSaved} opened={opened} />
      )}
      <Credit />
      <Petals />
      <MusicPlayer />
    </div>
  )
}
