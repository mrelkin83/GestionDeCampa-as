import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface RequireRoleProps {
  roles: string[]
  children: React.ReactNode
}

/**
 * Restringe una ruta ya protegida (dentro de ProtectedRoute) a roles
 * específicos. Es una comodidad de UI: la autorización real la sigue
 * haciendo el backend en cada endpoint.
 */
export default function RequireRole({ roles, children }: RequireRoleProps) {
  const { user } = useAuth()

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
