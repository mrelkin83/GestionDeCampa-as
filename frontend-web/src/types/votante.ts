export interface Votante {
  id: number
  cedula: string
  nombre: string
  apellido: string
  fecha_nacimiento?: string
  edad?: number
  genero?: 'M' | 'F' | 'O'
  email?: string
  telefono?: string
  celular?: string
  direccion?: string
  barrio?: string

  // Ubicación electoral
  departamento_id?: number
  municipio_id?: number
  zona_electoral_id?: number
  puesto_votacion_id?: number
  mesa?: string

  // Scoring y segmentación
  scoring?: number
  intencion_voto?: 'favorable' | 'indeciso' | 'desfavorable' | 'no_definido'
  nivel_compromiso?: 'alto' | 'medio' | 'bajo'

  // Metadata
  observaciones?: string
  tags?: string[]
  ultima_interaccion?: string
  total_contactos?: number

  // Timestamps
  created_at?: string
  updated_at?: string

  // Relaciones (opcional, cuando vienen del backend)
  departamento?: {
    id: number
    nombre: string
  }
  municipio?: {
    id: number
    nombre: string
  }
}

export interface VotanteFilters {
  search?: string
  departamento_id?: number
  municipio_id?: number
  genero?: string
  intencion_voto?: string
  scoring_min?: number
  scoring_max?: number
  edad_min?: number
  edad_max?: number
}

export interface VotantePagination {
  data: Votante[]
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}

export interface Segmento {
  id: number
  campana_id: number
  nombre: string
  descripcion?: string
  tipo: 'dinamico' | 'estatico'
  criterios?: Record<string, any>
  total_votantes?: number
  created_at?: string
  updated_at?: string
}
