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
const LOCAL_KEY = 'wedding-rsvps'

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

/** Save one RSVP. Resolves on success, throws with a readable message. */
export async function submitRsvp(entry) {
  const row = { ...entry, created_at: new Date().toISOString() }

  if (!isRemote) {
    const rows = readLocal()
    rows.unshift(row)
    writeLocal(rows)
    return row
  }

  const res = await fetch(`${URL_BASE}/rest/v1/${TABLE}`, {
    method: 'POST',
    headers: { ...headers(), Prefer: 'return=representation' },
    body: JSON.stringify(row),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(detail || `Could not save your RSVP (${res.status})`)
  }
  const [saved] = await res.json()
  return saved
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
