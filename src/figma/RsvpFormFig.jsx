import { useState } from 'react'
import { EVENTS } from '../invite/layout'
import { submitRsvp } from '../lib/rsvpStore'

const IC = {
  shagun: '/decor/ic-shagun.png', jaago: '/decor/ic-jaago.png',
  anand: '/decor/ic-anand.png', reception: '/decor/ic-reception.png',
}
const mapUrl = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`

/**
 * RsvpFormFig — the full RSVP form matching the Figma design, placed inside the
 * empty centre of the Figma RSVP background.
 */
export default function RsvpFormFig({ onSaved }) {
  const [name, setName] = useState('')
  const [attending, setAttending] = useState(null)
  const [guests, setGuests] = useState(1)
  const [picked, setPicked] = useState([])
  const [state, setState] = useState('idle')
  const [error, setError] = useState('')

  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((e) => e !== id) : [...p, id]))
  async function send() {
    if (state === 'saving' || state === 'done') return
    if (!name.trim()) return (setError('Please enter your name'), setState('error'))
    if (attending === null) return (setError('Please choose an option'), setState('error'))
    setState('saving'); setError('')
    try {
      await submitRsvp({ name: name.trim(), contact: '', attending,
        guests: attending ? guests : 0, events: attending ? picked : [], message: null })
      setState('done'); onSaved?.()
    } catch (e) { setError(e.message || 'Could not send'); setState('error') }
  }

  if (state === 'done') {
    return (
      <div className="rff__thanks">
        <span>❤</span>
        <p>Thank you! Your response is saved.</p>
      </div>
    )
  }

  return (
    <div className="rff">
      <label className="rff__label">Full name</label>
      <input className="rff__input" type="text" placeholder="Enter your name"
        value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />

      <label className="rff__label">Will you be attending?</label>
      <div className="rff__attend">
        <button type="button" className={`rff__pill ${attending === true ? 'on' : ''}`} onClick={() => setAttending(true)}>
          Joyfully, yes! I&rsquo;ll be there
        </button>
        <button type="button" className={`rff__pill ${attending === false ? 'on' : ''}`} onClick={() => setAttending(false)}>
          Sadly, I&rsquo;ll be celebrating from afar
        </button>
      </div>

      <label className="rff__label">No. of guests attending</label>
      <div className="rff__step">
        <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="fewer">−</button>
        <span key={guests}>{guests}</span>
        <button type="button" onClick={() => setGuests((g) => Math.min(9, g + 1))} aria-label="more">+</button>
      </div>

      <p className="rff__eventshead">~ Events you will be joining ~</p>
      <div className="rff__events">
        {EVENTS.map((ev) => {
          const on = picked.includes(ev.id)
          return (
            <div key={ev.id} className={`rff__event ${on ? 'on' : ''}`}>
              <button type="button" className="rff__eventmain" onClick={() => toggle(ev.id)} aria-pressed={on}>
                <img src={IC[ev.id]} alt="" aria-hidden />
                <span className="rff__eventtext">
                  <strong>{ev.name}</strong>
                  <em>📍 {ev.venue}</em>
                </span>
                <b className="rff__check">{on ? '✓' : ''}</b>
              </button>
              <a className="rff__map" href={mapUrl(ev.map)} target="_blank" rel="noopener noreferrer">
                venue &rsaquo;
              </a>
            </div>
          )
        })}
      </div>

      <button type="button" className="rff__send" onClick={send} disabled={state === 'saving'}>
        {state === 'saving' ? 'Sending…' : 'Send RSVP'}
      </button>
      {state === 'error' && <p className="rff__err">{error}</p>}
    </div>
  )
}
