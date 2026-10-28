import axios from 'axios'

const api = axios.create({ baseURL: '/api/v1' })

// ── Applications ─────────────────────────────────────────────
export const submitApplication = (formData) =>
  api.post('/applications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const listApplications = (status) =>
  api.get('/applications', { params: status ? { status } : {} })

export const getApplication = (appId) =>
  api.get(`/applications/${appId}`)

// ── Pipeline ─────────────────────────────────────────────────
export const triggerPipeline = (appId) =>
  api.post(`/applications/${appId}/trigger`)

export const getResult = (appId) =>
  api.get(`/applications/${appId}/result`)

// ── Review ───────────────────────────────────────────────────
export const submitReview = (appId, decision, comment, officerId) =>
  api.post(`/applications/${appId}/review`, {
    decision, comment, officer_id: officerId,
  })

export const getAuditLog = (appId) =>
  api.get(`/applications/${appId}/audit`)

// ── Alerts ───────────────────────────────────────────────────
export const listAlerts = (appId, unreadOnly) =>
  api.get('/alerts', {
    params: {
      ...(appId     ? { application_id: appId } : {}),
      ...(unreadOnly? { unread_only: true }      : {}),
    },
  })

export const markAlertRead = (alertId) =>
  api.patch(`/alerts/${alertId}/read`)

// ── Reports ──────────────────────────────────────────────────
export const downloadClearance  = (appId) =>
  api.post(`/applications/${appId}/reports/clearance`,  {}, { responseType: 'blob' })

export const downloadDeficiency = (appId) =>
  api.post(`/applications/${appId}/reports/deficiency`, {}, { responseType: 'blob' })

export const listReports = (appId) =>
  api.get(`/applications/${appId}/reports`)

export const getStats = () =>
  api.get('/stats')

export const getAllAudit = (appId) =>
  api.get(`/applications/${appId}/audit`)

