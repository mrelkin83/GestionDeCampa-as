import { useState, useEffect } from 'react'
import { Filter, MessageSquare, Send, CheckCircle, XCircle } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import Badge from '@/components/ui/Badge'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import { mensajesAPI } from '@/lib/api'
import { Mensaje, MensajePagination } from '@/types/comunicacion'

export default function MensajesHistorial() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [pagination, setPagination] = useState<MensajePagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFiltros, setShowFiltros] = useState(false)

  const [filtros, setFiltros] = useState({
    canal: '',
    estado: '',
    search: '',
    page: 1
  })

  useEffect(() => {
    fetchMensajes()
  }, [filtros])

  const fetchMensajes = async () => {
    try {
      setLoading(true)
      const response = await mensajesAPI.getAll({
        canal: filtros.canal || undefined,
        estado: filtros.estado || undefined,
        search: filtros.search || undefined,
        page: filtros.page
      })
      setMensajes(response.data || [])
      setPagination(response)
    } catch (error) {
      console.error('Error al cargar mensajes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFiltroChange = (key: string, value: string) => {
    setFiltros(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const limpiarFiltros = () => {
    setFiltros({
      canal: '',
      estado: '',
      search: '',
      page: 1
    })
  }

  const getEstadoBadge = (estado: string) => {
    const badges = {
      pendiente: { text: 'Pendiente', variant: 'default' as const },
      enviado: { text: 'Enviado', variant: 'info' as const },
      entregado: { text: 'Entregado', variant: 'success' as const },
      leido: { text: 'Leído', variant: 'success' as const },
      fallido: { text: 'Fallido', variant: 'danger' as const },
    }
    const config = badges[estado as keyof typeof badges] || badges.pendiente
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
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const columns = [
    {
      header: 'Fecha Envío',
      accessor: (row: Mensaje) => formatDate(row.fecha_envio),
    },
    {
      header: 'Destinatario',
      accessor: (row: Mensaje) => row.votante
        ? `${row.votante.nombre} ${row.votante.apellido}`
        : row.destinatario,
    },
    {
      header: 'Campaña',
      accessor: (row: Mensaje) => row.campana?.nombre || '-',
    },
    {
      header: 'Canal',
      accessor: (row: Mensaje) => getCanalBadge(row.canal),
    },
    {
      header: 'Estado',
      accessor: (row: Mensaje) => getEstadoBadge(row.estado),
    },
    {
      header: 'Contenido',
      accessor: (row: Mensaje) => (
        <span className="text-sm text-gray-600 line-clamp-1">
          {row.asunto && `${row.asunto} - `}
          {row.contenido}
        </span>
      ),
    },
  ]

  const estadisticas = {
    total: mensajes.length,
    enviados: mensajes.filter(m => ['enviado', 'entregado', 'leido'].includes(m.estado)).length,
    entregados: mensajes.filter(m => ['entregado', 'leido'].includes(m.estado)).length,
    fallidos: mensajes.filter(m => m.estado === 'fallido').length,
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Historial de Mensajes</h1>
            <p className="text-gray-600 mt-1">
              Revisa el estado de todos los mensajes enviados
            </p>
          </div>
          <button
            onClick={() => setShowFiltros(!showFiltros)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${showFiltros ? 'bg-primary-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
          >
            <Filter className="w-5 h-5" />
            <span>Filtros</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-gray-600" />
              <p className="text-sm text-gray-600">Total Mensajes</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {pagination?.total || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <Send className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600">Enviados</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {estadisticas.enviados}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">Entregados</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {estadisticas.entregados}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-gray-600">Fallidos</p>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {estadisticas.fallidos}
            </p>
          </div>
        </div>

        {/* Filtros Avanzados */}
        {showFiltros && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
              <button
                onClick={limpiarFiltros}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Limpiar filtros
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Búsqueda
                </label>
                <input
                  type="text"
                  value={filtros.search}
                  onChange={(e) => handleFiltroChange('search', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Buscar por nombre, cédula, contenido..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canal
                </label>
                <select
                  value={filtros.canal}
                  onChange={(e) => handleFiltroChange('canal', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filtros.estado}
                  onChange={(e) => handleFiltroChange('estado', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="enviado">Enviado</option>
                  <option value="entregado">Entregado</option>
                  <option value="leido">Leído</option>
                  <option value="fallido">Fallido</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de Mensajes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Mensajes Enviados
            </h2>
          </div>

          <Table
            data={mensajes}
            columns={columns}
            loading={loading}
            emptyMessage="No se encontraron mensajes con los filtros aplicados"
          />

          {pagination && pagination.total > pagination.per_page && (
            <div className="p-4 border-t border-gray-200">
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.last_page}
                onPageChange={(page) => setFiltros(prev => ({ ...prev, page }))}
              />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
