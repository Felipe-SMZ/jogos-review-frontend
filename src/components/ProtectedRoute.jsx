import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function PrivateRoute({ children }) {
  const { isAuthenticated, authChecked } = useAuth()
  const location = useLocation()

  if (!authChecked) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, authChecked } = useAuth()
  const location = useLocation()

  if (!authChecked) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

export function GuestRoute({ children }) {
  const { isAuthenticated, authChecked } = useAuth()

  if (!authChecked) return null

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}