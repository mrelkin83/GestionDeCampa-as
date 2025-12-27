import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Filter, Download, Upload } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Badge from '@/components/ui/Badge'
import FiltrosAvanzados from '@/components/votantes/FiltrosAvanzados'
import { votantesAPI, departamentosAPI } from '@/lib/api'
import { Votante, VotantePagination, VotanteFilters } from '@/types/votante'

export default function VotantesListado() {
  const navigate = useNavigate()
  const [data, setData] = useState<VotantePagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<VotanteFilters>({})
  const [departamentos, setDepartamentos] = useState<any[]>([])
  const [municipios, setMunicipios] = useState<any[]>([])

  useEffect(() => {
    loadDepartamentos()
  }, [])

  useEffect(() => {
    fetchVotantes()
  }, [currentPage, search, filters])

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

  const fetchVotantes = async () => {
    try {
      setLoading(true)
      const response = await votantesAPI.getAll({
        page: currentPage,
        search: search || undefined,
        per_page: 15,
        ...filters
      })
      setData(response)
    } catch (error) {
      console.error('Error al cargar votantes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchVotantes()
  }

  const handleApplyFilters = (newFilters: VotanteFilters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const getScoringBadge = (scoring?: number) => {
    if (!scoring) return <Badge variant="default">N/A</Badge>
    if (scoring >= 80) return <Badge variant="success">{scoring}</Badge>
    if (scoring >= 50) return <Badge variant="warning">{scoring}</Badge>
    return <Badge variant="danger">{scoring}</Badge>
  }

  const getIntencionVotoBadge = (intencion?: string) => {
    const labels = {
      favorable: { text: 'Favorable', variant: 'success' as const },
      indeciso: { text: 'Indeciso', variant: 'warning' as const },
      desfavorable: { text: 'Desfavorable', variant: 'danger' as const },
      no_definido: { text: 'No definido', variant: 'default' as const },
    }
    const config = labels[intencion as keyof typeof labels] || labels.no_definido
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const columns = [
    {
      header: 'Cédula',
      accessor: 'cedula' as keyof Votante,
      className: 'font-medium text-gray-900'
    },
    {
      header: 'Nombre Completo',
      accessor: (row: Votante) => `${row.nombre} ${row.apellido}`,
    },
    {
      header: 'Teléfono',
      accessor: (row: Votante) => row.celular || row.telefono || '-',
    },
    {
      header: 'Municipio',
      accessor: (row: Votante) => row.municipio?.nombre || '-',
    },
    {
      header: 'Scoring',
      accessor: (row: Votante) => getScoringBadge(row.scoring),
    },
    {
      header: 'Intención de Voto',
      accessor: (row: Votante) => getIntencionVotoBadge(row.intencion_voto),
    },
    {
      header: 'Contactos',
      accessor: (row: Votante) => (
        <span className="text-gray-600">{row.total_contactos || 0}</span>
      ),
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Votantes</h1>
            <p className="text-gray-600 mt-1">
              Gestiona tu base de datos de votantes
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/votantes/importar')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Upload className="w-5 h-5" />
              <span>Importar CSV</span>
            </button>
            <button
              onClick={() => navigate('/votantes/nuevo')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Votante</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Votantes</p>
            <p className="text-2xl font-bold text-gray-900">{data?.total || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Favorables</p>
            <p className="text-2xl font-bold text-green-600">-</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Indecisos</p>
            <p className="text-2xl font-bold text-yellow-600">-</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Scoring Promedio</p>
            <p className="text-2xl font-bold text-blue-600">-</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por cédula, nombre, teléfono..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(true)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-5 h-5" />
              <span>Filtros Avanzados</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-5 h-5" />
              <span>Exportar</span>
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow">
          <Table
            data={data?.data || []}
            columns={columns}
            loading={loading}
            onRowClick={(votante) => navigate(`/votantes/${votante.id}`)}
            emptyMessage="No se encontraron votantes"
          />

          {data && data.last_page > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={data.current_page}
                totalPages={data.last_page}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      <FiltrosAvanzados
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        departamentos={departamentos}
        municipios={municipios}
        onDepartamentoChange={loadMunicipios}
      />
    </MainLayout>
  )
}
