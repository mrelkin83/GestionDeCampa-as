import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  DollarSign,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Banknote,
  Filter
} from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import Badge from '@/components/ui/Badge'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import { gastosAPI } from '@/lib/api'
import { Gasto, GastoPagination, EstadisticasGastos } from '@/types/gasto'
import { useActiveCampana } from '@/hooks/useActiveCampana'

export default function GastosListado() {
  const navigate = useNavigate()
  const { campanaId } = useActiveCampana()
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [pagination, setPagination] = useState<GastoPagination | null>(null)
  const [estadisticas, setEstadisticas] = useState<EstadisticasGastos | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFiltros, setShowFiltros] = useState(false)

  const [filtros, setFiltros] = useState({
    estado: '',
    categoria: '',
    search: '',
    page: 1
  })

  useEffect(() => {
    if (campanaId) {
      fetchData()
    }
  }, [filtros, campanaId])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [gastosRes, estadisticasRes] = await Promise.all([
        gastosAPI.getAll({
          campana_id: campanaId,
          estado: filtros.estado || undefined,
          categoria: filtros.categoria || undefined,
          search: filtros.search || undefined,
          page: filtros.page
        }),
        gastosAPI.estadisticas({ campana_id: campanaId })
      ])
      setGastos(gastosRes.data || [])
      setPagination(gastosRes)
      setEstadisticas(estadisticasRes.data)
    } catch (error) {
      console.error('Error al cargar gastos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAprobar = async (id: number) => {
    if (!confirm('¿Aprobar este gasto?')) return

    try {
      await gastosAPI.aprobar(id)
      fetchData()
    } catch (error) {
      console.error('Error aprobando gasto:', error)
      alert('Error al aprobar gasto')
    }
  }

  const handleRechazar = async (id: number) => {
    const motivo = prompt('Motivo del rechazo:')
    if (!motivo) return

    try {
      await gastosAPI.rechazar(id, motivo)
      fetchData()
    } catch (error) {
      console.error('Error rechazando gasto:', error)
      alert('Error al rechazar gasto')
    }
  }

  const handleMarcarPagado = async (id: number) => {
    if (!confirm('¿Marcar este gasto como pagado?')) return

    try {
      await gastosAPI.marcarPagado(id)
      fetchData()
    } catch (error) {
      console.error('Error marcando gasto como pagado:', error)
      alert('Error al marcar gasto como pagado')
    }
  }

  const handleFiltroChange = (key: string, value: string) => {
    setFiltros(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const limpiarFiltros = () => {
    setFiltros({ estado: '', categoria: '', search: '', page: 1 })
  }

  const getEstadoBadge = (estado: string) => {
    const badges = {
      pendiente: { text: 'Pendiente', variant: 'warning' as const },
      aprobado: { text: 'Aprobado', variant: 'info' as const },
      rechazado: { text: 'Rechazado', variant: 'danger' as const },
      pagado: { text: 'Pagado', variant: 'success' as const },
      reportado_cne: { text: 'Reportado CNE', variant: 'info' as const },
    }
    const config = badges[estado as keyof typeof badges] || badges.pendiente
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const CATEGORIA_LABELS: Record<string, string> = {
    publicidad: 'Publicidad',
    eventos: 'Eventos',
    logistica: 'Logística',
    personal: 'Personal',
    materiales: 'Materiales',
    transporte: 'Transporte',
    servicios_profesionales: 'Servicios Profesionales',
    otro: 'Otro',
  }

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(monto)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const columns = [
    {
      header: 'Fecha',
      accessor: (row: Gasto) => formatDate(row.fecha_gasto),
    },
    {
      header: 'Descripción',
      accessor: (row: Gasto) => row.descripcion,
    },
    {
      header: 'Categoría',
      accessor: (row: Gasto) => CATEGORIA_LABELS[row.categoria] || row.categoria,
    },
    {
      header: 'Proveedor',
      accessor: (row: Gasto) => row.proveedor || '-',
    },
    {
      header: 'Monto',
      accessor: (row: Gasto) => (
        <span className="font-semibold text-red-600">
          {formatMonto(row.monto)}
        </span>
      ),
    },
    {
      header: 'Estado',
      accessor: (row: Gasto) => getEstadoBadge(row.estado),
    },
    {
      header: 'Acciones',
      accessor: (row: Gasto) => (
        <div className="flex gap-2">
          {row.estado === 'pendiente' && (
            <>
              <button
                onClick={() => handleAprobar(row.id)}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Aprobar"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRechazar(row.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                title="Rechazar"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          {row.estado === 'aprobado' && (
            <button
              onClick={() => handleMarcarPagado(row.id)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
              title="Marcar como Pagado"
            >
              <Banknote className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ]

  if (loading && !estadisticas) {
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
            <h1 className="text-3xl font-bold text-gray-900">Gastos</h1>
            <p className="text-gray-600 mt-1">
              Controla y gestiona los gastos de tu campaña
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/gastos/nuevo')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              <span>Registrar Gasto</span>
            </button>
          </div>
        </div>

        {/* Alertas */}
        {estadisticas && (
          <>
            {estadisticas.topes_legales?.limite_excedido && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">
                    Tope Legal de Gastos Excedido
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    El gasto acumulado supera el tope legal permitido para esta campaña.
                  </p>
                </div>
              </div>
            )}
            {estadisticas.resumen.pendientes_aprobacion > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Gastos Pendientes de Aprobación
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Hay {estadisticas.resumen.pendientes_aprobacion} gasto(s) esperando aprobación.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Stats Cards */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-6 h-6" />
                <p className="text-sm opacity-90">Total Gastado</p>
              </div>
              <p className="text-3xl font-bold">
                {formatMonto(estadisticas.resumen.total_gastado)}
              </p>
              <p className="text-xs opacity-75 mt-1">
                {estadisticas.resumen.numero_gastos} gastos
              </p>
            </div>

            {estadisticas.topes_legales && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-gray-600">Tope Legal</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatMonto(estadisticas.topes_legales.limite_total)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Asignado</p>
              </div>
            )}

            {estadisticas.topes_legales && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-gray-600">Disponible</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatMonto(estadisticas.topes_legales.disponible)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {estadisticas.topes_legales.porcentaje_usado.toFixed(1)}% usado
                </p>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <p className="text-sm text-gray-600">Promedio por Gasto</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatMonto(estadisticas.resumen.promedio_gasto)}
              </p>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFiltros(!showFiltros)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${showFiltros ? 'bg-primary-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
            >
              <Filter className="w-5 h-5" />
              <span>Filtros</span>
            </button>

            {(filtros.estado || filtros.categoria || filtros.search) && (
              <button
                onClick={limpiarFiltros}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {showFiltros && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Búsqueda
                </label>
                <input
                  type="text"
                  value={filtros.search}
                  onChange={(e) => handleFiltroChange('search', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Buscar por concepto, proveedor..."
                />
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
                  <option value="aprobado">Aprobado</option>
                  <option value="rechazado">Rechazado</option>
                  <option value="pagado">Pagado</option>
                  <option value="reportado_cne">Reportado CNE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría
                </label>
                <select
                  value={filtros.categoria}
                  onChange={(e) => handleFiltroChange('categoria', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Todas</option>
                  {Object.entries(CATEGORIA_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Tabla de Gastos */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Registro de Gastos
            </h2>
          </div>

          <Table
            data={gastos}
            columns={columns}
            loading={loading}
            emptyMessage="No se encontraron gastos"
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
