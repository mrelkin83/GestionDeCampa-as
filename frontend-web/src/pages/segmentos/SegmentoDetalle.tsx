import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, Users, Filter as FilterIcon, Download } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import Table from '@/components/ui/Table'
import Pagination from '@/components/ui/Pagination'
import Badge from '@/components/ui/Badge'
import { segmentosAPI } from '@/lib/api'
import { Segmento, Votante, VotantePagination } from '@/types/votante'

export default function SegmentoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [segmento, setSegmento] = useState<Segmento | null>(null)
  const [votantes, setVotantes] = useState<VotantePagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (id) {
      loadSegmento()
      loadVotantes()
    }
  }, [id, currentPage])

  const loadSegmento = async () => {
    try {
      const response = await segmentosAPI.getById(Number(id))
      setSegmento(response.data)
    } catch (error) {
      console.error('Error cargando segmento:', error)
    }
  }

  const loadVotantes = async () => {
    try {
      setLoading(true)
      const response = await segmentosAPI.getVotantes(Number(id), {
        page: currentPage,
        per_page: 15
      })
      setVotantes(response)
    } catch (error) {
      console.error('Error cargando votantes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de eliminar este segmento?')) return

    try {
      await segmentosAPI.delete(Number(id))
      navigate('/segmentos')
    } catch (error) {
      console.error('Error eliminando segmento:', error)
      alert('Error al eliminar segmento')
    }
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
      header: 'Documento',
      accessor: 'documento' as keyof Votante,
      className: 'font-medium text-gray-900'
    },
    {
      header: 'Nombre Completo',
      accessor: (row: Votante) => row.nombre_completo || `${row.primer_nombre} ${row.primer_apellido}`,
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
  ]

  if (!segmento) {
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/segmentos')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  {segmento.nombre}
                </h1>
                <Badge variant={segmento.tipo === 'dinamico' ? 'info' : 'default'}>
                  {segmento.tipo === 'dinamico' ? 'Dinámico' : 'Estático'}
                </Badge>
              </div>
              {segmento.descripcion && (
                <p className="text-gray-600 mt-1">{segmento.descripcion}</p>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/segmentos/${id}/editar`)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Edit className="w-5 h-5" />
              <span>Editar</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-5 h-5" />
              <span>Eliminar</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-primary-600" />
              <p className="text-sm text-gray-600">Total Votantes</p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {segmento.total_votantes || 0}
            </p>
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

        {/* Criterios (si es dinámico) */}
        {segmento.tipo === 'dinamico' && segmento.criterios && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <FilterIcon className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Criterios de Segmentación
              </h2>
            </div>
            <div className="space-y-2">
              {Object.entries(segmento.criterios).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-700">{key}:</span>
                  <span className="text-gray-600">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-5 h-5" />
            <span>Exportar Votantes</span>
          </button>
        </div>

        {/* Tabla de Votantes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Votantes en este Segmento
            </h2>
          </div>

          <Table
            data={votantes?.data || []}
            columns={columns}
            loading={loading}
            onRowClick={(votante) => navigate(`/votantes/${votante.id}`)}
            emptyMessage="No hay votantes en este segmento"
          />

          {votantes && votantes.last_page > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={votantes.current_page}
                totalPages={votantes.last_page}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
