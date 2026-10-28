import { Routes, Route } from 'react-router-dom'
import ReviewQueue  from './ReviewQueue.jsx'
import ReviewDetail from './ReviewDetail.jsx'

export default function OfficerPortal() {
  return (
    <Routes>
      <Route index        element={<ReviewQueue />} />
      <Route path=":appId" element={<ReviewDetail />} />
    </Routes>
  )
}
