const KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
}

export const storage = {
  getAccessToken: () => localStorage.getItem(KEYS.ACCESS_TOKEN),
  setAccessToken: (token) => localStorage.setItem(KEYS.ACCESS_TOKEN, token),
  getRefreshToken: () => localStorage.getItem(KEYS.REFRESH_TOKEN),
  setRefreshToken: (token) => localStorage.setItem(KEYS.REFRESH_TOKEN, token),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem(KEYS.USER) || '{}')
    } catch {
      return {}
    }
  },
  setUser: (user) => localStorage.setItem(KEYS.USER, JSON.stringify(user)),
  clear: () => localStorage.clear(),
}
