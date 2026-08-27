import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Calendar,
  MessageSquare,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { votantesAPI, eventosAPI, donacionesAPI, gastosAPI, campanasAPI } from '@/lib/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    votantes: 0,
    eventos: 0,
    mensajes: 0,
    donaciones: 0,
    gastos: 0,
    presupuesto: 0,
    eventos_proximos: [] as any[],
    alertas: [] as any[]
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [votantesRes, eventosRes, donacionesRes, gastosRes, campanasRes] = await Promise.all([
        votantesAPI.getAll().catch(() => ({ data: [], total: 0 })),
        eventosAPI.getAll().catch(() => ({ data: [] })),
        donacionesAPI.estadisticas().catch(() => ({ data: { total_recaudado: 0 } })),
        gastosAPI.estadisticas().catch(() => ({ data: { ejecutado_total: 0, presupuesto_total: 0, categorias_sobre_presupuesto: 0, gastos_pendientes_aprobacion: 0 } })),
        campanasAPI.getAll().catch(() => ({ data: [] }))
      ])

      const alertas = []
      if (gastosRes.data?.categorias_sobre_presupuesto > 0) {
        alertas.push({
          tipo: 'error',
          mensaje: `${gastosRes.data.categorias_sobre_presupuesto} categoría(s) sobre presupuesto`,
          accion: () => navigate('/gastos/presupuesto')
        })
      }
      if (gastosRes.data?.gastos_pendientes_aprobacion > 0) {
        alertas.push({
          tipo: 'warning',
          mensaje: `${gastosRes.data.gastos_pendientes_aprobacion} gasto(s) pendiente(s) de aprobación`,
          accion: () => navigate('/gastos')
        })
      }

      const eventosProximos = (eventosRes.data || [])
        .filter((e: any) => new Date(e.fecha_inicio) >= new Date() && e.estado === 'planificado')
        .sort((a: any, b: any) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())
        .slice(0, 3)

      setStats({
        votantes: votantesRes.total || 0,
        eventos: eventosProximos.length,
        mensajes: (campanasRes.data || []).reduce((sum: number, c: any) => sum + (c.enviados || 0), 0),
        donaciones: donacionesRes.data?.total_recaudado || 0,
        gastos: gastosRes.data?.ejecutado_total || 0,
        presupuesto: gastosRes.data?.presupuesto_total || 0,
        eventos_proximos: eventosProximos,
        alertas
      })
    } catch (error) {
      console.error('Error cargando dashboard:', error)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const balance = stats.donaciones - stats.gastos
  const porcentajePresupuesto = stats.presupuesto > 0 ? (stats.gastos / stats.presupuesto) * 100 : 0

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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Plataforma Electoral - Colombia</p>
        </div>

        {/* Alertas */}
        {stats.alertas.length > 0 && (
          <div className="space-y-3">
            {stats.alertas.map((alerta, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer ${
                  alerta.tipo === 'error' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'
                }`}
                onClick={alerta.accion}
              >
                <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${alerta.tipo === 'error' ? 'text-red-600' : 'text-yellow-600'}`} />
                <p className={`text-sm font-medium ${alerta.tipo === 'error' ? 'text-red-900' : 'text-yellow-900'}`}>
                  {alerta.mensaje}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/votantes')}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-500">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Total Votantes</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.votantes.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/eventos')}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-500">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Eventos Próximos</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.eventos}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/comunicacion/mensajes')}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-500">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Mensajes Enviados</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.mensajes.toLocaleString()}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/gastos/presupuesto')}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-orange-500">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">Presupuesto Ejecutado</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{porcentajePresupuesto.toFixed(1)}%</p>
          </div>
        </div>

        {/* Sección Financiera */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <p className="text-sm opacity-90">Ingresos (Donaciones)</p>
            </div>
            <p className="text-3xl font-bold">{formatMonto(stats.donaciones)}</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5" />
              <p className="text-sm opacity-90">Egresos (Gastos)</p>
            </div>
            <p className="text-3xl font-bold">{formatMonto(stats.gastos)}</p>
          </div>

          <div className={`bg-gradient-to-br ${balance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-lg shadow p-6 text-white`}>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <p className="text-sm opacity-90">Balance</p>
            </div>
            <p className="text-3xl font-bold">{formatMonto(balance)}</p>
          </div>
        </div>

        {/* Timeline de Eventos y Resumen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Próximos Eventos</h2>
              <button
                onClick={() => navigate('/eventos')}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Ver todos
              </button>
            </div>

            {stats.eventos_proximos.length > 0 ? (
              <div className="space-y-4">
                {stats.eventos_proximos.map((evento: any) => (
                  <div
                    key={evento.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => navigate(`/eventos/${evento.id}`)}
                  >
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{evento.nombre}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(evento.fecha_inicio)}
                        </span>
                        {evento.ubicacion_nombre && <span>• {evento.ubicacion_nombre}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No hay eventos próximos programados</p>
                <button
                  onClick={() => navigate('/eventos/nuevo')}
                  className="mt-3 text-sm text-primary-600 hover:text-primary-700"
                >
                  Crear evento
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen de Campaña</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Base de Votantes</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.votantes.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">Eventos Planificados</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.eventos}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-gray-600">Mensajes Enviados</span>
                </div>
                <span className="font-semibold text-gray-900">{stats.mensajes.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">Estado</span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                  Activa
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
