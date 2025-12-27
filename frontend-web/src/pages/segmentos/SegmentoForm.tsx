import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, X, Plus, Trash2 } from 'lucide-react'
import MainLayout from '@/components/layout/MainLayout'
import { segmentosAPI } from '@/lib/api'

interface Criterio {
  campo: string
  operador: string
  valor: string
}

export default function SegmentoForm() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'dinamico',
  })
  const [criterios, setCriterios] = useState<Criterio[]>([
    { campo: '', operador: '', valor: '' }
  ])

  const campos = [
    { value: 'genero', label: 'Género' },
    { value: 'edad', label: 'Edad' },
    { value: 'scoring', label: 'Scoring' },
    { value: 'intencion_voto', label: 'Intención de Voto' },
    { value: 'nivel_compromiso', label: 'Nivel de Compromiso' },
    { value: 'departamento_id', label: 'Departamento' },
    { value: 'municipio_id', label: 'Municipio' },
  ]

  const operadores = [
    { value: '=', label: 'Igual a' },
    { value: '!=', label: 'Diferente de' },
    { value: '>', label: 'Mayor que' },
    { value: '>=', label: 'Mayor o igual' },
    { value: '<', label: 'Menor que' },
    { value: '<=', label: 'Menor o igual' },
    { value: 'LIKE', label: 'Contiene' },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCriterioChange = (index: number, field: keyof Criterio, value: string) => {
    const newCriterios = [...criterios]
    newCriterios[index][field] = value
    setCriterios(newCriterios)
  }

  const addCriterio = () => {
    setCriterios([...criterios, { campo: '', operador: '', valor: '' }])
  }

  const removeCriterio = (index: number) => {
    if (criterios.length > 1) {
      setCriterios(criterios.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const data = {
        ...formData,
        criterios: formData.tipo === 'dinamico' ? criterios : undefined
      }

      await segmentosAPI.create(data)
      navigate('/segmentos')
    } catch (error: any) {
      console.error('Error guardando segmento:', error)
      alert(error.response?.data?.message || 'Error al guardar segmento')
    } finally {
      setSaving(false)
    }
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Segmento</h1>
          <p className="text-gray-600 mt-1">
            Crea un segmento para organizar tus votantes
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
          <div className="p-6 space-y-6">
            {/* Información Básica */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Información Básica
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Segmento *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: Votantes favorables zona norte"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe el propósito de este segmento..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Segmento *
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="dinamico">
                      Dinámico - Se actualiza automáticamente según criterios
                    </option>
                    <option value="estatico">
                      Estático - Lista fija de votantes
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Criterios (solo para dinámicos) */}
            {formData.tipo === 'dinamico' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Criterios de Segmentación
                  </h2>
                  <button
                    type="button"
                    onClick={addCriterio}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar Criterio</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {criterios.map((criterio, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <select
                          value={criterio.campo}
                          onChange={(e) => handleCriterioChange(index, 'campo', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Seleccionar campo...</option>
                          {campos.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <select
                          value={criterio.operador}
                          onChange={(e) => handleCriterioChange(index, 'operador', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="">Operador...</option>
                          {operadores.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={criterio.valor}
                          onChange={(e) => handleCriterioChange(index, 'valor', e.target.value)}
                          placeholder="Valor..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCriterio(index)}
                        disabled={criterios.length === 1}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Segmento dinámico:</strong> Los votantes se agregarán automáticamente
                    si cumplen TODOS los criterios definidos. El segmento se actualiza en tiempo real.
                  </p>
                </div>
              </div>
            )}

            {formData.tipo === 'estatico' && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-800">
                  <strong>Segmento estático:</strong> Después de crear el segmento, podrás
                  agregar votantes manualmente desde el listado de votantes.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-lg">
            <button
              type="button"
              onClick={() => navigate('/segmentos')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
              <span>Cancelar</span>
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Crear Segmento</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  )
}
