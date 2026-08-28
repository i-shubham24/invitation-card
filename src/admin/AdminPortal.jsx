import { useEffect, useMemo, useState } from 'react'
import { fetchAllRsvps, deleteAllRsvps, isRemote } from '../lib/rsvpStore'
import { EVENTS } from '../invite/layout'
import './admin.css'

// Simple credentials. Override in production via Vercel env vars:
//   VITE_ADMIN_USER, VITE_ADMIN_PASS
const USER = import.meta.env.VITE_ADMIN_USER || 'admin'
const PASS = import.meta.env.VITE_ADMIN_PASS || 'akashharman'
const SESSION_KEY = 'wed-admin-auth'

const EVENT_NAME = Object.fromEntries(EVENTS.map((e) => [e.id, e.name]))

function toCSV(rows) {
  const head = ['Name', 'Attending', 'Guests', 'Events', 'Message', 'Contact', 'When']
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = rows.map((r) =>
    [
      r.name,
      r.attending ? 'Yes' : 'No',
      r.guests ?? 0,
      (r.events || []).map((id) => EVENT_NAME[id] || id).join('; '),
      r.message || '',
      r.contact || '',
      r.created_at ? new Date(r.created_at).toLocaleString() : '',
    ]
      .map(esc)
      .join(','),
  )
  return [head.join(','), ...lines].join('\n')
}

function Login({ onOk }) {
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [err, setErr] = useState('')
  function submit(e) {
    e.preventDefault()
    if (u === USER && p === PASS) {
      sessionStorage.setItem(SESSION_KEY, '1')
      onOk()
    } else {
      setErr('Incorrect username or password')
    }
  }
  return (
    <form className="adm-login" onSubmit={submit}>
      <h1>Wedding RSVP · Admin</h1>
      <label>Username<input value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" /></label>
      <label>Password<input type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" /></label>
      {err && <p className="adm-err">{err}</p>}
      <button type="submit">Sign in</button>
    </form>
  )
}

function Dashboard({ onLogout }) {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')

  async function load() {
    setError('')
    try {
      setRows(await fetchAllRsvps())
    } catch (e) {
      setError(e.message || 'Failed to load')
      setRows([])
    }
  }
  useEffect(() => { load() }, [])

  const stats = useMemo(() => {
    const r = rows || []
    const attending = r.filter((x) => x.attending)
    const guests = attending.reduce((s, x) => s + (Number(x.guests) || 0), 0)
    const perEvent = EVENTS.map((e) => ({
      name: e.name,
      count: attending.filter((x) => (x.events || []).includes(e.id)).length,
    }))
    return { total: r.length, yes: attending.length, no: r.length - attending.length, guests, perEvent }
  }, [rows])

  async function clearAll() {
    if (!window.confirm('Delete ALL responses? This cannot be undone (use it to clear test entries).')) return
    setError('')
    try {
      await deleteAllRsvps()
      await load()
    } catch (e) {
      setError(e.message || 'Failed to clear')
    }
  }

  function download() {
    const blob = new Blob([toCSV(rows || [])], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rsvp-responses-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="adm">
      <header className="adm__bar">
        <h1>RSVP Responses</h1>
        <div className="adm__actions">
          <button onClick={load}>↻ Refresh</button>
          <button onClick={download} disabled={!rows || !rows.length}>⤓ Export CSV</button>
          <button className="adm__danger" onClick={clearAll} disabled={!rows || !rows.length}>🗑 Clear all</button>
          <button className="adm__logout" onClick={onLogout}>Sign out</button>
        </div>
      </header>

      {!isRemote && (
        <p className="adm__note">
          ⚠ Showing <strong>this device's</strong> local responses. Connect Supabase
          (env vars) to collect everyone's responses centrally.
        </p>
      )}
      {error && <p className="adm-err">{error}</p>}

      <section className="adm__stats">
        <div className="adm__stat"><b>{stats.total}</b><span>Responses</span></div>
        <div className="adm__stat adm__stat--yes"><b>{stats.yes}</b><span>Attending</span></div>
        <div className="adm__stat adm__stat--no"><b>{stats.no}</b><span>Declined</span></div>
        <div className="adm__stat"><b>{stats.guests}</b><span>Total guests</span></div>
        {stats.perEvent.map((e) => (
          <div className="adm__stat adm__stat--ev" key={e.name}><b>{e.count}</b><span>{e.name}</span></div>
        ))}
      </section>

      {rows == null ? (
        <p className="adm__loading">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="adm__empty">No responses yet.</p>
      ) : (
        <div className="adm__tablewrap">
          <table className="adm__table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Attending</th><th>Guests</th><th>Events</th><th>Message</th><th>When</th></tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id || i} className={r.attending ? '' : 'is-no'}>
                  <td>{i + 1}</td>
                  <td>{r.name}</td>
                  <td>{r.attending === true ? '✅ Yes' : r.attending === false ? '❌ No' : '💛 Wish'}</td>
                  <td>{r.attending ? r.guests : '—'}</td>
                  <td>{(r.events || []).map((id) => EVENT_NAME[id] || id).join(', ') || '—'}</td>
                  <td className="adm__msg">{r.message || '—'}</td>
                  <td>{r.created_at ? new Date(r.created_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function AdminPortal() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1')
  if (!authed) return <Login onOk={() => setAuthed(true)} />
  return <Dashboard onLogout={() => { sessionStorage.removeItem(SESSION_KEY); setAuthed(false) }} />
}
