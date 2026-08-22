import { SLICES, CARD_RATIO } from './layout'
import ScratchCard from './ScratchCard'
import RsvpSection from './RsvpSection'
import MusicPlayer from './MusicPlayer'
import Reveal from './Reveal'
import Petals from '../effects/Petals'

/**
 * InvitationCard.
 *
 * Painted artwork slices (hero → the four event cards) with the native scratch
 * card, then the fully-native RSVP + footer. Each slice below the fold pops in
 * on scroll, and falling petals drift over everything.
 */
export default function InvitationCard({ onRsvpSaved }) {
  return (
    <div className="invite">
      <div className="invite__card" style={{ aspectRatio: `1 / ${CARD_RATIO}` }}>
        {SLICES.map((src, i) => {
          const img = (
            <img
              className="invite__slice"
              src={`/invite/${src}`}
              alt={i === 0 ? 'Akashdeep & Harmandip wedding invitation' : ''}
              loading={i === 0 ? 'eager' : 'lazy'}
              decoding="async"
              draggable="false"
            />
          )
          // Hero shows immediately; the rest pop in on scroll (alternating).
          return i === 0 ? (
            <div key={src} className="invite__slicewrap">{img}</div>
          ) : (
            <Reveal
              key={src}
              variant={i % 2 === 0 ? 'up' : 'zoom'}
              className="invite__slicewrap"
            >
              {img}
            </Reveal>
          )
        })}
        <ScratchCard />
      </div>

      <RsvpSection onSaved={onRsvpSaved} />

      <Petals />
      <MusicPlayer />
    </div>
  )
}
