import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Mail, MessageSquare, Smartphone, Edit, Trash2, Eye } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import Badge from '@/components/ui/Badge'
import { templatesAPI } from '@/lib/api'
import { Template } from '@/types/comunicacion'
import { useActiveCampana } from '@/hooks/useActiveCampana'

export default function TemplatesListado() {
  const navigate = useNavigate()
  const { campanaId } = useActiveCampana()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroCanal, setFiltroCanal] = useState<string>('')

  useEffect(() => {
    if (campanaId) {
      fetchTemplates()
    }
  }, [filtroCanal, campanaId])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await templatesAPI.getAll({
        campana_id: campanaId,
        canal: filtroCanal || undefined
      })
      setTemplates(response.data || [])
    } catch (error) {
      console.error('Error al cargar templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar la plantilla "${nombre}"?`)) return

    try {
      await templatesAPI.delete(id)
      fetchTemplates()
    } catch (error) {
      console.error('Error eliminando template:', error)
      alert('Error al eliminar plantilla')
    }
  }

  const getCanalIcon = (canal: string) => {
    switch (canal) {
      case 'sms':
        return <Smartphone className="w-5 h-5" />
      case 'whatsapp':
        return <MessageSquare className="w-5 h-5" />
      case 'email':
        return <Mail className="w-5 h-5" />
      default:
        return <MessageSquare className="w-5 h-5" />
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
            <h1 className="text-3xl font-bold text-gray-900">Plantillas de Mensajes</h1>
            <p className="text-gray-600 mt-1">
              Crea y gestiona plantillas para tus campañas de comunicación
            </p>
          </div>
          <button
            onClick={() => navigate('/comunicacion/templates/nuevo')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Plantilla</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Plantillas</p>
            <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">SMS</p>
            <p className="text-2xl font-bold text-blue-600">
              {templates.filter(t => t.canal === 'sms').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">WhatsApp</p>
            <p className="text-2xl font-bold text-green-600">
              {templates.filter(t => t.canal === 'whatsapp').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-2xl font-bold text-purple-600">
              {templates.filter(t => t.canal === 'email').length}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFiltroCanal('')}
              className={`px-4 py-2 rounded-lg ${!filtroCanal ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroCanal('sms')}
              className={`px-4 py-2 rounded-lg ${filtroCanal === 'sms' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              SMS
            </button>
            <button
              onClick={() => setFiltroCanal('whatsapp')}
              className={`px-4 py-2 rounded-lg ${filtroCanal === 'whatsapp' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              WhatsApp
            </button>
            <button
              onClick={() => setFiltroCanal('email')}
              className={`px-4 py-2 rounded-lg ${filtroCanal === 'email' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Email
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Mail className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay plantillas creadas
            </h3>
            <p className="text-gray-600 mb-6">
              Crea tu primera plantilla para comenzar a comunicarte con tus votantes
            </p>
            <button
              onClick={() => navigate('/comunicacion/templates/nuevo')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              <span>Crear Primera Plantilla</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getCanalIcon(template.canal)}
                    <h3 className="font-semibold text-gray-900">{template.nombre}</h3>
                  </div>
                  <div className="flex gap-1">
                    {getCanalBadge(template.canal)}
                    <Badge variant={template.activo ? 'success' : 'default'}>
                      {template.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>
                </div>

                {template.canal === 'email' && template.asunto && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500">Asunto:</p>
                    <p className="text-sm font-medium text-gray-700">{template.asunto}</p>
                  </div>
                )}

                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Contenido:</p>
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {template.contenido}
                  </p>
                </div>

                {template.variables_disponibles && template.variables_disponibles.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">Variables:</p>
                    <div className="flex flex-wrap gap-1">
                      {template.variables_disponibles.map((variable, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                        >
                          {`{${variable}}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => navigate(`/comunicacion/templates/${template.id}`)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver</span>
                  </button>
                  <button
                    onClick={() => navigate(`/comunicacion/templates/${template.id}/editar`)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(template.id, template.nombre)}
                    className="flex items-center justify-center px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
