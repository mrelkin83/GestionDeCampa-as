import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  FileText,
  Filter
} from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import Badge from '@/components/ui/Badge'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import { donacionesAPI } from '@/lib/api'
import { Donacion, DonacionPagination, EstadisticasDonaciones } from '@/types/donacion'
import { useActiveCampana } from '@/hooks/useActiveCampana'

export default function DonacionesListado() {
  const navigate = useNavigate()
  const { campanaId } = useActiveCampana()
  const [donaciones, setDonaciones] = useState<Donacion[]>([])
  const [pagination, setPagination] = useState<DonacionPagination | null>(null)
  const [estadisticas, setEstadisticas] = useState<EstadisticasDonaciones | null>(null)
  const [loading, setLoading] = useState(true)
  const [showFiltros, setShowFiltros] = useState(false)

  const [filtros, setFiltros] = useState({
    estado: '',
    tipo: '',
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
      const [donacionesRes, estadisticasRes] = await Promise.all([
        donacionesAPI.getAll({
          campana_id: campanaId,
          estado: filtros.estado || undefined,
          tipo: filtros.tipo || undefined,
          search: filtros.search || undefined,
          page: filtros.page
        }),
        donacionesAPI.estadisticas({ campana_id: campanaId })
      ])
      setDonaciones(donacionesRes.data || [])
      setPagination(donacionesRes)
      setEstadisticas(estadisticasRes.data)
    } catch (error) {
      console.error('Error al cargar donaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmar = async (id: number) => {
    const numeroComprobante = prompt('Número de comprobante de la transacción:')
    if (!numeroComprobante) return

    try {
      await donacionesAPI.confirmar(id, numeroComprobante)
      fetchData()
    } catch (error) {
      console.error('Error confirmando donación:', error)
      alert('Error al confirmar donación')
    }
  }

  const handleRechazar = async (id: number) => {
    const motivo = prompt('Motivo del rechazo:')
    if (!motivo) return

    try {
      await donacionesAPI.rechazar(id, motivo)
      fetchData()
    } catch (error) {
      console.error('Error rechazando donación:', error)
      alert('Error al rechazar donación')
    }
  }

  const handleFiltroChange = (key: string, value: string) => {
    setFiltros(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const limpiarFiltros = () => {
    setFiltros({ estado: '', tipo: '', search: '', page: 1 })
  }

  const getEstadoBadge = (estado: string) => {
    const badges = {
      pendiente: { text: 'Pendiente', variant: 'warning' as const },
      confirmada: { text: 'Confirmada', variant: 'success' as const },
      rechazada: { text: 'Rechazada', variant: 'danger' as const },
      reportada_cne: { text: 'Reportada CNE', variant: 'info' as const },
    }
    const config = badges[estado as keyof typeof badges] || badges.pendiente
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const getMetodoBadge = (tipo: string) => {
    const badges = {
      efectivo: { text: 'Efectivo', variant: 'success' as const },
      transferencia: { text: 'Transferencia', variant: 'info' as const },
      cheque: { text: 'Cheque', variant: 'default' as const },
      especie: { text: 'Especie', variant: 'default' as const },
      servicio: { text: 'Servicio', variant: 'default' as const },
    }
    const config = badges[tipo as keyof typeof badges] || badges.efectivo
    return <Badge variant={config.variant}>{config.text}</Badge>
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
      accessor: (row: Donacion) => formatDate(row.fecha_donacion),
    },
    {
      header: 'Donante',
      accessor: (row: Donacion) => row.donante
        ? (row.donante.tipo === 'persona_natural'
          ? `${row.donante.nombres} ${row.donante.apellidos || ''}`
          : row.donante.razon_social)
        : 'Anónimo',
    },
    {
      header: 'Monto',
      accessor: (row: Donacion) => (
        <span className="font-semibold text-green-600">
          {formatMonto(row.monto)}
        </span>
      ),
    },
    {
      header: 'Método',
      accessor: (row: Donacion) => getMetodoBadge(row.tipo),
    },
    {
      header: 'Estado',
      accessor: (row: Donacion) => getEstadoBadge(row.estado),
    },
    {
      header: 'Acciones',
      accessor: (row: Donacion) => (
        <div className="flex gap-2">
          {row.estado === 'pendiente' && (
            <>
              <button
                onClick={() => handleConfirmar(row.id)}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
                title="Confirmar"
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
            <h1 className="text-3xl font-bold text-gray-900">Donaciones</h1>
            <p className="text-gray-600 mt-1">
              Gestiona las donaciones y recaudación de tu campaña
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/donaciones/donantes')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Users className="w-5 h-5" />
              <span>Donantes</span>
            </button>
            <button
              onClick={() => navigate('/donaciones/nuevo')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              <span>Registrar Donación</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-6 h-6" />
                <p className="text-sm opacity-90">Total Recaudado</p>
              </div>
              <p className="text-3xl font-bold">
                {formatMonto(estadisticas.resumen.total_recaudado)}
              </p>
              <p className="text-xs opacity-75 mt-1">
                {estadisticas.resumen.numero_donaciones} donaciones
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <p className="text-sm text-gray-600">Promedio</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatMonto(estadisticas.resumen.promedio_donacion)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Por donación</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-orange-600" />
                <p className="text-sm text-gray-600">Efectivo</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatMonto(estadisticas.resumen.efectivo)}
              </p>
            </div>

            {estadisticas.topes_legales && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-gray-600">Tope Legal Usado</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {estadisticas.topes_legales.porcentaje_usado}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatMonto(estadisticas.topes_legales.disponible)} disponible
                </p>
              </div>
            )}
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

            {(filtros.estado || filtros.tipo || filtros.search) && (
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
                  placeholder="Buscar por donante, referencia..."
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
                  <option value="confirmada">Confirmada</option>
                  <option value="rechazada">Rechazada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago
                </label>
                <select
                  value={filtros.tipo}
                  onChange={(e) => handleFiltroChange('tipo', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="cheque">Cheque</option>
                  <option value="especie">Especie</option>
                  <option value="servicio">Servicio</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Tabla de Donaciones */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Registro de Donaciones
            </h2>
          </div>

          <Table
            data={donaciones}
            columns={columns}
            loading={loading}
            emptyMessage="No se encontraron donaciones"
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
