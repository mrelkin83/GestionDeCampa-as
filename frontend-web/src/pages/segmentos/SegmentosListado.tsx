import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Users, Filter as FilterIcon, Trash2, Eye } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import Badge from '@/components/ui/Badge'
import { segmentosAPI } from '@/lib/api'
import { Segmento } from '@/types/votante'
import { useActiveCampana } from '@/hooks/useActiveCampana'

export default function SegmentosListado() {
  const navigate = useNavigate()
  const { campanaId } = useActiveCampana()
  const [segmentos, setSegmentos] = useState<Segmento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (campanaId) {
      fetchSegmentos()
    }
  }, [campanaId])

  const fetchSegmentos = async () => {
    try {
      setLoading(true)
      const response = await segmentosAPI.getAll({ campana_id: campanaId })
      setSegmentos(response.data || [])
    } catch (error) {
      console.error('Error al cargar segmentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este segmento?')) return

    try {
      await segmentosAPI.delete(id)
      fetchSegmentos()
    } catch (error) {
      console.error('Error eliminando segmento:', error)
      alert('Error al eliminar segmento')
    }
  }

  const getTipoBadge = (tipo: string) => {
    return tipo === 'dinamico'
      ? <Badge variant="info">Dinámico</Badge>
      : <Badge variant="default">Estático</Badge>
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
            <h1 className="text-3xl font-bold text-gray-900">Segmentos</h1>
            <p className="text-gray-600 mt-1">
              Organiza tus votantes en grupos para campañas dirigidas
            </p>
          </div>
          <button
            onClick={() => navigate('/segmentos/nuevo')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Segmento</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Segmentos</p>
            <p className="text-2xl font-bold text-gray-900">{segmentos.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Segmentos Dinámicos</p>
            <p className="text-2xl font-bold text-blue-600">
              {segmentos.filter(s => s.tipo === 'dinamico').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Segmentos Estáticos</p>
            <p className="text-2xl font-bold text-purple-600">
              {segmentos.filter(s => s.tipo === 'estatico').length}
            </p>
          </div>
        </div>

        {/* Segmentos Grid */}
        {segmentos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FilterIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay segmentos creados
            </h3>
            <p className="text-gray-600 mb-6">
              Crea tu primer segmento para organizar tus votantes
            </p>
            <button
              onClick={() => navigate('/segmentos/nuevo')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              <span>Crear Primer Segmento</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {segmentos.map((segmento) => (
              <div
                key={segmento.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {segmento.nombre}
                      </h3>
                      {getTipoBadge(segmento.tipo)}
                    </div>
                  </div>

                  {segmento.descripcion && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {segmento.descripcion}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">
                        {segmento.total_votantes || 0}
                      </span>{' '}
                      votantes
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    Creado el {new Date(segmento.created_at || '').toLocaleDateString()}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/segmentos/${segmento.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Ver Detalle</span>
                    </button>
                    <button
                      onClick={() => handleDelete(segmento.id)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
