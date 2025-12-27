import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, X, Loader, Plus, AlertCircle } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { donacionesAPI, donantesAPI } from '@/lib/api'
import { Donacion, Donante } from '@/types/donacion'

const LIMITE_LEGAL_PERSONA = 50000000 // 50 millones de pesos
const LIMITE_LEGAL_EMPRESA = 200000000 // 200 millones

export default function DonacionForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [donantes, setDonantes] = useState<Donante[]>([])
  const [donanteSeleccionado, setDonanteSeleccionado] = useState<Donante | null>(null)
  const [excedeLimite, setExcedeLimite] = useState(false)

  const [formData, setFormData] = useState<Partial<Donacion>>({
    donante_id: undefined,
    monto: 0,
    fecha_donacion: new Date().toISOString().split('T')[0],
    metodo_pago: 'efectivo',
    referencia: '',
    banco: '',
    estado: 'pendiente',
    observaciones: '',
    requiere_reporte: false,
    verificada: false,
  })

  useEffect(() => {
    loadDonantes()
    if (isEdit) {
      loadDonacion()
    }
  }, [id])

  useEffect(() => {
    if (formData.donante_id) {
      const donante = donantes.find(d => d.id === formData.donante_id)
      setDonanteSeleccionado(donante || null)

      // Verificar límites legales
      if (donante && formData.monto && formData.monto > 0) {
        const montoTotal = (donante.monto_total_donado || 0) + (formData.monto || 0)
        const limite = donante.tipo === 'persona' ? LIMITE_LEGAL_PERSONA : LIMITE_LEGAL_EMPRESA

        if (montoTotal > limite) {
          setExcedeLimite(true)
          setFormData(prev => ({ ...prev, requiere_reporte: true }))
        } else {
          setExcedeLimite(false)
          setFormData(prev => ({ ...prev, requiere_reporte: false }))
        }
      }
    }
  }, [formData.donante_id, formData.monto, donantes])

  const loadDonantes = async () => {
    try {
      const response = await donantesAPI.getAll()
      setDonantes(response.data || [])
    } catch (error) {
      console.error('Error cargando donantes:', error)
    }
  }

  const loadDonacion = async () => {
    try {
      setLoading(true)
      const response = await donacionesAPI.getById(Number(id))
      setFormData(response.data)
    } catch (error) {
      console.error('Error cargando donación:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number'
        ? (value ? Number(value) : 0)
        : name.includes('_id')
          ? (value ? Number(value) : undefined)
          : type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
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
      if (isEdit) {
        await donacionesAPI.update(Number(id), formData)
      } else {
        await donacionesAPI.create(formData)
      }
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
            {isEdit ? 'Editar Donación' : 'Registrar Donación'}
          </h1>
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
                    {donante.nombre} {donante.apellido || donante.razon_social || ''} - {donante.numero_documento}
                  </option>
                ))}
              </select>
            </div>

            {donanteSeleccionado && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Tipo:</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {donanteSeleccionado.tipo}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Documento:</p>
                    <p className="font-medium text-gray-900">
                      {donanteSeleccionado.numero_documento}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Donado:</p>
                    <p className="font-medium text-gray-900">
                      {formatMonto(donanteSeleccionado.monto_total_donado || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Donaciones:</p>
                    <p className="font-medium text-gray-900">
                      {donanteSeleccionado.total_donaciones || 0}
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
              <div className="grid grid-cols-2 gap-4">
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

              {excedeLimite && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">
                      Advertencia: Límite Legal Excedido
                    </p>
                    <p className="text-sm text-orange-700 mt-1">
                      Esta donación excede el límite legal para {donanteSeleccionado?.tipo === 'persona' ? 'personas' : 'empresas'}
                      ({formatMonto(donanteSeleccionado?.tipo === 'persona' ? LIMITE_LEGAL_PERSONA : LIMITE_LEGAL_EMPRESA)}).
                      Será marcada automáticamente para reporte de compliance.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Pago *
                  </label>
                  <select
                    name="metodo_pago"
                    value={formData.metodo_pago}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="tarjeta_credito">Tarjeta de Crédito</option>
                    <option value="tarjeta_debito">Tarjeta de Débito</option>
                    <option value="cheque">Cheque</option>
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
                    <option value="pendiente">Pendiente</option>
                    <option value="confirmada">Confirmada</option>
                    <option value="rechazada">Rechazada</option>
                  </select>
                </div>
              </div>

              {formData.metodo_pago !== 'efectivo' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Referencia / No. Transacción
                    </label>
                    <input
                      type="text"
                      name="referencia"
                      value={formData.referencia || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Número de referencia"
                    />
                  </div>

                  {(formData.metodo_pago === 'transferencia' || formData.metodo_pago === 'cheque') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Banco
                      </label>
                      <input
                        type="text"
                        name="banco"
                        value={formData.banco || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Nombre del banco"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={formData.observaciones || ''}
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
                    <span>{isEdit ? 'Actualizar' : 'Registrar Donación'}</span>
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
