import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authAPI } from '@/lib/api'

interface User {
  id: number
  email: string
  full_name: string
  first_name?: string
  last_name?: string
  phone?: string
  role: string
  campanas?: Array<{ id: number; nombre: string; slug: string }>
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// AuthController::login devuelve role como string; AuthController::me lo
// devuelve como objeto {id,name,display_name,permissions}. Se normaliza
// aquí para que el resto de la app siempre reciba un string.
interface RawUser {
  id: number
  email: string
  full_name: string
  first_name?: string
  last_name?: string
  phone?: string
  role: string | { name: string }
  campanas?: Array<{ id: number; nombre: string; slug: string }>
}

function normalizeUser(raw: RawUser): User {
  return {
    id: raw.id,
    email: raw.email,
    full_name: raw.full_name,
    first_name: raw.first_name,
    last_name: raw.last_name,
    phone: raw.phone,
    role: typeof raw.role === 'string' ? raw.role : raw.role.name,
    campanas: raw.campanas,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay un usuario autenticado al cargar
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token')
      if (token) {
        try {
          const userData = await authAPI.me()
          setUser(normalizeUser(userData.data))
        } catch {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password)

    if (response.success && response.data?.token) {
      const normalized = normalizeUser(response.data.user)
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user', JSON.stringify(normalized))
      setUser(normalized)
    } else {
      throw new Error(response.message || 'No se pudo iniciar sesión')
    }
  }

  const refreshUser = async () => {
    const userData = await authAPI.me()
    const normalized = normalizeUser(userData.data)
    localStorage.setItem('user', JSON.stringify(normalized))
    setUser(normalized)
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
