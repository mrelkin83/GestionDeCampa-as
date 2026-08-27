export interface Votante {
  id: number
  campana_id: number
  documento: string
  tipo_documento: 'CC' | 'CE' | 'TI' | 'PAS'
  primer_nombre: string
  segundo_nombre?: string
  primer_apellido: string
  segundo_apellido?: string
  genero?: 'M' | 'F' | 'O'
  fecha_nacimiento?: string
  edad?: number
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
  mesa_id?: number

  // Scoring y segmentación
  scoring?: number
  probabilidad_voto?: number
  intencion_voto?: 'a_favor' | 'en_contra' | 'indeciso' | 'sin_definir'
  es_lider?: boolean

  // Metadata
  observaciones?: string
  tags?: string[]
  ultimo_contacto?: string
  numero_contactos?: number
  estado?: string

  nombre_completo?: string

  created_at?: string
  updated_at?: string

  departamento?: { id: number; nombre: string }
  municipio?: { id: number; nombre: string }
}

export interface VotanteFilters {
  intencion_voto?: string
  scoring_min?: number
  municipio_id?: number
  search?: string
}

export interface VotantePagination {
  data: Votante[]
  total: number
  per_page: number
  current_page: number
  last_page: number
}

export interface Contacto {
  id: number
  campana_id: number
  votante_id: number
  user_id: number
  tipo: 'llamada' | 'visita' | 'sms' | 'email' | 'whatsapp' | 'evento'
  resultado: 'exitoso' | 'sin_respuesta' | 'rechazado' | 'pendiente'
  notas?: string
  intencion_voto_antes?: string
  intencion_voto_despues?: string
  created_at: string
  user?: { id: number; first_name: string; last_name: string }
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
