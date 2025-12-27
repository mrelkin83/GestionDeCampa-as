import { useState } from 'react'
import { Save, User, Mail, Phone, Lock, Camera } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

export default function PerfilPage() {
  const { user } = useAuth()
  const { success, error } = useToast()
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    cargo: '',
    departamento: ''
  })

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  })

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Aquí iría la llamada al API para actualizar perfil
      await new Promise(resolve => setTimeout(resolve, 1000))
      success('Perfil actualizado exitosamente')
    } catch (err) {
      error('Error al actualizar perfil')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.new_password !== passwordData.new_password_confirmation) {
      error('Las contraseñas no coinciden')
      return
    }

    if (passwordData.new_password.length < 8) {
      error('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setChangingPassword(true)

    try {
      // Aquí iría la llamada al API para cambiar contraseña
      await new Promise(resolve => setTimeout(resolve, 1000))
      success('Contraseña actualizada exitosamente')
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
      })
    } catch (err) {
      error('Error al cambiar contraseña')
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-1">
            Administra tu información personal y contraseña
          </p>
        </div>

        {/* Avatar y Datos Básicos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-3xl font-bold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Datos Básicos */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <p className="text-gray-600">{user?.email}</p>
              <div className="mt-3">
                <span className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                  Administrador
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Información Personal */}
        <form onSubmit={handleProfileSubmit} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Información Personal
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    required
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+57 300 123 4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo
                </label>
                <input
                  type="text"
                  value={profileData.cargo}
                  onChange={(e) => setProfileData({ ...profileData, cargo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ej: Coordinador de Campaña"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departamento
              </label>
              <input
                type="text"
                value={profileData.departamento}
                onChange={(e) => setProfileData({ ...profileData, departamento: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ej: Comunicaciones"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biografía
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Cuéntanos un poco sobre ti..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Cambiar Contraseña */}
        <form onSubmit={handlePasswordSubmit} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Cambiar Contraseña
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña Actual *
              </label>
              <input
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nueva Contraseña *
                </label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Nueva Contraseña *
                </label>
                <input
                  type="password"
                  value={passwordData.new_password_confirmation}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' })}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={changingPassword}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {changingPassword ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Cambiando...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Cambiar Contraseña</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
