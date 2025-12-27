import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  User,
  Loader
} from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import Badge from '@/components/ui/Badge'
import { votantesAPI } from '@/lib/api'
import { Votante } from '@/types/votante'

export default function VotanteDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [votante, setVotante] = useState<Votante | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadVotante()
    }
  }, [id])

  const loadVotante = async () => {
    try {
      setLoading(true)
      const response = await votantesAPI.getById(Number(id))
      setVotante(response.data)
    } catch (error) {
      console.error('Error cargando votante:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este votante?')) return

    try {
      await votantesAPI.delete(Number(id))
      navigate('/votantes')
    } catch (error) {
      console.error('Error eliminando votante:', error)
      alert('Error al eliminar votante')
    }
  }

  const getScoringColor = (scoring?: number) => {
    if (!scoring) return 'text-gray-600'
    if (scoring >= 80) return 'text-green-600'
    if (scoring >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getIntencionVotoBadge = (intencion?: string) => {
    const labels = {
      favorable: { text: 'Favorable', variant: 'success' as const },
      indeciso: { text: 'Indeciso', variant: 'warning' as const },
      desfavorable: { text: 'Desfavorable', variant: 'danger' as const },
      no_definido: { text: 'No definido', variant: 'default' as const },
    }
    const config = labels[intencion as keyof typeof labels] || labels.no_definido
    return <Badge variant={config.variant}>{config.text}</Badge>
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

  if (!votante) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Votante no encontrado</p>
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
              onClick={() => navigate('/votantes')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {votante.nombre} {votante.apellido}
              </h1>
              <p className="text-gray-600 mt-1">CC: {votante.cedula}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/votantes/${id}/editar`)}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Personal */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Información Personal
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nombre Completo</p>
                  <p className="font-medium">{votante.nombre} {votante.apellido}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cédula</p>
                  <p className="font-medium">{votante.cedula}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Género</p>
                  <p className="font-medium">
                    {votante.genero === 'M' ? 'Masculino' : votante.genero === 'F' ? 'Femenino' : 'Otro'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Edad</p>
                  <p className="font-medium">{votante.edad || 'N/A'} años</p>
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Información de Contacto
              </h2>
              <div className="space-y-3">
                {votante.celular && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Celular</p>
                      <p className="font-medium">{votante.celular}</p>
                    </div>
                  </div>
                )}
                {votante.telefono && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Teléfono</p>
                      <p className="font-medium">{votante.telefono}</p>
                    </div>
                  </div>
                )}
                {votante.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{votante.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ubicación */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Ubicación
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Departamento</p>
                  <p className="font-medium">{votante.departamento?.nombre || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Municipio</p>
                  <p className="font-medium">{votante.municipio?.nombre || 'N/A'}</p>
                </div>
                {votante.direccion && (
                  <div>
                    <p className="text-sm text-gray-600">Dirección</p>
                    <p className="font-medium">{votante.direccion}</p>
                  </div>
                )}
                {votante.barrio && (
                  <div>
                    <p className="text-sm text-gray-600">Barrio</p>
                    <p className="font-medium">{votante.barrio}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Historial de Contactos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Historial de Contactos
              </h2>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No hay contactos registrados</p>
                <button className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                  Registrar Contacto
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Scoring */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Scoring</h3>
              <div className="text-center">
                <div className={`text-5xl font-bold ${getScoringColor(votante.scoring)}`}>
                  {votante.scoring || 0}
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all"
                      style={{ width: `${votante.scoring || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Intención de Voto */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Intención de Voto</h3>
              <div className="text-center">
                {getIntencionVotoBadge(votante.intencion_voto)}
              </div>
            </div>

            {/* Nivel de Compromiso */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Nivel de Compromiso</h3>
              <div className="text-center">
                <Badge variant={
                  votante.nivel_compromiso === 'alto' ? 'success' :
                  votante.nivel_compromiso === 'medio' ? 'warning' : 'default'
                }>
                  {votante.nivel_compromiso?.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-4">Estadísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Contactos</span>
                  <span className="font-medium">{votante.total_contactos || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Última Interacción</span>
                  <span className="font-medium text-sm">
                    {votante.ultima_interaccion || 'Nunca'}
                  </span>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            {votante.observaciones && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-3">Observaciones</h3>
                <p className="text-sm text-gray-700">{votante.observaciones}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
