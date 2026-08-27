import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, User, Building, DollarSign, TrendingUp, Edit, Ban } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import Badge from '@/components/ui/Badge'
import { donantesAPI } from '@/lib/api'
import { Donante } from '@/types/donacion'
import { useActiveCampana } from '@/hooks/useActiveCampana'

export default function DonantesListado() {
  const navigate = useNavigate()
  const { campanaId } = useActiveCampana()
  const [donantes, setDonantes] = useState<Donante[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroTipo, setFiltroTipo] = useState<string>('')

  useEffect(() => {
    if (campanaId) {
      fetchDonantes()
    }
  }, [filtroTipo, campanaId])

  const fetchDonantes = async () => {
    try {
      setLoading(true)
      const response = await donantesAPI.getAll({
        campana_id: campanaId,
        tipo: filtroTipo || undefined
      })
      setDonantes(response.data || [])
    } catch (error) {
      console.error('Error al cargar donantes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarcarInvalido = async (id: number, nombre: string) => {
    // Los donantes no se eliminan: quedan con historial sujeto a reporte
    // CNE. "Inválido" es la acción real que expone el backend.
    const razon = prompt(`¿Por qué se marca como inválido el donante "${nombre}"?`)
    if (!razon) return

    try {
      await donantesAPI.marcarInvalido(id, razon)
      fetchDonantes()
    } catch (error) {
      console.error('Error marcando donante como inválido:', error)
      alert('Error al marcar donante como inválido')
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

  const getTipoBadge = (tipo: string) => {
    if (tipo === 'persona_natural') {
      return <Badge variant="info">Persona</Badge>
    }
    return <Badge variant="success">Empresa</Badge>
  }

  const totalRecaudado = donantes.reduce((sum, d) => sum + (d.total_donado || 0), 0)

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
            <h1 className="text-3xl font-bold text-gray-900">Donantes</h1>
            <p className="text-gray-600 mt-1">
              Administra la base de datos de donantes de tu campaña
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/donaciones')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <DollarSign className="w-5 h-5" />
              <span>Ver Donaciones</span>
            </button>
            <button
              onClick={() => navigate('/donaciones/donantes/nuevo')}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              <span>Nuevo Donante</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Donantes</p>
            <p className="text-2xl font-bold text-gray-900">{donantes.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Personas</p>
            <p className="text-2xl font-bold text-blue-600">
              {donantes.filter(d => d.tipo === 'persona_natural').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Empresas</p>
            <p className="text-2xl font-bold text-green-600">
              {donantes.filter(d => d.tipo === 'persona_juridica').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Recaudado</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatMonto(totalRecaudado)}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFiltroTipo('')}
              className={`px-4 py-2 rounded-lg ${!filtroTipo ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroTipo('persona_natural')}
              className={`px-4 py-2 rounded-lg ${filtroTipo === 'persona_natural' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Personas
            </button>
            <button
              onClick={() => setFiltroTipo('persona_juridica')}
              className={`px-4 py-2 rounded-lg ${filtroTipo === 'persona_juridica' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Empresas
            </button>
          </div>
        </div>

        {/* Donantes Grid */}
        {donantes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay donantes registrados
            </h3>
            <p className="text-gray-600 mb-6">
              Crea tu primer donante para comenzar a registrar donaciones
            </p>
            <button
              onClick={() => navigate('/donaciones/donantes/nuevo')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="w-5 h-5" />
              <span>Crear Primer Donante</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {donantes.map((donante) => (
              <div
                key={donante.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {donante.tipo === 'persona_natural' ? (
                      <User className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Building className="w-5 h-5 text-green-600" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {donante.tipo === 'persona_natural'
                          ? `${donante.nombres} ${donante.apellidos || ''}`
                          : donante.razon_social}
                      </h3>
                    </div>
                  </div>
                  {getTipoBadge(donante.tipo)}
                </div>

                {/* Información */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span className="font-medium">
                      {donante.tipo === 'persona_natural' ? donante.tipo_documento : 'NIT'}:
                    </span>
                    <span>{donante.tipo === 'persona_natural' ? donante.documento : donante.nit}</span>
                  </div>
                  {donante.email && (
                    <div className="text-gray-600">
                      <span>{donante.email}</span>
                    </div>
                  )}
                  {donante.telefono && (
                    <div className="text-gray-600">
                      <span>{donante.telefono}</span>
                    </div>
                  )}
                </div>

                {/* Estadísticas */}
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <p className="text-xs text-gray-600">Total Donado</p>
                      </div>
                      <p className="text-lg font-semibold text-green-600">
                        {formatMonto(donante.total_donado || 0)}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-gray-600">Donaciones</p>
                      </div>
                      <p className="text-lg font-semibold text-blue-600">
                        {donante.numero_donaciones || 0}
                      </p>
                    </div>
                  </div>
                  {donante.fecha_ultima_donacion && (
                    <p className="text-xs text-gray-500 mt-2">
                      Última donación: {formatDate(donante.fecha_ultima_donacion)}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => navigate(`/donaciones/donantes/${donante.id}/editar`)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleMarcarInvalido(donante.id, donante.nombres || donante.razon_social || '')}
                    title="Marcar como inválido"
                    className="flex items-center justify-center px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Ban className="w-4 h-4" />
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
