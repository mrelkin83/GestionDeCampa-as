import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, X, Loader } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { donantesAPI } from '@/lib/api'
import { Donante } from '@/types/donacion'

export default function DonanteForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<Partial<Donante>>({
    tipo: 'persona',
    nombre: '',
    apellido: '',
    razon_social: '',
    tipo_documento: 'cedula',
    numero_documento: '',
    email: '',
    telefono: '',
    celular: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    pais: 'Colombia',
    ocupacion: '',
    empresa: '',
    sector_economico: '',
    es_anonimo: false,
  })

  useEffect(() => {
    if (isEdit) {
      loadDonante()
    }
  }, [id])

  const loadDonante = async () => {
    try {
      setLoading(true)
      const response = await donantesAPI.getById(Number(id))
      setFormData(response.data)
    } catch (error) {
      console.error('Error cargando donante:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tipo = e.target.value as 'persona' | 'empresa'
    setFormData(prev => ({
      ...prev,
      tipo,
      tipo_documento: tipo === 'persona' ? 'cedula' : 'nit'
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (isEdit) {
        await donantesAPI.update(Number(id), formData)
      } else {
        await donantesAPI.create(formData)
      }
      navigate('/donaciones/donantes')
    } catch (error: any) {
      console.error('Error guardando donante:', error)
      alert(error.response?.data?.message || 'Error al guardar donante')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Editar Donante' : 'Nuevo Donante'}
          </h1>
          <p className="text-gray-600 mt-1">
            Completa la información del donante
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Donante */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tipo de Donante
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo *
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleTipoChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="persona">Persona Natural</option>
                  <option value="empresa">Empresa / Persona Jurídica</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="es_anonimo"
                    checked={formData.es_anonimo}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Donación Anónima
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Información Personal / Empresa */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {formData.tipo === 'persona' ? 'Información Personal' : 'Información de la Empresa'}
            </h2>
            <div className="space-y-4">
              {formData.tipo === 'persona' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido || ''}
                      onChange={handleChange}
                      required={formData.tipo === 'persona'}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Apellido"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Razón Social *
                  </label>
                  <input
                    type="text"
                    name="razon_social"
                    value={formData.razon_social || ''}
                    onChange={handleChange}
                    required={formData.tipo === 'empresa'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Nombre completo de la empresa"
                  />
                  <input type="hidden" name="nombre" value={formData.razon_social || ''} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Documento *
                  </label>
                  <select
                    name="tipo_documento"
                    value={formData.tipo_documento}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {formData.tipo === 'persona' ? (
                      <>
                        <option value="cedula">Cédula</option>
                        <option value="pasaporte">Pasaporte</option>
                        <option value="cedula_extranjeria">Cédula de Extranjería</option>
                      </>
                    ) : (
                      <option value="nit">NIT</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    name="numero_documento"
                    value={formData.numero_documento}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={formData.tipo === 'persona' ? '1234567890' : '900123456-7'}
                  />
                </div>
              </div>

              {formData.tipo === 'persona' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ocupación
                    </label>
                    <input
                      type="text"
                      name="ocupacion"
                      value={formData.ocupacion || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Profesión u ocupación"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Empresa
                    </label>
                    <input
                      type="text"
                      name="empresa"
                      value={formData.empresa || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Empresa donde trabaja"
                    />
                  </div>
                </div>
              )}

              {formData.tipo === 'empresa' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sector Económico
                  </label>
                  <input
                    type="text"
                    name="sector_economico"
                    value={formData.sector_economico || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: Tecnología, Comercio, Construcción"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información de Contacto
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Celular
                  </label>
                  <input
                    type="tel"
                    name="celular"
                    value={formData.celular || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="3001234567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono Fijo
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="6011234567"
                />
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Dirección
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  name="direccion"
                  value={formData.direccion || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Calle 123 #45-67"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="ciudad"
                    value={formData.ciudad || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Bogotá"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento
                  </label>
                  <input
                    type="text"
                    name="departamento"
                    value={formData.departamento || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Cundinamarca"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    País
                  </label>
                  <input
                    type="text"
                    name="pais"
                    value={formData.pais}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Colombia"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/donaciones/donantes')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
                <span>Cancelar</span>
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{isEdit ? 'Actualizar' : 'Crear Donante'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
