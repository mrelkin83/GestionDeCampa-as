import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Clock,
  Users,
  QrCode,
  UserCheck,
  Calendar as CalendarIcon
} from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import Badge from '@/components/ui/Badge'
import Table from '@/components/ui/Table'
import { eventosAPI } from '@/lib/api'
import { Evento, EventoAsistencia } from '@/types/evento'

export default function EventoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [evento, setEvento] = useState<Evento | null>(null)
  const [asistencias, setAsistencias] = useState<EventoAsistencia[]>([])
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    if (id) {
      loadEvento()
    }
  }, [id])

  const loadEvento = async () => {
    try {
      setLoading(true)
      const response = await eventosAPI.getById(Number(id))
      setEvento(response.data)
      // TODO: Cargar asistencias desde API
      setAsistencias([])
    } catch (error) {
      console.error('Error cargando evento:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este evento?')) return

    try {
      await eventosAPI.delete(Number(id))
      navigate('/eventos')
    } catch (error) {
      console.error('Error eliminando evento:', error)
      alert('Error al eliminar evento')
    }
  }

  const getTipoBadge = (tipo: string) => {
    const badges = {
      reunion: { text: 'Reunión', variant: 'info' as const },
      mitin: { text: 'Mitin', variant: 'success' as const },
      puerta_puerta: { text: 'Puerta a Puerta', variant: 'warning' as const },
      capacitacion: { text: 'Capacitación', variant: 'default' as const },
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const columns = [
    {
      header: 'Votante',
      accessor: (row: EventoAsistencia) => row.votante
        ? `${row.votante.nombre} ${row.votante.apellido}`
        : '-',
    },
    {
      header: 'Cédula',
      accessor: (row: EventoAsistencia) => row.votante?.cedula || '-',
    },
    {
      header: 'Teléfono',
      accessor: (row: EventoAsistencia) => row.votante?.celular || '-',
    },
    {
      header: 'Confirmado',
      accessor: (row: EventoAsistencia) => (
        <Badge variant={row.confirmado ? 'success' : 'default'}>
          {row.confirmado ? 'Sí' : 'No'}
        </Badge>
      ),
    },
    {
      header: 'Asistió',
      accessor: (row: EventoAsistencia) => (
        <Badge variant={row.asistio ? 'success' : 'default'}>
          {row.asistio ? 'Sí' : 'No'}
        </Badge>
      ),
    },
  ]

  if (loading || !evento) {
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/eventos')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {evento.nombre}
                </h1>
                {getTipoBadge(evento.tipo)}
                {getEstadoBadge(evento.estado)}
              </div>
              {evento.descripcion && (
                <p className="text-gray-600">{evento.descripcion}</p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowQR(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <QrCode className="w-5 h-5" />
              <span>Ver QR</span>
            </button>
            <button
              onClick={() => navigate(`/eventos/${id}/editar`)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Edit className="w-5 h-5" />
              <span>Editar</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-5 h-5" />
              <span>Eliminar</span>
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <CalendarIcon className="w-6 h-6 text-primary-600" />
              <p className="text-sm text-gray-600">Fecha de Inicio</p>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {formatDate(evento.fecha_inicio)}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-green-600" />
              <p className="text-sm text-gray-600">Confirmados</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {evento.total_confirmados || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <UserCheck className="w-6 h-6 text-blue-600" />
              <p className="text-sm text-gray-600">Asistieron</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {evento.total_asistentes || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-6 h-6 text-purple-600" />
              <p className="text-sm text-gray-600">Capacidad</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {evento.capacidad_maxima || '∞'}
            </p>
          </div>
        </div>

        {/* Detalles del Evento */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Detalles del Evento
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Duración</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(evento.fecha_inicio)} - {formatDate(evento.fecha_fin)}
                  </p>
                </div>
              </div>

              {evento.ubicacion && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Ubicación</p>
                    <p className="font-medium text-gray-900">{evento.ubicacion}</p>
                    {evento.direccion && (
                      <p className="text-sm text-gray-600">{evento.direccion}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Configuración
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Requiere Confirmación</p>
                <p className="font-medium text-gray-900">
                  {evento.requiere_confirmacion ? 'Sí' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Capacidad Máxima</p>
                <p className="font-medium text-gray-900">
                  {evento.capacidad_maxima || 'Sin límite'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Asistentes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Asistentes
            </h2>
          </div>

          <Table
            data={asistencias}
            columns={columns}
            loading={false}
            emptyMessage="No hay asistentes registrados para este evento"
          />
        </div>

        {/* Modal QR */}
        {showQR && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Código QR del Evento</h2>
                <button
                  onClick={() => setShowQR(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              </div>
              <div className="flex justify-center p-8 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <QrCode className="w-48 h-48 mx-auto text-gray-300 mb-4" />
                  <p className="text-sm text-gray-600">
                    Código QR para check-in de asistentes
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    ID del evento: {evento.id}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-gray-600">
                Los asistentes pueden escanear este código para registrar su asistencia
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
