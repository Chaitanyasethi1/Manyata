import { Routes, Route } from 'react-router-dom'
import OfficerLayout from './OfficerLayout.jsx'
import ReviewQueue from './ReviewQueue.jsx'
import OfficerReview from './OfficerReview.jsx'
import VerificationSourcesPanel from './VerificationSourcesPanel.jsx'
import OfficerSOP from './OfficerSOP.jsx'

export default function OfficerPortal() {
  return (
    <Routes>
      <Route element={<OfficerLayout />}>
        <Route index element={<ReviewQueue />} />
        <Route path="sources" element={<VerificationSourcesPanel />} />
        <Route path="sop" element={<OfficerSOP />} />
        <Route path=":appId" element={<OfficerReview />} />
      </Route>
    </Routes>
  )
}
