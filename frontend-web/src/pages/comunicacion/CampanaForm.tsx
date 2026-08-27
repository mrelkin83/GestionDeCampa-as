import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, X, Loader, Clock, Users, MessageSquare } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import Badge from '@/components/ui/Badge'
import { campanasAPI, templatesAPI, segmentosAPI } from '@/lib/api'
import { Campana, Template } from '@/types/comunicacion'
import { Segmento } from '@/types/votante'
import { useActiveCampana } from '@/hooks/useActiveCampana'

export default function CampanaForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const { campanaId } = useActiveCampana()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [segmentos, setSegmentos] = useState<Segmento[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [selectedSegmento, setSelectedSegmento] = useState<Segmento | null>(null)

  const [formData, setFormData] = useState<Partial<Campana>>({
    nombre: '',
    template_id: undefined,
    segmento_id: undefined,
    canal: 'whatsapp',
    estado: 'borrador',
    fecha_programada: undefined,
  })

  const [programarEnvio, setProgramarEnvio] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (isEdit && id) {
      loadCampana()
    }
  }, [id])

  useEffect(() => {
    if (formData.template_id) {
      const template = templates.find(t => t.id === formData.template_id)
      setSelectedTemplate(template || null)
      if (template) {
        setFormData(prev => ({ ...prev, canal: template.canal }))
      }
    }
  }, [formData.template_id, templates])

  useEffect(() => {
    if (formData.segmento_id) {
      const segmento = segmentos.find(s => s.id === formData.segmento_id)
      setSelectedSegmento(segmento || null)
    }
  }, [formData.segmento_id, segmentos])

  const loadData = async () => {
    try {
      const [templatesRes, segmentosRes] = await Promise.all([
        templatesAPI.getAll({ campana_id: campanaId, activos: true }),
        segmentosAPI.getAll({ campana_id: campanaId })
      ])
      setTemplates(templatesRes.data || [])
      setSegmentos(segmentosRes.data || [])
    } catch (error) {
      console.error('Error cargando datos:', error)
    }
  }

  const loadCampana = async () => {
    try {
      setLoading(true)
      const response = await campanasAPI.getById(Number(id))
      setFormData(response.data)
      if (response.data.fecha_programada) {
        setProgramarEnvio(true)
      }
    } catch (error) {
      console.error('Error cargando campaña:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('_id') ? (value ? Number(value) : undefined) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // El backend no persiste 'descripcion' en storeCampana/updateCampana
      // (no está en sus reglas de validación ni en el create() explícito) -
      // se omite en vez de simular que se guarda.
      const dataToSend = {
        campana_id: campanaId,
        nombre: formData.nombre,
        canal: formData.canal,
        template_id: formData.template_id,
        segmento_id: formData.segmento_id,
        fecha_envio_programada: programarEnvio ? formData.fecha_programada : undefined,
      }

      if (isEdit) {
        await campanasAPI.update(Number(id), dataToSend)
      } else {
        await campanasAPI.create(dataToSend)
      }
      navigate('/comunicacion/campanas')
    } catch (error: any) {
      console.error('Error guardando campaña:', error)
      alert(error.response?.data?.message || 'Error al guardar campaña')
    } finally {
      setSaving(false)
    }
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
            {isEdit ? 'Editar Campaña' : 'Nueva Campaña'}
          </h1>
          <p className="text-gray-600 mt-1">
            Configura tu campaña de comunicación masiva
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información Básica
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la Campaña *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ej: Invitación Reunión Marzo 2026"
                />
              </div>

            </div>
          </div>

          {/* Configuración */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Configuración
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plantilla de Mensaje *
                </label>
                <select
                  name="template_id"
                  value={formData.template_id || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Selecciona una plantilla</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.nombre} ({template.canal.toUpperCase()})
                    </option>
                  ))}
                </select>
                {templates.length === 0 && (
                  <p className="text-sm text-orange-600 mt-1">
                    No hay plantillas activas. <a href="/comunicacion/templates/nuevo" className="underline">Crear plantilla</a>
                  </p>
                )}
              </div>

              {selectedTemplate && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Vista Previa de la Plantilla</p>
                    {getCanalBadge(selectedTemplate.canal)}
                  </div>
                  {selectedTemplate.canal === 'email' && selectedTemplate.asunto && (
                    <div className="mb-2">
                      <p className="text-xs text-gray-600">Asunto:</p>
                      <p className="text-sm font-medium text-gray-900">{selectedTemplate.asunto}</p>
                    </div>
                  )}
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedTemplate.contenido}
                  </p>
                  {selectedTemplate.variables_disponibles && selectedTemplate.variables_disponibles.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Variables utilizadas:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedTemplate.variables_disponibles.map((variable, idx) => (
                          <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                            {`{${variable}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Segmento de Destinatarios *
                </label>
                <select
                  name="segmento_id"
                  value={formData.segmento_id || ''}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Selecciona un segmento</option>
                  {segmentos.map(segmento => (
                    <option key={segmento.id} value={segmento.id}>
                      {segmento.nombre} ({segmento.total_votantes || 0} votantes)
                    </option>
                  ))}
                </select>
                {segmentos.length === 0 && (
                  <p className="text-sm text-orange-600 mt-1">
                    No hay segmentos creados. <a href="/segmentos/nuevo" className="underline">Crear segmento</a>
                  </p>
                )}
              </div>

              {selectedSegmento && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <p className="text-sm font-medium text-blue-900">
                      {selectedSegmento.nombre}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-blue-700">Total Destinatarios:</p>
                      <p className="text-lg font-semibold text-blue-900">
                        {selectedSegmento.total_votantes || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-700">Tipo:</p>
                      <p className="text-blue-900 capitalize">{selectedSegmento.tipo}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Programación */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Programación de Envío
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={!programarEnvio}
                    onChange={() => setProgramarEnvio(false)}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Guardar como borrador
                  </span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={programarEnvio}
                    onChange={() => setProgramarEnvio(true)}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Programar envío
                  </span>
                </label>
              </div>

              {programarEnvio && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha y Hora de Envío *
                  </label>
                  <input
                    type="datetime-local"
                    name="fecha_programada"
                    value={formData.fecha_programada || ''}
                    onChange={handleChange}
                    required={programarEnvio}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    La campaña se enviará automáticamente en la fecha y hora programada
                  </p>
                </div>
              )}

              {!programarEnvio && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    La campaña se guardará como borrador. Podrás enviarla o programarla más tarde desde el detalle de la campaña.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Resumen */}
          {selectedTemplate && selectedSegmento && (
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-primary-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Resumen de la Campaña
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-primary-700 mb-1">Canal:</p>
                  <div className="flex items-center gap-2">
                    {getCanalBadge(selectedTemplate.canal)}
                  </div>
                </div>
                <div>
                  <p className="text-primary-700 mb-1">Destinatarios:</p>
                  <p className="text-lg font-semibold text-primary-900">
                    {selectedSegmento.total_votantes || 0} votantes
                  </p>
                </div>
                <div>
                  <p className="text-primary-700 mb-1">Plantilla:</p>
                  <p className="font-medium text-primary-900">{selectedTemplate.nombre}</p>
                </div>
                <div>
                  <p className="text-primary-700 mb-1">Segmento:</p>
                  <p className="font-medium text-primary-900">{selectedSegmento.nombre}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/comunicacion/campanas')}
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
                    {programarEnvio ? (
                      <>
                        <Clock className="w-5 h-5" />
                        <span>Programar Campaña</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>{isEdit ? 'Actualizar' : 'Guardar Borrador'}</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
