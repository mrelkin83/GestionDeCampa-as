import { useState, useEffect } from 'react'
import { FileText, Download } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import Badge from '@/components/ui/Badge'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import { recibosAPI } from '@/lib/api'
import { Recibo, ReciboPagination } from '@/types/donacion'

export default function RecibosListado() {
  const [recibos, setRecibos] = useState<Recibo[]>([])
  const [pagination, setPagination] = useState<ReciboPagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [filtros, setFiltros] = useState({
    search: '',
    page: 1
  })

  useEffect(() => {
    fetchRecibos()
  }, [filtros])

  const fetchRecibos = async () => {
    try {
      setLoading(true)
      const response = await recibosAPI.getAll({
        search: filtros.search || undefined,
        page: filtros.page
      })
      setRecibos(response.data || [])
      setPagination(response)
    } catch (error) {
      console.error('Error al cargar recibos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDescargar = async (id: number) => {
    try {
      const blob = await recibosAPI.descargar(id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `recibo-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error descargando recibo:', error)
      alert('Error al descargar recibo')
    }
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
      header: 'No. Recibo',
      accessor: (row: Recibo) => (
        <span className="font-mono font-semibold">{row.numero_recibo}</span>
      ),
    },
    {
      header: 'Fecha Emisión',
      accessor: (row: Recibo) => formatDate(row.fecha_emision),
    },
    {
      header: 'Donante',
      accessor: (row: Recibo) => row.donante_nombre,
    },
    {
      header: 'Documento',
      accessor: (row: Recibo) => row.donante_documento,
    },
    {
      header: 'Monto',
      accessor: (row: Recibo) => (
        <span className="font-semibold text-green-600">
          {formatMonto(row.monto)}
        </span>
      ),
    },
    {
      header: 'PDF',
      accessor: (row: Recibo) => (
        row.pdf_generado ? (
          <Badge variant="success">Generado</Badge>
        ) : (
          <Badge variant="warning">Pendiente</Badge>
        )
      ),
    },
    {
      header: 'Acciones',
      accessor: (row: Recibo) => (
        <button
          onClick={() => handleDescargar(row.id)}
          disabled={!row.pdf_generado}
          className="p-1 text-primary-600 hover:bg-primary-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          title="Descargar PDF"
        >
          <Download className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recibos de Donación</h1>
            <p className="text-gray-600 mt-1">
              Comprobantes fiscales de las donaciones recibidas
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-gray-600" />
              <p className="text-sm text-gray-600">Total Recibos</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {pagination?.total || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">Generados</p>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {recibos.filter(r => r.pdf_generado).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-gray-600">Pendientes</p>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {recibos.filter(r => !r.pdf_generado).length}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4">
          <input
            type="text"
            value={filtros.search}
            onChange={(e) => setFiltros(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Buscar por número de recibo, donante..."
          />
        </div>

        {/* Tabla de Recibos */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Listado de Recibos
            </h2>
          </div>

          <Table
            data={recibos}
            columns={columns}
            loading={loading}
            emptyMessage="No se encontraron recibos"
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
