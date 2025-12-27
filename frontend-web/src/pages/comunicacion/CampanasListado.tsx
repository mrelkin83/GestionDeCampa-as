import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Send,
  Clock,
  CheckCircle,
  MessageSquare,
  Users,
  Eye
} from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import Badge from '@/components/ui/Badge'
import { campanasAPI } from '@/lib/api'
import { Campana } from '@/types/comunicacion'

export default function CampanasListado() {
  const navigate = useNavigate()
  const [campanas, setCampanas] = useState<Campana[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<string>('')

  useEffect(() => {
    fetchCampanas()
  }, [filtroEstado])

  const fetchCampanas = async () => {
    try {
      setLoading(true)
      const response = await campanasAPI.getAll({
        estado: filtroEstado || undefined
      })
      setCampanas(response.data || [])
    } catch (error) {
      console.error('Error al cargar campañas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    const badges = {
      borrador: { text: 'Borrador', variant: 'default' as const },
      programada: { text: 'Programada', variant: 'info' as const },
      en_proceso: { text: 'En Proceso', variant: 'warning' as const },
      completada: { text: 'Completada', variant: 'success' as const },
      cancelada: { text: 'Cancelada', variant: 'danger' as const },
    }
    const config = badges[estado as keyof typeof badges] || badges.borrador
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const getCanalBadge = (canal: string) => {
    const badges = {
      sms: { text: 'SMS', variant: 'info' as const },
      whatsapp: { text: 'WhatsApp', variant: 'success' as const },
      email: { text: 'Email', variant: 'default' as const },
    }
    const config = badges[canal as keyof typeof badges] || badges.sms
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calcularTasa = (parcial: number, total: number): number => {
    if (total === 0) return 0
    return Math.round((parcial / total) * 100)
  }

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Campañas de Comunicación</h1>
            <p className="text-gray-600 mt-1">
              Gestiona tus campañas masivas de SMS, WhatsApp y Email
            </p>
          </div>
          <button
            onClick={() => navigate('/comunicacion/campanas/nuevo')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Campaña</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <p className="text-sm text-gray-600">Total Campañas</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">{campanas.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600">Programadas</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {campanas.filter(c => c.estado === 'programada').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <Send className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-gray-600">En Proceso</p>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {campanas.filter(c => c.estado === 'en_proceso').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">Completadas</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {campanas.filter(c => c.estado === 'completada').length}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFiltroEstado('')}
              className={`px-4 py-2 rounded-lg ${!filtroEstado ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltroEstado('borrador')}
              className={`px-4 py-2 rounded-lg ${filtroEstado === 'borrador' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Borradores
            </button>
            <button
              onClick={() => setFiltroEstado('programada')}
              className={`px-4 py-2 rounded-lg ${filtroEstado === 'programada' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Programadas
            </button>
            <button
              onClick={() => setFiltroEstado('en_proceso')}
              className={`px-4 py-2 rounded-lg ${filtroEstado === 'en_proceso' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              En Proceso
            </button>
            <button
              onClick={() => setFiltroEstado('completada')}
              className={`px-4 py-2 rounded-lg ${filtroEstado === 'completada' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Completadas
            </button>
          </div>
        </div>

        {/* Campañas Grid */}
        {campanas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay campañas creadas
            </h3>
            <p className="text-gray-600 mb-6">
              Crea tu primera campaña para comenzar a comunicarte con tus votantes
            </p>
            <button
              onClick={() => navigate('/comunicacion/campanas/nuevo')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              <span>Crear Primera Campaña</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {campanas.map((campana) => (
              <div
                key={campana.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {campana.nombre}
                      </h3>
                    </div>
                    {campana.descripcion && (
                      <p className="text-sm text-gray-600 mb-2">{campana.descripcion}</p>
                    )}
                    <div className="flex items-center gap-2">
                      {getEstadoBadge(campana.estado)}
                      {getCanalBadge(campana.canal)}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/comunicacion/campanas/${campana.id}`)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Eye className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4 text-sm">
                  {campana.template && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MessageSquare className="w-4 h-4" />
                      <span>Plantilla: {campana.template.nombre}</span>
                    </div>
                  )}
                  {campana.segmento && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>Segmento: {campana.segmento.nombre} ({campana.segmento.total_votantes} votantes)</span>
                    </div>
                  )}
                  {campana.fecha_programada && campana.estado === 'programada' && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Programada para: {formatDate(campana.fecha_programada)}</span>
                    </div>
                  )}
                </div>

                {/* Estadísticas */}
                {(campana.estado === 'en_proceso' || campana.estado === 'completada') && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-600">Destinatarios</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {campana.total_destinatarios || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Enviados</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {campana.enviados || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Entregados</p>
                        <p className="text-lg font-semibold text-green-600">
                          {campana.entregados || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Fallidos</p>
                        <p className="text-lg font-semibold text-red-600">
                          {campana.fallidos || 0}
                        </p>
                      </div>
                    </div>

                    {/* Barra de Progreso */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Tasa de Entrega</span>
                        <span>{calcularTasa(campana.entregados || 0, campana.total_destinatarios || 0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${calcularTasa(campana.entregados || 0, campana.total_destinatarios || 0)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Fechas */}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    {campana.fecha_inicio && (
                      <div>
                        <p className="font-medium">Inicio:</p>
                        <p>{formatDate(campana.fecha_inicio)}</p>
                      </div>
                    )}
                    {campana.fecha_fin && (
                      <div>
                        <p className="font-medium">Fin:</p>
                        <p>{formatDate(campana.fecha_fin)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
