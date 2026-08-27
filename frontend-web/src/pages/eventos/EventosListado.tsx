import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Calendar as CalendarIcon, MapPin, Users, Clock } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import Badge from '@/components/ui/Badge'
import { eventosAPI } from '@/lib/api'
import { Evento } from '@/types/evento'
import { useActiveCampana } from '@/hooks/useActiveCampana'

export default function EventosListado() {
  const navigate = useNavigate()
  const { campanaId } = useActiveCampana()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState<string>('')

  useEffect(() => {
    if (campanaId) {
      fetchEventos()
    }
  }, [filtroTipo, campanaId])

  const fetchEventos = async () => {
    try {
      setLoading(true)
      const response = await eventosAPI.getAll({
        campana_id: campanaId,
        tipo: filtroTipo || undefined
      })
      setEventos(response.data || [])
    } catch (error) {
      console.error('Error al cargar eventos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTipoBadge = (tipo: string) => {
    const badges = {
      reunion: { text: 'Reunión', variant: 'info' as const },
      mitin: { text: 'Mitin', variant: 'success' as const },
      puerta_puerta: { text: 'Puerta a Puerta', variant: 'warning' as const },
      capacitacion: { text: 'Capacitación', variant: 'default' as const },
      movilizacion: { text: 'Movilización', variant: 'info' as const },
      otro: { text: 'Otro', variant: 'default' as const },
    }
    const config = badges[tipo as keyof typeof badges] || badges.otro
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const getEstadoBadge = (estado: string) => {
    const badges = {
      planificado: { text: 'Planificado', variant: 'info' as const },
      en_curso: { text: 'En Curso', variant: 'success' as const },
      finalizado: { text: 'Finalizado', variant: 'default' as const },
      cancelado: { text: 'Cancelado', variant: 'danger' as const },
    }
    const config = badges[estado as keyof typeof badges] || badges.planificado
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const eventosPorFecha = eventos.reduce((acc, evento) => {
    const fecha = new Date(evento.fecha_inicio).toLocaleDateString()
    if (!acc[fecha]) acc[fecha] = []
    acc[fecha].push(evento)
    return acc
  }, {} as Record<string, Evento[]>)

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
            <h1 className="text-3xl font-bold text-gray-900">Eventos</h1>
            <p className="text-gray-600 mt-1">
              Organiza y gestiona tus eventos de campaña
            </p>
          </div>
          <button
            onClick={() => navigate('/eventos/nuevo')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Evento</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Eventos</p>
            <p className="text-2xl font-bold text-gray-900">{eventos.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Próximos</p>
            <p className="text-2xl font-bold text-blue-600">
              {eventos.filter(e => e.estado === 'planificado').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">En Curso</p>
            <p className="text-2xl font-bold text-green-600">
              {eventos.filter(e => e.estado === 'en_curso').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Asistentes</p>
            <p className="text-2xl font-bold text-purple-600">
              {eventos.reduce((sum, e) => sum + (e.total_asistentes || 0), 0)}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFiltroTipo('')}
              className={`px-4 py-2 rounded-lg ${!filtroTipo ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroTipo('reunion')}
              className={`px-4 py-2 rounded-lg ${filtroTipo === 'reunion' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Reuniones
            </button>
            <button
              onClick={() => setFiltroTipo('mitin')}
              className={`px-4 py-2 rounded-lg ${filtroTipo === 'mitin' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Mítines
            </button>
            <button
              onClick={() => setFiltroTipo('puerta_puerta')}
              className={`px-4 py-2 rounded-lg ${filtroTipo === 'puerta_puerta' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Puerta a Puerta
            </button>
            <button
              onClick={() => setFiltroTipo('capacitacion')}
              className={`px-4 py-2 rounded-lg ${filtroTipo === 'capacitacion' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Capacitaciones
            </button>
          </div>
        </div>

        {/* Eventos Timeline */}
        {eventos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay eventos creados
            </h3>
            <p className="text-gray-600 mb-6">
              Crea tu primer evento para comenzar a organizar tu campaña
            </p>
            <button
              onClick={() => navigate('/eventos/nuevo')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              <span>Crear Primer Evento</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(eventosPorFecha).map(([fecha, eventosDelDia]) => (
              <div key={fecha}>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">{fecha}</h2>
                <div className="space-y-3">
                  {eventosDelDia.map((evento) => (
                    <div
                      key={evento.id}
                      onClick={() => navigate(`/eventos/${evento.id}`)}
                      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-6"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {evento.nombre}
                            </h3>
                            {getTipoBadge(evento.tipo)}
                            {getEstadoBadge(evento.estado)}
                          </div>

                          {evento.descripcion && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {evento.descripcion}
                            </p>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{formatDate(evento.fecha_inicio)}</span>
                            </div>
                            {evento.ubicacion_nombre && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{evento.ubicacion_nombre}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>
                                {evento.total_confirmados || 0} confirmados
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>
                                {evento.total_asistentes || 0} asistieron
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
