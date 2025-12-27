import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, X, Loader } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { eventosAPI } from '@/lib/api'
import { Evento } from '@/types/evento'

export default function EventoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<Partial<Evento>>({
    nombre: '',
    descripcion: '',
    tipo: 'reunion',
    fecha_inicio: '',
    fecha_fin: '',
    ubicacion: '',
    direccion: '',
    capacidad_maxima: undefined,
    requiere_confirmacion: true,
    estado: 'planificado',
  })

  useEffect(() => {
    if (isEdit) {
      loadEvento()
    }
  }, [id])

  const loadEvento = async () => {
    try {
      setLoading(true)
      const response = await eventosAPI.getById(Number(id))
      setFormData(response.data)
    } catch (error) {
      console.error('Error cargando evento:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (isEdit) {
        await eventosAPI.update(Number(id), formData)
      } else {
        await eventosAPI.create(formData)
      }
      navigate('/eventos')
    } catch (error: any) {
      console.error('Error guardando evento:', error)
      alert(error.response?.data?.message || 'Error al guardar evento')
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
            {isEdit ? 'Editar Evento' : 'Nuevo Evento'}
          </h1>
          <p className="text-gray-600 mt-1">
            Completa la información del evento
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
          <div className="p-6 space-y-6">
            {/* Información Básica */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Información Básica
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Evento *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: Reunión Comunitaria Barrio Norte"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion || ''}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe el evento..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Evento *
                    </label>
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="reunion">Reunión</option>
                      <option value="mitin">Mitin</option>
                      <option value="puerta_puerta">Puerta a Puerta</option>
                      <option value="capacitacion">Capacitación</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="planificado">Planificado</option>
                      <option value="en_curso">En Curso</option>
                      <option value="finalizado">Finalizado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Fecha y Hora */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Fecha y Hora
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha y Hora de Inicio *
                  </label>
                  <input
                    type="datetime-local"
                    name="fecha_inicio"
                    value={formData.fecha_inicio || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha y Hora de Fin *
                  </label>
                  <input
                    type="datetime-local"
                    name="fecha_fin"
                    value={formData.fecha_fin || ''}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Ubicación
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lugar
                  </label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={formData.ubicacion || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: Salón Comunal Barrio Norte"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección Completa
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
              </div>
            </div>

            {/* Configuración */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Configuración
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacidad Máxima
                  </label>
                  <input
                    type="number"
                    name="capacidad_maxima"
                    value={formData.capacidad_maxima || ''}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0 = Sin límite"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="requiere_confirmacion"
                    name="requiere_confirmacion"
                    checked={formData.requiere_confirmacion}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="requiere_confirmacion" className="text-sm font-medium text-gray-700">
                    Requiere confirmación de asistencia
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-lg">
            <button
              type="button"
              onClick={() => navigate('/eventos')}
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
                  <span>{isEdit ? 'Actualizar' : 'Crear Evento'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
