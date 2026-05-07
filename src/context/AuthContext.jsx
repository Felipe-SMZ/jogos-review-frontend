import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { jwtDecode } from 'jwt-decode'

const AuthContext = createContext(null)

function parseToken(token) {
  if (!token) return null
  try {
    const decoded = jwtDecode(token)
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token')
      return null
    }
    return {
      email: decoded.sub,
      role: decoded.role || decoded.roles?.[0] || '',
    }
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => parseToken(localStorage.getItem('token')))
  const [token, setToken] = useState(() => localStorage.getItem('token'))

  const signIn = useCallback((newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(parseToken(newToken))
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }, [])

  const isAdmin = user?.role === 'ROLE_ADMIN'
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
