import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import api from '../services/api'
import { storage } from '../utils/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storage.getUser)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = storage.getAccessToken()
    if (token) {
      const userId = user.id || user.consumerId
      if (userId) {
        api.get(`/users/${userId}`)
          .then(({ data }) => {
            const normalized = { ...data, id: data.consumerId || userId }
            storage.setUser(normalized)
            setUser(normalized)
          })
          .catch(() => {
            storage.clear()
            setUser({})
          })
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    storage.setAccessToken(data.accessToken)
    storage.setRefreshToken(data.refreshToken)
    const normalized = { ...data.user, id: data.user.id || data.user.consumerId }
    storage.setUser(normalized)
    setUser(normalized)
    return data
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    storage.setAccessToken(data.accessToken)
    storage.setRefreshToken(data.refreshToken)
    const normalized = { ...data.user, id: data.user.id || data.user.consumerId }
    storage.setUser(normalized)
    setUser(normalized)
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      const refreshToken = storage.getRefreshToken()
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken })
      }
    } catch {
    } finally {
      storage.clear()
      setUser({})
    }
  }, [])

  const upgrade = useCallback(async () => {
    const { data } = await api.post('/auth/upgrade')
    storage.setAccessToken(data.accessToken)
    storage.setRefreshToken(data.refreshToken)
    const normalized = { ...data.user, id: data.user.id || data.user.consumerId }
    storage.setUser(normalized)
    setUser(normalized)
    return data
  }, [])

  const refreshUser = useCallback(async () => {
    const userId = user.id || user.consumerId
    if (!userId) return
    const { data } = await api.get(`/users/${userId}`)
    const normalized = { ...data, id: data.consumerId || userId }
    storage.setUser(normalized)
    setUser(normalized)
  }, [user])

  const isAuthenticated = !!storage.getAccessToken()
  const isAdvanced = user.advancedOrNot
  const adCount = user.noOfAd || 0

  return (
    <AuthContext.Provider value={{
      user, loading, isAuthenticated, isAdvanced, adCount,
      login, register, logout, upgrade, refreshUser, setUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
