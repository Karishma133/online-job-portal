import api from './api'
import { buildQueryString } from '../utils/helpers'

export const jobService = {
  getJobs:       (params) => api.get(`/jobs${buildQueryString(params)}`),
  getJobById:    (id)     => api.get(`/jobs/${id}`),
  createJob:     (data)   => api.post('/jobs', data),
  updateJob:     (id, data) => api.put(`/jobs/${id}`, data),
  deleteJob:     (id)     => api.delete(`/jobs/${id}`),
  getMyJobs:     ()       => api.get('/jobs/my'),
  getApplicants: (id)     => api.get(`/jobs/${id}/applicants`),
  getRecommended:()       => api.get('/recommend/jobs'),
}
