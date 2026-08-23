import { useEffect } from 'react'
import Countdown from './Countdown'
import { WEDDING_DATE } from './layout'
import './savedate.css'

/**
 * SaveDatePop — celebratory pop-up shown after the scratch card is revealed.
 * Cream card with "Save the Date", the date, and a live countdown, over a
 * dimmed backdrop with drifting petals. Dismissed via the button or backdrop.
 */
export default function SaveDatePop({ onClose }) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className="sd" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="sd__card" onClick={(e) => e.stopPropagation()}>
        <img className="sd__floral sd__floral--l" src="/decor/floral-small.png" alt="" aria-hidden />
        <img className="sd__floral sd__floral--r" src="/decor/floral-small.png" alt="" aria-hidden />

        <p className="sd__eyebrow">Save the Date</p>
        <p className="sd__date">{WEDDING_DATE}</p>
        <div className="sd__rule" aria-hidden>
          <span>❤</span>
        </div>
        <p className="sd__until">Until Our Forever Begins</p>
        <Countdown />
        <button type="button" className="sd__btn" onClick={onClose}>
          Continue &darr;
        </button>
      </div>
    </div>
  )
}
