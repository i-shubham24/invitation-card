import { useEffect, useState } from 'react'
import EnvelopeIntro from './components/EnvelopeIntro.jsx'
import InvitationCard from './invite/InvitationCard.jsx'
import AdminPortal from './admin/AdminPortal.jsx'
import './invite/invite.css'

export default function App() {
  const [opened, setOpened] = useState(false)

  // Always open the site from the top (ignore the browser restoring scroll).
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)
  }, [])

  // Admin route: /admin (works locally and on Vercel via SPA rewrite)
  const path = window.location.pathname.replace(/\/+$/, '')
  if (path.endsWith('/admin')) {
    return <AdminPortal />
  }

  return (
    <>
      <InvitationCard opened={opened} />
      {!opened && <EnvelopeIntro onOpened={() => setOpened(true)} />}
    </>
  )
}
