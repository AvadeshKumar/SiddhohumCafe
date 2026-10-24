import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    // Check for customer token or admin token depending on route or priority
    const token = localStorage.getItem('sidhohum_admin_token') || localStorage.getItem('sidhohum_auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for clear error formatting
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred. Please try again.'
    return Promise.reject(new Error(message))
  }
)

export default api
