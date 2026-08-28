/**
 * RSVP storage.
 * ----------------------------------------------------------------------------
 * Talks to Supabase's REST endpoint directly with `fetch`, so the site needs no
 * extra dependency and stays tiny. Until Supabase credentials are supplied the
 * store transparently falls back to localStorage, which means the form and the
 * wishes wall are fully functional in development and demos.
 *
 * To go live, create .env.local with:
 *   VITE_SUPABASE_URL=https://xxxxx.supabase.co
 *   VITE_SUPABASE_ANON_KEY=eyJhbGci...
 * then run the SQL in supabase/schema.sql.
 */

const URL_BASE = import.meta.env.VITE_SUPABASE_URL
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const TABLE = 'rsvps'
const LOCAL_KEY = 'wedding-rsvps-v2'

export const isRemote = Boolean(URL_BASE && ANON_KEY)

function headers() {
  return {
    'Content-Type': 'application/json',
    apikey: ANON_KEY,
    Authorization: `Bearer ${ANON_KEY}`,
  }
}

function readLocal() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]')
  } catch {
    return []
  }
}

function writeLocal(rows) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(rows))
}

// One guest = one row. The RSVP form and the "A Few Words to Treasure" blessing
// box both call submitRsvp; we match them by a normalised name (case- and
// space-insensitive) so the same person's attendance + message land in a single
// entry. Within a session we also remember the row id per name for reliability.
const SESSION_KEY = 'wedding-session-entries'
const normName = (n) => String(n || '').trim().toLowerCase().replace(/\s+/g, ' ')
function readSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || '{}') } catch { return {} }
}
function writeSession(m) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(m)) } catch { /* ignore */ }
}

/** Only the fields THIS submission actually carries — so merging the blessing
 *  never wipes the RSVP details and vice-versa. (Name is kept from the first
 *  submission, so a later differing capitalisation doesn't overwrite it.) */
function meaningful(entry) {
  const p = {}
  if (entry.contact) p.contact = entry.contact
  if (entry.attending !== null && entry.attending !== undefined) {
    p.attending = entry.attending
    p.guests = entry.guests
    p.events = entry.events
  }
  if (entry.message != null && String(entry.message).trim()) p.message = entry.message
  return p
}

/** Save/merge one guest's submission (RSVP details or blessing). */
export async function submitRsvp(entry) {
  const key = normName(entry.name)

  if (!isRemote) {
    const rows = readLocal()
    const idx = rows.findIndex((r) => normName(r.name) === key)
    if (idx >= 0) {
      rows[idx] = { ...rows[idx], ...meaningful(entry) }
      writeLocal(rows)
      return rows[idx]
    }
    const row = { id: `local-${Date.now()}`, ...entry, created_at: new Date().toISOString() }
    rows.unshift(row)
    writeLocal(rows)
    return row
  }

  // Remote: update the same row if we've already created one for this name.
  const session = readSession()
  const existingId = session[key]
  if (existingId) {
    const res = await fetch(`${URL_BASE}/rest/v1/${TABLE}?id=eq.${existingId}`, {
      method: 'PATCH',
      headers: { ...headers(), Prefer: 'return=representation' },
      body: JSON.stringify(meaningful(entry)),
    })
    if (res.ok) {
      const arr = await res.json()
      if (arr[0]) return arr[0]        // merged into the existing row
    }
    // row is gone (e.g. cleared) — drop the stale id and fall through to insert
    delete session[key]
    writeSession(session)
  }

  const res = await fetch(`${URL_BASE}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=representation' },
    body: JSON.stringify({ ...entry, created_at: new Date().toISOString() }),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(detail || `Could not save your RSVP (${res.status})`)
  }
  const [saved] = await res.json()
  if (saved?.id) { session[key] = saved.id; writeSession(session) }
  return saved
}

/** Delete every response (admin — used to clear test entries). */
export async function deleteAllRsvps() {
  try { localStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
  if (!isRemote) {
    writeLocal([])
    return
  }
  const res = await fetch(`${URL_BASE}/rest/v1/${TABLE}?id=not.is.null`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(detail || `Could not clear responses (${res.status})`)
  }
}

/** Fetch every RSVP (newest first) — used by the admin portal. */
export async function fetchAllRsvps() {
  if (!isRemote) {
    return readLocal()
  }
  const query = `select=*&order=created_at.desc`
  const res = await fetch(`${URL_BASE}/rest/v1/${TABLE}?${query}`, { headers: headers() })
  if (!res.ok) throw new Error(`Could not load responses (${res.status})`)
  return res.json()
}

/** Fetch the public wishes wall — entries that left a message. */
export async function fetchWishes(limit = 24) {
  if (!isRemote) {
    return readLocal()
      .filter((r) => r.message?.trim())
      .slice(0, limit)
  }

  const query = `select=name,message,created_at&message=not.is.null&order=created_at.desc&limit=${limit}`
  const res = await fetch(`${URL_BASE}/rest/v1/${TABLE}?${query}`, { headers: headers() })
  if (!res.ok) return []
  const rows = await res.json()
  return rows.filter((r) => r.message?.trim())
}
