import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  Download,
  Trash2,
  Plus,
  Loader,
  CheckCircle,
  XCircle
} from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import Badge from '@/components/ui/Badge'
import Table from '@/components/ui/Table'
import { reportesAPI } from '@/lib/api'
import { ReporteExportable, ConfiguracionReporte } from '@/types/analytics'

export default function ReportesExportables() {
  const navigate = useNavigate()
  const [reportes, setReportes] = useState<ReporteExportable[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [generando, setGenerando] = useState(false)

  const [formData, setFormData] = useState<ConfiguracionReporte>({
    tipo: 'general',
    nombre: '',
    descripcion: '',
    formato: 'pdf',
    filtros: {},
    incluir_graficos: true,
    incluir_tablas_detalle: true,
    incluir_comparativas: true
  })

  useEffect(() => {
    loadReportes()
  }, [])

  const loadReportes = async () => {
    try {
      setLoading(true)
      const response = await reportesAPI.getAll()
      setReportes(response.data || [])
    } catch (error) {
      console.error('Error cargando reportes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerar = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerando(true)

    try {
      await reportesAPI.generar(formData)
      setShowModal(false)
      loadReportes()
      // Reset form
      setFormData({
        tipo: 'general',
        nombre: '',
        descripcion: '',
        formato: 'pdf',
        filtros: {},
        incluir_graficos: true,
        incluir_tablas_detalle: true,
        incluir_comparativas: true
      })
    } catch (error: any) {
      console.error('Error generando reporte:', error)
      alert(error.response?.data?.message || 'Error al generar reporte')
    } finally {
      setGenerando(false)
    }
  }

  const handleDescargar = async (id: number) => {
    try {
      const blob = await reportesAPI.descargar(id)
      const reporte = reportes.find(r => r.id === id)
      const extension = reporte?.formato || 'pdf'

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `reporte-${id}.${extension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error descargando reporte:', error)
      alert('Error al descargar reporte')
    }
  }

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar este reporte?')) return

    try {
      await reportesAPI.eliminar(id)
      loadReportes()
    } catch (error) {
      console.error('Error eliminando reporte:', error)
      alert('Error al eliminar reporte')
    }
  }

  const getEstadoBadge = (estado: string) => {
    const badges = {
      generando: { icon: <Loader className="w-3 h-3 animate-spin" />, text: 'Generando', variant: 'warning' as const },
      completado: { icon: <CheckCircle className="w-3 h-3" />, text: 'Completado', variant: 'success' as const },
      error: { icon: <XCircle className="w-3 h-3" />, text: 'Error', variant: 'danger' as const },
    }
    const config = badges[estado as keyof typeof badges] || badges.generando
    return (
      <Badge variant={config.variant}>
        <div className="flex items-center gap-1">
          {config.icon}
          {config.text}
        </div>
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const columns = [
    {
      header: 'Nombre',
      accessor: (row: ReporteExportable) => (
        <div>
          <p className="font-medium text-gray-900">{row.nombre}</p>
          {row.descripcion && (
            <p className="text-xs text-gray-500 mt-1">{row.descripcion}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Tipo',
      accessor: (row: ReporteExportable) => {
        const tipos = {
          general: 'General',
          votantes: 'Votantes',
          financiero: 'Financiero',
          comunicacion: 'Comunicación',
          eventos: 'Eventos'
        }
        return tipos[row.tipo] || row.tipo
      },
    },
    {
      header: 'Formato',
      accessor: (row: ReporteExportable) => row.formato.toUpperCase(),
    },
    {
      header: 'Generado',
      accessor: (row: ReporteExportable) => formatDate(row.fecha_generacion),
    },
    {
      header: 'Estado',
      accessor: (row: ReporteExportable) => getEstadoBadge(row.estado),
    },
    {
      header: 'Acciones',
      accessor: (row: ReporteExportable) => (
        <div className="flex gap-2">
          {row.estado === 'completado' && (
            <button
              onClick={() => handleDescargar(row.id)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="Descargar"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleEliminar(row.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/analytics')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reportes Exportables</h1>
              <p className="text-gray-600 mt-1">
                Genera y descarga reportes personalizados
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-5 h-5" />
            <span>Generar Reporte</span>
          </button>
        </div>

        {/* Tabla de Reportes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Reportes Generados
            </h2>
          </div>

          <Table
            data={reportes}
            columns={columns}
            loading={loading}
            emptyMessage="No hay reportes generados"
          />
        </div>

        {/* Modal para Generar Reporte */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Generar Nuevo Reporte</h2>
              </div>

              <form onSubmit={handleGenerar} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Reporte *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: Reporte Mensual Enero 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Descripción opcional del reporte"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Reporte *
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="general">General (Todos los módulos)</option>
                      <option value="votantes">Votantes</option>
                      <option value="financiero">Financiero</option>
                      <option value="comunicacion">Comunicación</option>
                      <option value="eventos">Eventos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Formato *
                    </label>
                    <select
                      value={formData.formato}
                      onChange={(e) => setFormData({ ...formData, formato: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Inicio
                    </label>
                    <input
                      type="date"
                      value={formData.filtros.fecha_inicio || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        filtros: { ...formData.filtros, fecha_inicio: e.target.value }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Fin
                    </label>
                    <input
                      type="date"
                      value={formData.filtros.fecha_fin || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        filtros: { ...formData.filtros, fecha_fin: e.target.value }
                      })}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Contenido del Reporte
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.incluir_graficos}
                        onChange={(e) => setFormData({ ...formData, incluir_graficos: e.target.checked })}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Incluir Gráficos</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.incluir_tablas_detalle}
                        onChange={(e) => setFormData({ ...formData, incluir_tablas_detalle: e.target.checked })}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Incluir Tablas de Detalle</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.incluir_comparativas}
                        onChange={(e) => setFormData({ ...formData, incluir_comparativas: e.target.checked })}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Incluir Comparativas</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={generando}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generando ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Generando...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        <span>Generar Reporte</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
