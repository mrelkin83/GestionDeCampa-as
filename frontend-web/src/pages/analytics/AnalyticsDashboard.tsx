import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  DollarSign,
  MessageSquare,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileText
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
  ResponsiveContainer
} from 'recharts'
import MainLayout from '@/components/layout/MainLayout'
import { analyticsAPI } from '@/lib/api'
import { AnalyticsGeneral, FiltrosAnalytics } from '@/types/analytics'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AnalyticsDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsGeneral | null>(null)
  const [filtros, setFiltros] = useState<FiltrosAnalytics>({
    fecha_inicio: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1).toISOString().split('T')[0],
    fecha_fin: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadAnalytics()
  }, [filtros])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await analyticsAPI.general(filtros)
      setData(response.data)
    } catch (error) {
      console.error('Error cargando analytics:', error)
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CO').format(num)
  }

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'subiendo':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />
      case 'bajando':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-gray-600" />
    }
  }

  const getTendenciaColor = (tendencia: string) => {
    switch (tendencia) {
      case 'subiendo':
        return 'text-green-600'
      case 'bajando':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
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

  const { resumen_ejecutivo, votantes, financiero, comunicacion, eventos } = data

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Análisis completo de tu campaña</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/analytics/reportes')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FileText className="w-5 h-5" />
              <span>Reportes</span>
            </button>
          </div>
        </div>

        {/* Filtros de Fecha */}
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
          <div
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/analytics/votantes')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              {getTendenciaIcon(resumen_ejecutivo.base_votantes.tendencia)}
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Base de Votantes</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatNumber(votantes.total_votantes)}
            </p>
            <p className={`text-xs mt-2 ${getTendenciaColor(resumen_ejecutivo.base_votantes.tendencia)}`}>
              {resumen_ejecutivo.base_votantes.cambio_porcentual > 0 ? '+' : ''}
              {resumen_ejecutivo.base_votantes.cambio_porcentual.toFixed(1)}% vs período anterior
            </p>
          </div>

          <div
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/analytics/financiero')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-100">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              {getTendenciaIcon(resumen_ejecutivo.recaudacion.tendencia)}
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Recaudación Total</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatMonto(financiero.total_ingresos)}
            </p>
            <p className={`text-xs mt-2 ${getTendenciaColor(resumen_ejecutivo.recaudacion.tendencia)}`}>
              {resumen_ejecutivo.recaudacion.cambio_porcentual > 0 ? '+' : ''}
              {resumen_ejecutivo.recaudacion.cambio_porcentual.toFixed(1)}% vs período anterior
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
              {getTendenciaIcon(resumen_ejecutivo.alcance_comunicacion.tendencia)}
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Alcance Comunicación</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatNumber(comunicacion.total_destinatarios_unicos)}
            </p>
            <p className={`text-xs mt-2 ${getTendenciaColor(resumen_ejecutivo.alcance_comunicacion.tendencia)}`}>
              {resumen_ejecutivo.alcance_comunicacion.cambio_porcentual > 0 ? '+' : ''}
              {resumen_ejecutivo.alcance_comunicacion.cambio_porcentual.toFixed(1)}% vs período anterior
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-orange-100">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              {getTendenciaIcon(resumen_ejecutivo.participacion_eventos.tendencia)}
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Tasa de Asistencia</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {eventos.tasa_asistencia_promedio.toFixed(1)}%
            </p>
            <p className={`text-xs mt-2 ${getTendenciaColor(resumen_ejecutivo.participacion_eventos.tendencia)}`}>
              {resumen_ejecutivo.participacion_eventos.cambio_porcentual > 0 ? '+' : ''}
              {resumen_ejecutivo.participacion_eventos.cambio_porcentual.toFixed(1)}% vs período anterior
            </p>
          </div>
        </div>

        {/* Gráficos Principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolución de Votantes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Evolución de Base de Votantes
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={votantes.evolucion_mensual}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip formatter={(value) => formatNumber(value as number)} />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="#3b82f6"
                  fill="#93c5fd"
                  name="Votantes"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Balance Financiero */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Balance Financiero Acumulado
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={financiero.balance_acumulado}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip formatter={(value) => formatMonto(value as number)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="valor"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Balance"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Distribución por Departamento */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Votantes por Departamento (Top 6)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={votantes.distribucion_por_departamento.slice(0, 6)}
                  dataKey="valor"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {votantes.distribucion_por_departamento.slice(0, 6).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNumber(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Gastos por Categoría */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Gastos por Categoría
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financiero.gastos_por_categoria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nombre" />
                <YAxis />
                <Tooltip formatter={(value) => formatMonto(value as number)} />
                <Bar dataKey="valor" name="Monto Gastado">
                  {financiero.gastos_por_categoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/analytics/votantes')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow"
          >
            <Users className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Análisis de Votantes</h3>
            <p className="text-sm text-gray-600">
              Segmentación, distribución geográfica y tendencias
            </p>
          </button>

          <button
            onClick={() => navigate('/analytics/financiero')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow"
          >
            <DollarSign className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Análisis Financiero</h3>
            <p className="text-sm text-gray-600">
              Ingresos, gastos, proyecciones y burn rate
            </p>
          </button>

          <button
            onClick={() => navigate('/analytics/reportes')}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow"
          >
            <FileText className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Reportes Exportables</h3>
            <p className="text-sm text-gray-600">
              Genera reportes PDF y Excel personalizados
            </p>
          </button>
        </div>
      </div>
    </MainLayout>
  )
}
