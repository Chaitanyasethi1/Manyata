import { Routes, Route } from 'react-router-dom'
import InstitutionLayout from './InstitutionLayout.jsx'
import ApplicationTracker from './ApplicationTracker.jsx'
import NewApplicationWizard from './NewApplicationWizard.jsx'
import DocumentManager from './DocumentManager.jsx'
import AlertsRemindersPage from './AlertsRemindersPage.jsx'
import ValidationReportView from './ValidationReportView.jsx'
import DeficiencyReportPage from './DeficiencyReportPage.jsx'
import ClearancePackagePage from './ClearancePackagePage.jsx'

export default function InstitutionPortal() {
  return (
    <Routes>
      <Route element={<InstitutionLayout />}>
        <Route index element={<ApplicationTracker />} />
        <Route path="new" element={<NewApplicationWizard />} />
        <Route path="documents" element={<DocumentManager />} />
        <Route path="alerts" element={<AlertsRemindersPage />} />
        <Route path="report/:appId" element={<ValidationReportView />} />
        <Route path="deficiency/:appId" element={<DeficiencyReportPage />} />
        <Route path="clearance/:appId" element={<ClearancePackagePage />} />
      </Route>
    </Routes>
  )
}
