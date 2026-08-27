import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, TrendingUp, Map, UserCheck } from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import MainLayout from '@/components/layout/MainLayout'
import { analyticsAPI } from '@/lib/api'
import { AnalyticsVotantes as AnalyticsVotantesType, FiltrosAnalytics } from '@/types/analytics'
import { useActiveCampana } from '@/hooks/useActiveCampana'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function AnalyticsVotantes() {
  const navigate = useNavigate()
  const { campanaId, hasCampana } = useActiveCampana()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsVotantesType | null>(null)
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
      const response = await analyticsAPI.votantes(campanaId, filtros)
      setData(response.data)
    } catch (error) {
      console.error('Error cargando analytics de votantes:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CO').format(num)
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
            <h1 className="text-3xl font-bold text-gray-900">Análisis de Votantes</h1>
            <p className="text-gray-600 mt-1">
              Análisis detallado de tu base de votantes
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-6 h-6" />
              <p className="text-sm opacity-90">Total Votantes</p>
            </div>
            <p className="text-3xl font-bold">{formatNumber(data.total_votantes)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">Nuevos este Mes</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(data.nuevos_mes_actual)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {data.tasa_crecimiento.cambio_porcentual > 0 ? '+' : ''}
              {data.tasa_crecimiento.cambio_porcentual.toFixed(1)}% vs mes anterior
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600">Tasa de Crecimiento</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {data.tasa_crecimiento.cambio_porcentual.toFixed(1)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Mensual</p>
          </div>
        </div>

        {/* Gráficos de Evolución */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Evolución de Base de Votantes
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={data.evolucion_mensual}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip formatter={(value) => formatNumber(value as number)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="#3b82f6"
                strokeWidth={2}
                name="Votantes"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribución por Departamento */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Map className="w-5 h-5" />
              Distribución Geográfica (Top 8)
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.distribucion_por_departamento.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="nombre" type="category" width={100} />
                <Tooltip formatter={(value) => formatNumber(value as number)} />
                <Bar dataKey="valor" name="Votantes">
                  {data.distribucion_por_departamento.slice(0, 8).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Distribución por Género */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Distribución por Género
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={data.distribucion_por_genero}
                  dataKey="valor"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label
                >
                  {data.distribucion_por_genero.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNumber(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Distribución por Rango de Edad */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Distribución por Rango de Edad
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.distribucion_por_rango_edad}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip formatter={(value) => formatNumber(value as number)} />
                <Bar dataKey="valor" name="Votantes" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Segmentos Más Grandes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Segmentos Más Grandes
            </h2>
            <div className="space-y-3">
              {data.segmentos_mas_grandes.slice(0, 8).map((segmento, index) => (
                <div
                  key={segmento.segmento_id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div>
                      <p className="font-medium text-gray-900">{segmento.nombre}</p>
                      <p className="text-xs text-gray-500">
                        {segmento.porcentaje.toFixed(1)}% del total
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatNumber(segmento.total_votantes)}
                  </p>
                </div>
              ))}
            </div>
            {data.segmentos_mas_grandes.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No hay segmentos creados</p>
                <button
                  onClick={() => navigate('/segmentos/nuevo')}
                  className="mt-3 text-sm text-primary-600 hover:text-primary-700"
                >
                  Crear segmento
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
