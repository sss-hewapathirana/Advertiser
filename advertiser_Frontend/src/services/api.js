import axios from 'axios'
import { storage } from '../utils/storage'

const api = axios.create({
  baseURL: '/',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = storage.getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let refreshSubscribers = []

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb)
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            original.headers.Authorization = `Bearer ${token}`
            resolve(api(original))
          })
        })
      }

      original._retry = true
      isRefreshing = true

      const refreshToken = storage.getRefreshToken()
      if (!refreshToken) {
        storage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post('/auth/refresh', { refreshToken })
        storage.setAccessToken(data.accessToken)
        storage.setRefreshToken(data.refreshToken)
        storage.setUser(data.user)

        onRefreshed(data.accessToken)
        isRefreshing = false

        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        isRefreshing = false
        refreshSubscribers = []
        storage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

export default api
