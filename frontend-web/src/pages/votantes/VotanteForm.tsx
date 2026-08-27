import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, X, Loader } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { votantesAPI, departamentosAPI } from '@/lib/api'
import { Votante } from '@/types/votante'
import { useActiveCampana } from '@/hooks/useActiveCampana'

export default function VotanteForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const { campanaId } = useActiveCampana()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [departamentos, setDepartamentos] = useState<any[]>([])
  const [municipios, setMunicipios] = useState<any[]>([])

  const [formData, setFormData] = useState<Partial<Votante>>({
    documento: '',
    tipo_documento: 'CC',
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    fecha_nacimiento: '',
    genero: undefined,
    email: '',
    telefono: '',
    celular: '',
    direccion: '',
    barrio: '',
    departamento_id: undefined,
    municipio_id: undefined,
    scoring: 50,
    intencion_voto: 'sin_definir',
    observaciones: '',
  })

  useEffect(() => {
    loadDepartamentos()
    if (isEdit) {
      loadVotante()
    }
  }, [id])

  useEffect(() => {
    if (formData.departamento_id) {
      loadMunicipios(formData.departamento_id)
    }
  }, [formData.departamento_id])

  const loadDepartamentos = async () => {
    try {
      const response = await departamentosAPI.getAll()
      setDepartamentos(response.data || [])
    } catch (error) {
      console.error('Error cargando departamentos:', error)
    }
  }

  const loadMunicipios = async (departamentoId: number) => {
    try {
      const response = await departamentosAPI.getMunicipios(departamentoId)
      setMunicipios(response.data || [])
    } catch (error) {
      console.error('Error cargando municipios:', error)
    }
  }

  const loadVotante = async () => {
    try {
      setLoading(true)
      const response = await votantesAPI.getById(Number(id))
      setFormData(response.data)
    } catch (error) {
      console.error('Error cargando votante:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (isEdit) {
        // El backend solo permite editar celular/email/intencion_voto/
        // probabilidad_voto/scoring/observaciones una vez creado el votante
        // -el resto de datos de identidad son inmutables tras el registro.
        const { celular, email, intencion_voto, scoring, observaciones } = formData
        await votantesAPI.update(Number(id), { celular, email, intencion_voto, scoring, observaciones })
      } else {
        await votantesAPI.create({ ...formData, campana_id: campanaId })
      }
      navigate('/votantes')
    } catch (error: any) {
      console.error('Error guardando votante:', error)
      alert(error.response?.data?.message || 'Error al guardar votante')
    } finally {
      setSaving(false)
    }
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

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Editar Votante' : 'Nuevo Votante'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit
              ? 'Solo se pueden actualizar los datos de contacto y seguimiento'
              : 'Completa la información del votante'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
          <div className="p-6 space-y-6">
            {/* Información Personal */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Información Personal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Documento *
                  </label>
                  <select
                    name="tipo_documento"
                    value={formData.tipo_documento}
                    onChange={handleChange}
                    required
                    disabled={isEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="PAS">Pasaporte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Documento *
                  </label>
                  <input
                    type="text"
                    name="documento"
                    value={formData.documento}
                    onChange={handleChange}
                    required
                    disabled={isEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                    placeholder="1234567890"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primer Nombre *
                  </label>
                  <input
                    type="text"
                    name="primer_nombre"
                    value={formData.primer_nombre}
                    onChange={handleChange}
                    required
                    disabled={isEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Segundo Nombre
                  </label>
                  <input
                    type="text"
                    name="segundo_nombre"
                    value={formData.segundo_nombre || ''}
                    onChange={handleChange}
                    disabled={isEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primer Apellido *
                  </label>
                  <input
                    type="text"
                    name="primer_apellido"
                    value={formData.primer_apellido}
                    onChange={handleChange}
                    required
                    disabled={isEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Segundo Apellido
                  </label>
                  <input
                    type="text"
                    name="segundo_apellido"
                    value={formData.segundo_apellido || ''}
                    onChange={handleChange}
                    disabled={isEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Género
                  </label>
                  <select
                    name="genero"
                    value={formData.genero || ''}
                    onChange={handleChange}
                    disabled={isEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="O">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento || ''}
                    onChange={handleChange}
                    disabled={isEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Contacto */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Información de Contacto
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Celular
                  </label>
                  <input
                    type="tel"
                    name="celular"
                    value={formData.celular || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+57 300 123 4567"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Ubicación
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departamento
                  </label>
                  <select
                    name="departamento_id"
                    value={formData.departamento_id || ''}
                    onChange={handleChange}
                    disabled={isEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Seleccionar...</option>
                    {departamentos.map(dep => (
                      <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Municipio
                  </label>
                  <select
                    name="municipio_id"
                    value={formData.municipio_id || ''}
                    onChange={handleChange}
                    disabled={isEdit || !formData.departamento_id}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">Seleccionar...</option>
                    {municipios.map(mun => (
                      <option key={mun.id} value={mun.id}>{mun.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion || ''}
                    onChange={handleChange}
                    disabled={isEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Barrio
                  </label>
                  <input
                    type="text"
                    name="barrio"
                    value={formData.barrio || ''}
                    onChange={handleChange}
                    disabled={isEdit}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Scoring y Segmentación */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Scoring y Segmentación
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scoring (0-100)
                  </label>
                  <input
                    type="number"
                    name="scoring"
                    min="0"
                    max="100"
                    value={formData.scoring ?? 50}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intención de Voto
                  </label>
                  <select
                    name="intencion_voto"
                    value={formData.intencion_voto || 'sin_definir'}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="sin_definir">Sin definir</option>
                    <option value="a_favor">A favor</option>
                    <option value="indeciso">Indeciso</option>
                    <option value="en_contra">En contra</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                name="observaciones"
                value={formData.observaciones || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Notas adicionales sobre el votante..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-lg">
            <button
              type="button"
              onClick={() => navigate('/votantes')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
              <span>Cancelar</span>
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>{isEdit ? 'Actualizar' : 'Guardar'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
