import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, X, Loader } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { gastosAPI } from '@/lib/api'
import { Gasto } from '@/types/gasto'
import { useActiveCampana } from '@/hooks/useActiveCampana'

const CATEGORIAS: Array<{ value: Gasto['categoria']; label: string }> = [
  { value: 'publicidad', label: 'Publicidad' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'logistica', label: 'Logística' },
  { value: 'personal', label: 'Personal' },
  { value: 'materiales', label: 'Materiales' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'servicios_profesionales', label: 'Servicios Profesionales' },
  { value: 'otro', label: 'Otro' },
]

export default function GastoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const { campanaId } = useActiveCampana()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<Partial<Gasto>>({
    descripcion: '',
    monto: 0,
    moneda: 'COP',
    fecha_gasto: new Date().toISOString().split('T')[0],
    categoria: 'otro',
    subcategoria: '',
    proveedor: '',
    nit_proveedor: '',
    metodo_pago: 'transferencia',
    numero_factura: '',
  })

  useEffect(() => {
    if (isEdit) {
      loadGasto()
    }
  }, [id])

  const loadGasto = async () => {
    try {
      setLoading(true)
      const response = await gastosAPI.getById(Number(id))
      setFormData(response.data)
    } catch (error) {
      console.error('Error cargando gasto:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : 0) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = { ...formData, campana_id: campanaId }
      if (isEdit) {
        await gastosAPI.update(Number(id), payload)
      } else {
        await gastosAPI.create(payload)
      }
      navigate('/gastos')
    } catch (error: any) {
      console.error('Error guardando gasto:', error)
      alert(error.response?.data?.message || 'Error al guardar gasto')
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
            {isEdit ? 'Editar Gasto' : 'Registrar Gasto'}
          </h1>
          <p className="text-gray-600 mt-1">
            Completa la información del gasto
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del Gasto */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Detalles del Gasto
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ej: Publicidad en redes sociales"
                />
              </div>

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
                    Fecha del Gasto *
                  </label>
                  <input
                    type="date"
                    name="fecha_gasto"
                    value={formData.fecha_gasto}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {CATEGORIAS.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subcategoría
                  </label>
                  <input
                    type="text"
                    name="subcategoria"
                    value={formData.subcategoria || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Opcional"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Proveedor */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información del Proveedor
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proveedor
                  </label>
                  <input
                    type="text"
                    name="proveedor"
                    value={formData.proveedor || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Nombre del proveedor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIT
                  </label>
                  <input
                    type="text"
                    name="nit_proveedor"
                    value={formData.nit_proveedor || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="NIT del proveedor"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pago */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información de Pago
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Pago
                  </label>
                  <select
                    name="metodo_pago"
                    value={formData.metodo_pago}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="cheque">Cheque</option>
                    <option value="tarjeta">Tarjeta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. Factura
                  </label>
                  <input
                    type="text"
                    name="numero_factura"
                    value={formData.numero_factura || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Número de factura"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuenta Bancaria
                  </label>
                  <input
                    type="text"
                    name="cuenta_bancaria"
                    value={formData.cuenta_bancaria || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Cuenta de origen del pago"
                  />
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
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/gastos')}
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
                    <span>{isEdit ? 'Actualizar' : 'Registrar Gasto'}</span>
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
