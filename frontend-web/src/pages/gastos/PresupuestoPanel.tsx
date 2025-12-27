import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, TrendingUp } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { categoriasGastoAPI } from '@/lib/api'
import { PresupuestoCategoria } from '@/types/gasto'

export default function PresupuestoPanel() {
  const navigate = useNavigate()
  const [categorias, setCategorias] = useState<PresupuestoCategoria[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPresupuesto()
  }, [])

  const loadPresupuesto = async () => {
    try {
      setLoading(true)
      const response = await categoriasGastoAPI.presupuesto()
      setCategorias(response.data || [])
    } catch (error) {
      console.error('Error cargando presupuesto:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(monto)
  }

  const totalPresupuesto = categorias.reduce((sum, c) => sum + c.presupuesto_asignado, 0)
  const totalEjecutado = categorias.reduce((sum, c) => sum + c.gasto_ejecutado, 0)
  const totalDisponible = totalPresupuesto - totalEjecutado

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/gastos')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Presupuesto por Categoría</h1>
            <p className="text-gray-600 mt-1">
              Monitorea el uso del presupuesto en cada categoría
            </p>
          </div>
        </div>

        {/* Totales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Presupuesto Total</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatMonto(totalPresupuesto)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Ejecutado</p>
            <p className="text-2xl font-bold text-red-600">
              {formatMonto(totalEjecutado)}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Disponible</p>
            <p className="text-2xl font-bold text-green-600">
              {formatMonto(totalDisponible)}
            </p>
          </div>
        </div>

        {/* Categorías */}
        <div className="space-y-4">
          {categorias.map((categoria) => (
            <div
              key={categoria.categoria_id}
              className={`bg-white rounded-lg shadow p-6 ${categoria.excede_presupuesto ? 'border-2 border-red-300' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: categoria.categoria_color }}
                    />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {categoria.categoria_nombre}
                    </h3>
                    {categoria.excede_presupuesto && (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">Sobre presupuesto</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {categoria.numero_gastos} gasto(s) registrado(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {categoria.porcentaje_ejecutado.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">ejecutado</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-gray-600">Presupuesto</p>
                  <p className="font-semibold text-gray-900">
                    {formatMonto(categoria.presupuesto_asignado)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Ejecutado</p>
                  <p className="font-semibold text-red-600">
                    {formatMonto(categoria.gasto_ejecutado)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Disponible</p>
                  <p className="font-semibold text-green-600">
                    {formatMonto(categoria.disponible)}
                  </p>
                </div>
              </div>

              {/* Barra de Progreso */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    categoria.excede_presupuesto
                      ? 'bg-red-600'
                      : categoria.porcentaje_ejecutado > 80
                      ? 'bg-orange-500'
                      : categoria.porcentaje_ejecutado > 50
                      ? 'bg-yellow-500'
                      : 'bg-green-600'
                  }`}
                  style={{
                    width: `${Math.min(categoria.porcentaje_ejecutado, 100)}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {categorias.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <TrendingUp className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay categorías configuradas
            </h3>
            <p className="text-gray-600">
              Configura categorías de gasto desde el panel de administración
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
