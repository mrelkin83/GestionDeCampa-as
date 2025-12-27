export interface Evento {
  id: number
  campana_id: number
  nombre: string
  descripcion?: string
  tipo: 'reunion' | 'mitin' | 'puerta_puerta' | 'capacitacion' | 'otro'
  fecha_inicio: string
  fecha_fin: string
  ubicacion?: string
  direccion?: string
  latitud?: number
  longitud?: number
  capacidad_maxima?: number
  requiere_confirmacion: boolean
  codigo_qr?: string
  estado: 'planificado' | 'en_curso' | 'finalizado' | 'cancelado'

  // Estadísticas
  total_confirmados?: number
  total_asistentes?: number

  // Metadata
  created_at?: string
  updated_at?: string
}

export interface EventoAsistencia {
  id: number
  evento_id: number
  votante_id: number
  confirmado: boolean
  asistio: boolean
  hora_confirmacion?: string
  hora_asistencia?: string
  observaciones?: string
  created_at?: string
  updated_at?: string

  // Relaciones
  votante?: {
    id: number
    cedula: string
    nombre: string
    apellido: string
    celular?: string
  }
}

export interface EventoPagination {
  data: Evento[]
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}

export interface EventoFilters {
  tipo?: string
  estado?: string
  fecha_desde?: string
  fecha_hasta?: string
  search?: string
}
