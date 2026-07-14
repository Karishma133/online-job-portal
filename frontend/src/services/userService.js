import api from './api'

export const userService = {
  updateProfile:  (data)    => api.put('/users/profile', data),
  uploadResume:   (formData) => api.post('/users/resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  uploadAvatar:   (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getApplications:()        => api.get('/users/applications'),
  applyToJob:     (jobId)   => api.post(`/applications/${jobId}`),
  withdrawApplication:(appId)=> api.delete(`/applications/${appId}`),
  getApplicants:  (jobId)   => api.get(`/jobs/${jobId}/applicants`),
  updateAppStatus:(appId, status) => api.put(`/applications/${appId}/status`, { status }),
  getAllUsers:     ()        => api.get('/users/all'),          // admin
  deleteUser:     (id)      => api.delete(`/users/${id}`),      // admin
}
