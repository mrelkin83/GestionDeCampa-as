import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, X, Loader, Plus, AlertCircle } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { donacionesAPI, donantesAPI } from '@/lib/api'
import { Donacion, Donante } from '@/types/donacion'
import { useActiveCampana } from '@/hooks/useActiveCampana'

// No existe (ni existió nunca) una ruta de edición para donaciones: el
// backend no tiene PUT /donaciones/{id} -son inmutables una vez creadas,
// igual que los gastos, para preservar el rastro de auditoría financiera.
// Solo se pueden confirmar/rechazar/reportar al CNE (ver DonacionesListado).
export default function DonacionForm() {
  const navigate = useNavigate()
  const { campanaId } = useActiveCampana()

  const [saving, setSaving] = useState(false)
  const [donantes, setDonantes] = useState<Donante[]>([])
  const [donanteSeleccionado, setDonanteSeleccionado] = useState<Donante | null>(null)

  const [formData, setFormData] = useState<Partial<Donacion>>({
    donante_id: undefined,
    monto: 0,
    moneda: 'COP',
    tipo: 'efectivo',
    fecha_donacion: new Date().toISOString().split('T')[0],
    numero_comprobante: '',
    notas: '',
  })

  useEffect(() => {
    if (campanaId) {
      loadDonantes()
    }
  }, [campanaId])

  useEffect(() => {
    if (formData.donante_id) {
      const donante = donantes.find(d => d.id === formData.donante_id)
      setDonanteSeleccionado(donante || null)
    }
  }, [formData.donante_id, donantes])

  const loadDonantes = async () => {
    try {
      const response = await donantesAPI.getAll({ campana_id: campanaId })
      setDonantes(response.data || [])
    } catch (error) {
      console.error('Error cargando donantes:', error)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number'
        ? (value ? Number(value) : 0)
        : name === 'donante_id'
          ? (value ? Number(value) : undefined)
          : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.donante_id) {
      alert('Debe seleccionar un donante')
      return
    }

    if (!formData.monto || formData.monto <= 0) {
      alert('El monto debe ser mayor a cero')
      return
    }

    setSaving(true)

    try {
      await donacionesAPI.create({ ...formData, campana_id: campanaId })
      navigate('/donaciones')
    } catch (error: any) {
      console.error('Error guardando donación:', error)
      alert(error.response?.data?.message || 'Error al guardar donación')
    } finally {
      setSaving(false)
    }
  }

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(monto)
  }

  const nombreDonante = (donante: Donante) =>
    donante.tipo === 'persona_natural'
      ? `${donante.nombres} ${donante.apellidos || ''}`
      : donante.razon_social

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Registrar Donación</h1>
          <p className="text-gray-600 mt-1">
            Completa la información de la donación recibida
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Donante */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Donante
              </h2>
              <button
                type="button"
                onClick={() => navigate('/donaciones/donantes/nuevo')}
                className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Donante</span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Donante *
              </label>
              <select
                name="donante_id"
                value={formData.donante_id || ''}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Selecciona un donante</option>
                {donantes.map(donante => (
                  <option key={donante.id} value={donante.id}>
                    {nombreDonante(donante)} - {donante.documento || donante.nit}
                  </option>
                ))}
              </select>
            </div>

            {donanteSeleccionado && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Tipo:</p>
                    <p className="font-medium text-gray-900">
                      {donanteSeleccionado.tipo === 'persona_natural' ? 'Persona Natural' : 'Empresa'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Documento:</p>
                    <p className="font-medium text-gray-900">
                      {donanteSeleccionado.documento || donanteSeleccionado.nit}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Donado:</p>
                    <p className="font-medium text-gray-900">
                      {formatMonto(donanteSeleccionado.total_donado || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Donaciones:</p>
                    <p className="font-medium text-gray-900">
                      {donanteSeleccionado.numero_donaciones || 0}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Información de la Donación */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Detalles de la Donación
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto *
                  </label>
                  <input
                    type="number"
                    name="monto"
                    value={formData.monto}
                    onChange={handleChange}
                    required
                    min="0"
                    step="1000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0"
                  />
                  {formData.monto && formData.monto > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatMonto(formData.monto)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moneda *
                  </label>
                  <select
                    name="moneda"
                    value={formData.moneda}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="COP">COP</option>
                    <option value="USD">USD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Donación *
                  </label>
                  <input
                    type="date"
                    name="fecha_donacion"
                    value={formData.fecha_donacion}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  El sistema valida automáticamente el tope legal individual del donante al guardar. Si lo excede, la donación quedará marcada para validación por un coordinador.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Donación *
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="cheque">Cheque</option>
                    <option value="especie">Especie</option>
                    <option value="servicio">Servicio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. Comprobante
                  </label>
                  <input
                    type="text"
                    name="numero_comprobante"
                    value={formData.numero_comprobante || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Número de comprobante"
                  />
                </div>
              </div>

              {(formData.tipo === 'especie' || formData.tipo === 'servicio') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción de la Especie/Servicio
                  </label>
                  <input
                    type="text"
                    name="descripcion_especie"
                    value={formData.descripcion_especie || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: Alquiler de sonido para evento"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  name="notas"
                  value={formData.notas || ''}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Notas adicionales sobre la donación"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/donaciones')}
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
                    <span>Registrar Donación</span>
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
