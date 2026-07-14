import axios from 'axios'

// In local dev, Vite's proxy (see vite.config.js) forwards relative '/api'
// requests to the backend automatically. In production, the frontend and
// backend are usually deployed separately (e.g. Vercel + Render) with no
// such proxy, so we need the real backend URL — set VITE_API_URL in your
// deployment platform's environment variables to e.g.
// https://your-backend.onrender.com
const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handler
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || 'Something went wrong'
    if (err.response?.status === 401) {
      localStorage.removeItem('sm_token')
      window.location.href = '/login'
    }
    return Promise.reject(new Error(message))
  }
)

export default api
