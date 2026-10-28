import { Routes, Route } from 'react-router-dom'
import ReviewQueue  from './ReviewQueue.jsx'
import ReviewDetail from './ReviewDetail.jsx'

export default function OfficerPortal({ role, setRole }) {
  return (
    <Routes>
      <Route index         element={<ReviewQueue role={role} setRole={setRole} />} />
      <Route path=":appId" element={<ReviewDetail role={role} setRole={setRole} />} />
    </Routes>
  )
}
