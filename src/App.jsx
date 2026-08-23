import { useState } from 'react'
import EnvelopeIntro from './components/EnvelopeIntro.jsx'
import InvitationCard from './invite/InvitationCard.jsx'
import AdminPortal from './admin/AdminPortal.jsx'
import './invite/invite.css'

export default function App() {
  const [opened, setOpened] = useState(false)

  // Admin route: /admin (works locally and on Vercel via SPA rewrite)
  const path = window.location.pathname.replace(/\/+$/, '')
  if (path.endsWith('/admin')) {
    return <AdminPortal />
  }

  return (
    <>
      <InvitationCard />
      {!opened && <EnvelopeIntro onOpened={() => setOpened(true)} />}
    </>
  )
}
