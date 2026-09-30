import { Navigate, useLocation } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" description="Đang tải..." />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const userRole = user.role?.toUpperCase() || ''
  const isAllowed = allowedRoles ? allowedRoles.some(r => r.toUpperCase() === userRole) : true

  if (!isAllowed) {
    return <Navigate to="/login" replace />
  }

  return children
}

