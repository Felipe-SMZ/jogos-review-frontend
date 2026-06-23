import { createContext, useContext, useState, useCallback, useEffect } from 'react'
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

    const id = decoded.id ?? decoded.userId ?? decoded.usuario?.id ?? null
    const email = decoded.email ?? decoded.sub ?? null
    const role = decoded.role ?? decoded.roles?.[0] ?? ''
    const usuario = decoded.usuario ?? null

    return { id, email, role, usuario }
  } catch {
    localStorage.removeItem('token')
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const parsedUser = parseToken(savedToken)

    if (parsedUser && savedToken) {
      setToken(savedToken)
      setUser(parsedUser)
    } else {
      setToken(null)
      setUser(null)
    }

    setAuthChecked(true)
  }, [])

  const signIn = useCallback((newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(parseToken(newToken))
    setAuthChecked(true)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    setAuthChecked(true)
  }, [])

  const isAdmin = user?.role === 'ROLE_ADMIN'
  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        authChecked,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}