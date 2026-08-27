import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { authAPI, rolesAPI } from '@/lib/api'
import MainLayout from '@/components/layout/MainLayout'

interface RoleOption {
  id: number
  name: string
  display_name: string
}

/**
 * Crear usuario (solo super_admin). No es auto-registro público: el
 * backend cierra esa ruta a cualquiera sin sesión de super_admin -antes
 * permitía que cualquier anónimo se autoasignara rol de super_admin.
 */
export default function Register() {
  const navigate = useNavigate()
  const [roles, setRoles] = useState<RoleOption[]>([])
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    document_type: 'CC' as 'CC' | 'CE' | 'TI' | 'PAS',
    document_number: '',
    role_id: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    rolesAPI.getAll()
      .then((res) => setRoles(res.data || []))
      .catch(() => setError('No se pudo cargar la lista de roles'))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.password_confirmation) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (!formData.role_id) {
      setError('Selecciona un rol')
      return
    }

    setLoading(true)
    try {
      await authAPI.register({
        ...formData,
        role_id: Number(formData.role_id),
      })
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 1200)
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(message || 'No se pudo crear el usuario')
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Crear Usuario</h1>
            <p className="text-gray-600 text-sm">
              Solo un super administrador puede registrar nuevas cuentas.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4">
              Usuario creado exitosamente.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                name="first_name" value={formData.first_name} onChange={handleChange}
                required placeholder="Nombre"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
              <input
                name="last_name" value={formData.last_name} onChange={handleChange}
                required placeholder="Apellido"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <input
              name="email" type="email" value={formData.email} onChange={handleChange}
              required placeholder="usuario@ejemplo.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />

            <input
              name="phone" value={formData.phone} onChange={handleChange}
              placeholder="Teléfono (opcional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                name="document_type" value={formData.document_type} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
                <option value="TI">Tarjeta de Identidad</option>
                <option value="PAS">Pasaporte</option>
              </select>
              <input
                name="document_number" value={formData.document_number} onChange={handleChange}
                required placeholder="Número de documento"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <select
              name="role_id" value={formData.role_id} onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Selecciona un rol...</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.display_name}</option>
              ))}
            </select>

            <input
              name="password" type="password" value={formData.password} onChange={handleChange}
              required minLength={8} placeholder="Contraseña"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <input
              name="password_confirmation" type="password" value={formData.password_confirmation} onChange={handleChange}
              required minLength={8} placeholder="Confirmar contraseña"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creando usuario...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Crear Usuario</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  )
}
