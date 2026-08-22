import { useState } from 'react'
import EnvelopeIntro from './components/EnvelopeIntro.jsx'
import InvitationCard from './invite/InvitationCard.jsx'
import './invite/invite.css'

export default function App() {
  const [opened, setOpened] = useState(false)

  return (
    <>
      <InvitationCard />
      {!opened && <EnvelopeIntro onOpened={() => setOpened(true)} />}
    </>
  )
}
