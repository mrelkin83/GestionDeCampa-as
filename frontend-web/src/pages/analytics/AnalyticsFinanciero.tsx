import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Award,
  PieChart as PieChartIcon
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import MainLayout from '@/components/layout/MainLayout'
import { analyticsAPI } from '@/lib/api'
import { AnalyticsFinanciero as AnalyticsFinancieroType, FiltrosAnalytics } from '@/types/analytics'
import { useActiveCampana } from '@/hooks/useActiveCampana'

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899']

export default function AnalyticsFinanciero() {
  const navigate = useNavigate()
  const { campanaId, hasCampana } = useActiveCampana()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsFinancieroType | null>(null)
  const [filtros, setFiltros] = useState<FiltrosAnalytics>({
    fecha_inicio: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    fecha_fin: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (campanaId) {
      loadAnalytics()
    } else {
      setLoading(false)
    }
  }, [filtros, campanaId])

  const loadAnalytics = async () => {
    if (!campanaId) return
    try {
      setLoading(true)
      const response = await analyticsAPI.financiero(campanaId, filtros)
      setData(response.data)
    } catch (error) {
      console.error('Error cargando analytics financiero:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(monto)
  }

  if (!hasCampana) {
    return (
      <MainLayout>
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-6">
          No tienes una campaña asignada, así que no hay datos disponibles para Analytics.
        </div>
      </MainLayout>
    )
  }

  if (loading || !data) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-96">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    )
  }

  const balance = data.total_ingresos - data.total_egresos

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/analytics')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Análisis Financiero</h1>
            <p className="text-gray-600 mt-1">
              Análisis detallado de ingresos, gastos y proyecciones
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filtros.fecha_inicio}
                onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={filtros.fecha_fin}
                onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-6 h-6" />
              <p className="text-sm opacity-90">Total Ingresos</p>
            </div>
            <p className="text-3xl font-bold">{formatMonto(data.total_ingresos)}</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-6 h-6" />
              <p className="text-sm opacity-90">Total Egresos</p>
            </div>
            <p className="text-3xl font-bold">{formatMonto(data.total_egresos)}</p>
          </div>

          <div className={`bg-gradient-to-br ${balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-lg shadow p-6 text-white`}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-6 h-6" />
              <p className="text-sm opacity-90">Balance</p>
            </div>
            <p className="text-3xl font-bold">{formatMonto(balance)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-gray-600">Burn Rate</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatMonto(data.tasa_quemado)}/mes
            </p>
            {data.proyeccion_agotamiento && (
              <p className="text-xs text-orange-600 mt-1">
                Agotamiento: {new Date(data.proyeccion_agotamiento).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {/* Alertas */}
        {(data.gastos_pendientes_pago > 0 || data.donaciones_por_confirmar > 0) && (
          <div className="space-y-3">
            {data.gastos_pendientes_pago > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Gastos Pendientes de Pago
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Hay {data.gastos_pendientes_pago} gasto(s) aprobado(s) pendiente(s) de pago.
                  </p>
                </div>
              </div>
            )}
            {data.donaciones_por_confirmar > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Donaciones por Confirmar
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Hay {data.donaciones_por_confirmar} donación(es) pendiente(s) de confirmación.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Flujo de Caja */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Flujo de Caja Mensual
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data.ingresos_por_mes.map((ingreso, index) => ({
              fecha: ingreso.fecha,
              ingresos: ingreso.valor,
              egresos: data.egresos_por_mes[index]?.valor || 0
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip formatter={(value) => formatMonto(value as number)} />
              <Legend />
              <Area
                type="monotone"
                dataKey="ingresos"
                stackId="1"
                stroke="#10b981"
                fill="#86efac"
                name="Ingresos"
              />
              <Area
                type="monotone"
                dataKey="egresos"
                stackId="2"
                stroke="#ef4444"
                fill="#fca5a5"
                name="Egresos"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Balance Acumulado */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Balance Acumulado
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data.balance_acumulado}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip formatter={(value) => formatMonto(value as number)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Balance"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donaciones por Tipo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Donaciones por Tipo de Donante
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={data.donaciones_por_tipo}
                  dataKey="valor"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label
                >
                  {data.donaciones_por_tipo.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatMonto(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gastos por Categoría */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Gastos por Categoría
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.gastos_por_categoria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip formatter={(value) => formatMonto(value as number)} />
                <Bar dataKey="valor" name="Monto Gastado">
                  {data.gastos_por_categoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Donantes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Top 10 Donantes
          </h2>
          <div className="space-y-3">
            {data.top_donantes.slice(0, 10).map((donante, index) => (
              <div
                key={donante.donante_id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-700 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{donante.nombre}</p>
                    <p className="text-xs text-gray-500">
                      {donante.numero_donaciones} donación(es)
                    </p>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatMonto(donante.total_donado)}
                </p>
              </div>
            ))}
          </div>
          {data.top_donantes.length === 0 && (
            <div className="text-center py-8">
              <DollarSign className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No hay donantes registrados</p>
              <button
                onClick={() => navigate('/donaciones/donantes/nuevo')}
                className="mt-3 text-sm text-primary-600 hover:text-primary-700"
              >
                Registrar donante
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
