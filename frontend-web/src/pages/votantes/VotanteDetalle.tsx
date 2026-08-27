import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
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
import { Votante, Contacto } from '@/types/votante'

const TIPO_LABELS: Record<Contacto['tipo'], string> = {
  llamada: 'Llamada',
  visita: 'Visita',
  sms: 'SMS',
  email: 'Email',
  whatsapp: 'WhatsApp',
  evento: 'Evento',
}

const RESULTADO_LABELS: Record<Contacto['resultado'], string> = {
  exitoso: 'Exitoso',
  sin_respuesta: 'Sin respuesta',
  rechazado: 'Rechazado',
  pendiente: 'Pendiente',
}

export default function VotanteDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [votante, setVotante] = useState<Votante | null>(null)
  const [contactos, setContactos] = useState<Contacto[]>([])
  const [loading, setLoading] = useState(true)
  const [showContactoForm, setShowContactoForm] = useState(false)
  const [savingContacto, setSavingContacto] = useState(false)
  const [contactoForm, setContactoForm] = useState({
    tipo: 'llamada' as Contacto['tipo'],
    resultado: 'exitoso' as Contacto['resultado'],
    notas: '',
    intencion_voto_despues: '',
  })

  useEffect(() => {
    if (id) {
      loadVotante()
      loadContactos()
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

  const loadContactos = async () => {
    try {
      const response = await votantesAPI.getContactos(Number(id))
      setContactos(response.data || [])
    } catch (error) {
      console.error('Error cargando contactos:', error)
    }
  }

  const handleRegistrarContacto = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingContacto(true)
    try {
      await votantesAPI.registrarContacto(Number(id), {
        tipo: contactoForm.tipo,
        resultado: contactoForm.resultado,
        notas: contactoForm.notas || undefined,
        intencion_voto_despues: contactoForm.intencion_voto_despues || undefined,
      })
      setShowContactoForm(false)
      setContactoForm({ tipo: 'llamada', resultado: 'exitoso', notas: '', intencion_voto_despues: '' })
      await Promise.all([loadVotante(), loadContactos()])
    } catch (error: any) {
      console.error('Error registrando contacto:', error)
      alert(error.response?.data?.message || 'Error al registrar contacto')
    } finally {
      setSavingContacto(false)
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
      a_favor: { text: 'A favor', variant: 'success' as const },
      indeciso: { text: 'Indeciso', variant: 'warning' as const },
      en_contra: { text: 'En contra', variant: 'danger' as const },
      sin_definir: { text: 'Sin definir', variant: 'default' as const },
    }
    const config = labels[intencion as keyof typeof labels] || labels.sin_definir
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
                {votante.primer_nombre} {votante.primer_apellido}
              </h1>
              <p className="text-gray-600 mt-1">CC: {votante.documento}</p>
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
                  <p className="font-medium">{votante.primer_nombre} {votante.primer_apellido}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cédula</p>
                  <p className="font-medium">{votante.documento}</p>
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Historial de Contactos
                </h2>
                <button
                  onClick={() => setShowContactoForm(true)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
                >
                  Registrar Contacto
                </button>
              </div>

              {contactos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay contactos registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contactos.map((contacto) => (
                    <div key={contacto.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">{TIPO_LABELS[contacto.tipo]}</Badge>
                          <span className="text-sm font-medium text-gray-900">
                            {RESULTADO_LABELS[contacto.resultado]}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(contacto.created_at).toLocaleString('es-CO')}
                        </span>
                      </div>
                      {contacto.notas && (
                        <p className="text-sm text-gray-600 mt-1">{contacto.notas}</p>
                      )}
                      {contacto.user && (
                        <p className="text-xs text-gray-400 mt-1">
                          Registrado por {contacto.user.first_name} {contacto.user.last_name}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
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

            {/* Estadísticas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-4">Estadísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Contactos</span>
                  <span className="font-medium">{votante.numero_contactos || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Último Contacto</span>
                  <span className="font-medium text-sm">
                    {votante.ultimo_contacto || 'Nunca'}
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

      {/* Modal: Registrar Contacto */}
      {showContactoForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Registrar Contacto</h2>
            <form onSubmit={handleRegistrarContacto} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                <select
                  value={contactoForm.tipo}
                  onChange={(e) => setContactoForm({ ...contactoForm, tipo: e.target.value as Contacto['tipo'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {Object.entries(TIPO_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resultado *</label>
                <select
                  value={contactoForm.resultado}
                  onChange={(e) => setContactoForm({ ...contactoForm, resultado: e.target.value as Contacto['resultado'] })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {Object.entries(RESULTADO_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intención de voto actualizada
                </label>
                <select
                  value={contactoForm.intencion_voto_despues}
                  onChange={(e) => setContactoForm({ ...contactoForm, intencion_voto_despues: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Sin cambio</option>
                  <option value="a_favor">A favor</option>
                  <option value="en_contra">En contra</option>
                  <option value="indeciso">Indeciso</option>
                  <option value="sin_definir">Sin definir</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                <textarea
                  value={contactoForm.notas}
                  onChange={(e) => setContactoForm({ ...contactoForm, notas: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="Detalles de la conversación..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowContactoForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingContacto}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {savingContacto ? 'Guardando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
