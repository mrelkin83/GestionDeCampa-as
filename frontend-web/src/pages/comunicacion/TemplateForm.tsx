import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, X, Loader, Plus } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { templatesAPI } from '@/lib/api'
import { Template } from '@/types/comunicacion'

const VARIABLES_DISPONIBLES = [
  { nombre: 'nombre', descripcion: 'Nombre del votante' },
  { nombre: 'apellido', descripcion: 'Apellido del votante' },
  { nombre: 'cedula', descripcion: 'Número de cédula' },
  { nombre: 'celular', descripcion: 'Número de celular' },
  { nombre: 'email', descripcion: 'Correo electrónico' },
  { nombre: 'departamento', descripcion: 'Nombre del departamento' },
  { nombre: 'municipio', descripcion: 'Nombre del municipio' },
  { nombre: 'barrio', descripcion: 'Barrio' },
  { nombre: 'puesto_votacion', descripcion: 'Puesto de votación' },
]

export default function TemplateForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const contenidoRef = useRef<HTMLTextAreaElement>(null)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<Partial<Template>>({
    nombre: '',
    descripcion: '',
    canal: 'whatsapp',
    asunto: '',
    contenido: '',
    variables: [],
    activo: true,
  })

  useEffect(() => {
    if (isEdit) {
      loadTemplate()
    }
  }, [id])

  // Extraer variables del contenido automáticamente
  useEffect(() => {
    const regex = /\{(\w+)\}/g
    const matches = formData.contenido?.match(regex) || []
    const variables = matches.map(m => m.replace(/[{}]/g, ''))
    const uniqueVariables = Array.from(new Set(variables))

    if (JSON.stringify(uniqueVariables) !== JSON.stringify(formData.variables)) {
      setFormData(prev => ({ ...prev, variables: uniqueVariables }))
    }
  }, [formData.contenido])

  const loadTemplate = async () => {
    try {
      setLoading(true)
      const response = await templatesAPI.getById(Number(id))
      setFormData(response.data)
    } catch (error) {
      console.error('Error cargando template:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const insertarVariable = (variable: string) => {
    const textarea = contenidoRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formData.contenido || ''
    const before = text.substring(0, start)
    const after = text.substring(end)
    const newText = `${before}{${variable}}${after}`

    setFormData(prev => ({ ...prev, contenido: newText }))

    // Restaurar foco y posición del cursor
    setTimeout(() => {
      textarea.focus()
      const newPos = start + variable.length + 2
      textarea.setSelectionRange(newPos, newPos)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (isEdit) {
        await templatesAPI.update(Number(id), formData)
      } else {
        await templatesAPI.create(formData)
      }
      navigate('/comunicacion/templates')
    } catch (error: any) {
      console.error('Error guardando template:', error)
      alert(error.response?.data?.message || 'Error al guardar plantilla')
    } finally {
      setSaving(false)
    }
  }

  const renderPreview = () => {
    let preview = formData.contenido || ''

    // Resaltar variables en la vista previa
    const regex = /\{(\w+)\}/g
    preview = preview.replace(regex, '<span class="bg-yellow-100 text-yellow-800 px-1 rounded font-medium">{$1}</span>')

    return { __html: preview.replace(/\n/g, '<br/>') }
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Editar Plantilla' : 'Nueva Plantilla'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit ? 'Modifica la plantilla de mensaje' : 'Crea una plantilla para tus campañas de comunicación'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario - 2/3 del ancho */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Básica */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Información Básica
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Plantilla *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: Invitación a Reunión"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    name="descripcion"
                    value={formData.descripcion || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe el propósito de esta plantilla"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Canal de Envío *
                    </label>
                    <select
                      name="canal"
                      value={formData.canal}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="sms">SMS</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">Email</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="activo"
                        checked={formData.activo}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Plantilla activa
                      </span>
                    </label>
                  </div>
                </div>

                {formData.canal === 'email' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Asunto del Email
                    </label>
                    <input
                      type="text"
                      name="asunto"
                      value={formData.asunto || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Asunto del correo"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Contenido */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contenido del Mensaje
              </h2>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insertar Variables
                </label>
                <div className="flex flex-wrap gap-2">
                  {VARIABLES_DISPONIBLES.map((variable) => (
                    <button
                      key={variable.nombre}
                      type="button"
                      onClick={() => insertarVariable(variable.nombre)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      title={variable.descripcion}
                    >
                      <Plus className="w-3 h-3" />
                      <span>{`{${variable.nombre}}`}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Haz clic en una variable para insertarla en el contenido del mensaje
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje *
                </label>
                <textarea
                  ref={contenidoRef}
                  name="contenido"
                  value={formData.contenido || ''}
                  onChange={handleChange}
                  required
                  rows={formData.canal === 'email' ? 12 : 8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                  placeholder={`Escribe tu mensaje aquí. Usa {nombre}, {apellido}, etc. para personalizar.\n\nEjemplo:\nHola {nombre}, te invitamos a la reunión el próximo sábado en {municipio}.`}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Caracteres: {formData.contenido?.length || 0}
                  {formData.canal === 'sms' && formData.contenido && formData.contenido.length > 160 && (
                    <span className="text-orange-600 ml-2">
                      (Puede requerir múltiples SMS)
                    </span>
                  )}
                </p>
              </div>

              {formData.variables && formData.variables.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Variables detectadas:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.variables.map((variable, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium"
                      >
                        {`{${variable}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Vista Previa - 1/3 del ancho */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Vista Previa
              </h2>

              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-64">
                {formData.canal === 'email' && formData.asunto && (
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Asunto:</p>
                    <p className="font-medium text-gray-900">{formData.asunto}</p>
                  </div>
                )}

                <div
                  className="text-sm text-gray-700 whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={renderPreview()}
                />

                {!formData.contenido && (
                  <p className="text-gray-400 text-sm italic">
                    La vista previa del mensaje aparecerá aquí...
                  </p>
                )}
              </div>

              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-800">
                  Las variables resaltadas en amarillo serán reemplazadas con los datos reales de cada votante al enviar.
                </p>
              </div>
            </div>
          </div>

          {/* Actions - Full width */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/comunicacion/templates')}
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
                      <span>{isEdit ? 'Actualizar' : 'Crear Plantilla'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
