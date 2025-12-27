import { useState } from 'react'
import { X, Filter } from 'lucide-react'
import { VotanteFilters } from '@/types/votante'

interface FiltrosAvanzadosProps {
  isOpen: boolean
  onClose: () => void
  onApply: (filters: VotanteFilters) => void
  departamentos: any[]
  municipios: any[]
  onDepartamentoChange: (id: number) => void
}

export default function FiltrosAvanzados({
  isOpen,
  onClose,
  onApply,
  departamentos,
  municipios,
  onDepartamentoChange
}: FiltrosAvanzadosProps) {
  const [filters, setFilters] = useState<VotanteFilters>({
    departamento_id: undefined,
    municipio_id: undefined,
    genero: undefined,
    intencion_voto: undefined,
    scoring_min: undefined,
    scoring_max: undefined,
    edad_min: undefined,
    edad_max: undefined,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const newFilters = {
      ...filters,
      [name]: value === '' ? undefined : value
    }
    setFilters(newFilters)

    // Si cambió departamento, notificar al padre para cargar municipios
    if (name === 'departamento_id' && value) {
      onDepartamentoChange(Number(value))
    }
  }

  const handleApply = () => {
    onApply(filters)
    onClose()
  }

  const handleClear = () => {
    const emptyFilters: VotanteFilters = {}
    setFilters(emptyFilters)
    onApply(emptyFilters)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900">Filtros Avanzados</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Ubicación */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Ubicación</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Departamento
                </label>
                <select
                  name="departamento_id"
                  value={filters.departamento_id || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {departamentos.map(dep => (
                    <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Municipio
                </label>
                <select
                  name="municipio_id"
                  value={filters.municipio_id || ''}
                  onChange={handleChange}
                  disabled={!filters.departamento_id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Todos</option>
                  {municipios.map(mun => (
                    <option key={mun.id} value={mun.id}>{mun.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Datos Demográficos */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Datos Demográficos</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Género
                </label>
                <select
                  name="genero"
                  value={filters.genero || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Intención de Voto
                </label>
                <select
                  name="intencion_voto"
                  value={filters.intencion_voto || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Todas</option>
                  <option value="favorable">Favorable</option>
                  <option value="indeciso">Indeciso</option>
                  <option value="desfavorable">Desfavorable</option>
                  <option value="no_definido">No definido</option>
                </select>
              </div>
            </div>
          </div>

          {/* Rango de Edad */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Rango de Edad</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Edad Mínima
                </label>
                <input
                  type="number"
                  name="edad_min"
                  value={filters.edad_min || ''}
                  onChange={handleChange}
                  min="18"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="18"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Edad Máxima
                </label>
                <input
                  type="number"
                  name="edad_max"
                  value={filters.edad_max || ''}
                  onChange={handleChange}
                  min="18"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          {/* Rango de Scoring */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Rango de Scoring</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Scoring Mínimo
                </label>
                <input
                  type="number"
                  name="scoring_min"
                  value={filters.scoring_min || ''}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Scoring Máximo
                </label>
                <input
                  type="number"
                  name="scoring_max"
                  value={filters.scoring_max || ''}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between rounded-b-lg">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Limpiar Filtros
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
