import { useState } from 'react'
import { Save, Bell, Lock, Eye, Globe, Palette } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { useAuth } from '@/contexts/AuthContext'

export default function ConfiguracionPage() {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState({
    // Notificaciones
    notif_email: true,
    notif_push: false,
    notif_sms: false,
    notif_eventos: true,
    notif_donaciones: true,
    notif_gastos: true,

    // Privacidad
    perfil_publico: false,
    mostrar_email: false,

    // Idioma y región
    idioma: 'es',
    zona_horaria: 'America/Bogota',

    // Tema
    tema: 'light',
    color_primario: '#3b82f6'
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      // Aquí iría la llamada al API para guardar configuración
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert('Configuración guardada exitosamente')
    } catch (error) {
      console.error('Error guardando configuración:', error)
      alert('Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
          <p className="text-gray-600 mt-1">
            Personaliza tu experiencia en la plataforma
          </p>
        </div>

        {/* Información de Usuario */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información de la Cuenta
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Nombre</p>
              <p className="font-medium text-gray-900">{user?.name || 'Usuario'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{user?.email || 'email@ejemplo.com'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Rol</p>
              <p className="font-medium text-gray-900">Administrador</p>
            </div>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Notificaciones</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Canales de Notificación</h3>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Notificaciones por Email</span>
                  <input
                    type="checkbox"
                    checked={config.notif_email}
                    onChange={(e) => setConfig({ ...config, notif_email: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Notificaciones Push (Navegador)</span>
                  <input
                    type="checkbox"
                    checked={config.notif_push}
                    onChange={(e) => setConfig({ ...config, notif_push: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Notificaciones por SMS</span>
                  <input
                    type="checkbox"
                    checked={config.notif_sms}
                    onChange={(e) => setConfig({ ...config, notif_sms: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Alertas de Módulos</h3>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Eventos próximos</span>
                  <input
                    type="checkbox"
                    checked={config.notif_eventos}
                    onChange={(e) => setConfig({ ...config, notif_eventos: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Donaciones recibidas</span>
                  <input
                    type="checkbox"
                    checked={config.notif_donaciones}
                    onChange={(e) => setConfig({ ...config, notif_donaciones: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">Gastos pendientes de aprobación</span>
                  <input
                    type="checkbox"
                    checked={config.notif_gastos}
                    onChange={(e) => setConfig({ ...config, notif_gastos: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Privacidad */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Privacidad</h2>
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm text-gray-700 block">Perfil Público</span>
                <span className="text-xs text-gray-500">Otros usuarios pueden ver tu perfil</span>
              </div>
              <input
                type="checkbox"
                checked={config.perfil_publico}
                onChange={(e) => setConfig({ ...config, perfil_publico: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
            </label>
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm text-gray-700 block">Mostrar Email</span>
                <span className="text-xs text-gray-500">Tu email será visible para otros</span>
              </div>
              <input
                type="checkbox"
                checked={config.mostrar_email}
                onChange={(e) => setConfig({ ...config, mostrar_email: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
            </label>
          </div>
        </div>

        {/* Idioma y Región */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Idioma y Región</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma
              </label>
              <select
                value={config.idioma}
                onChange={(e) => setConfig({ ...config, idioma: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="es">Español (Colombia)</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zona Horaria
              </label>
              <select
                value={config.zona_horaria}
                onChange={(e) => setConfig({ ...config, zona_horaria: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="America/Bogota">Bogotá (UTC-5)</option>
                <option value="America/New_York">New York (UTC-5)</option>
                <option value="Europe/Madrid">Madrid (UTC+1)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Apariencia */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Apariencia</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tema
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setConfig({ ...config, tema: 'light' })}
                  className={`p-3 border rounded-lg text-sm ${
                    config.tema === 'light'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Eye className="w-5 h-5 mx-auto mb-1" />
                  Claro
                </button>
                <button
                  onClick={() => setConfig({ ...config, tema: 'dark' })}
                  className={`p-3 border rounded-lg text-sm ${
                    config.tema === 'dark'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Eye className="w-5 h-5 mx-auto mb-1" />
                  Oscuro
                </button>
                <button
                  onClick={() => setConfig({ ...config, tema: 'auto' })}
                  className={`p-3 border rounded-lg text-sm ${
                    config.tema === 'auto'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Eye className="w-5 h-5 mx-auto mb-1" />
                  Auto
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Principal
              </label>
              <div className="flex gap-3">
                {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((color) => (
                  <button
                    key={color}
                    onClick={() => setConfig({ ...config, color_primario: color })}
                    className={`w-10 h-10 rounded-lg border-2 ${
                      config.color_primario === color ? 'border-gray-900 ring-2 ring-gray-300' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-end gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
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
        </div>
      </div>
    </MainLayout>
  )
}
