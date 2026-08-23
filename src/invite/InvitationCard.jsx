import FigmaCanvas from '../figma/FigmaCanvas'
import MusicPlayer from './MusicPlayer'
import Petals from '../effects/Petals'

/**
 * InvitationCard — the whole invitation rendered natively from the Figma data
 * (real text + exported assets), with the scratch card, the RSVP form inside
 * the Figma RSVP background, falling petals, and the music button.
 */
export default function InvitationCard({ onRsvpSaved, opened }) {
  return (
    <div className="invite">
      <FigmaCanvas onRsvpSaved={onRsvpSaved} opened={opened} />
      <Petals />
      <MusicPlayer />
    </div>
  )
}
