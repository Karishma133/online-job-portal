import api from './api'

export const authService = {
  login:    (data)  => api.post('/auth/login',    data),
  register: (data)  => api.post('/auth/register', data),
  getMe:    ()      => api.get('/auth/me'),
  forgotPassword: (email)            => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token, password)  => api.put(`/auth/reset-password/${token}`, { password }),
}
