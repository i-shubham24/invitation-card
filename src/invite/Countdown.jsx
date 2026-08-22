import { useEffect, useState } from 'react'
import { WEDDING_AT } from './layout'

function left(target) {
  const ms = target.getTime() - Date.now()
  if (ms <= 0) return null
  const s = Math.floor(ms / 1000)
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  }
}

/** Live D/H/M/S countdown, cream-box style like the reference. */
export default function Countdown() {
  const [t, setT] = useState(() => left(WEDDING_AT))
  useEffect(() => {
    const id = setInterval(() => setT(left(WEDDING_AT)), 1000)
    return () => clearInterval(id)
  }, [])

  if (!t) return <p className="cd__done">Today is the day ❤</p>

  const cells = [
    ['Days', t.days],
    ['Hours', t.hours],
    ['Minutes', t.minutes],
    ['Seconds', t.seconds],
  ]
  return (
    <div className="cd">
      {cells.map(([label, val]) => (
        <div className="cd__cell" key={label}>
          <span className="cd__num">{String(val).padStart(2, '0')}</span>
          <span className="cd__label">{label}</span>
        </div>
      ))}
    </div>
  )
}
