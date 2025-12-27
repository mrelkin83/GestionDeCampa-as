export interface Template {
  id: number
  campana_id: number
  nombre: string
  descripcion?: string
  canal: 'sms' | 'whatsapp' | 'email'
  asunto?: string // Solo para email
  contenido: string
  variables: string[] // Ej: ['nombre', 'apellido', 'municipio']
  activo: boolean
  created_at?: string
  updated_at?: string
}

export interface Campana {
  id: number
  campana_id: number
  nombre: string
  descripcion?: string
  template_id: number
  segmento_id?: number
  canal: 'sms' | 'whatsapp' | 'email'
  estado: 'borrador' | 'programada' | 'en_proceso' | 'completada' | 'cancelada'
  fecha_programada?: string
  fecha_inicio?: string
  fecha_fin?: string

  // Estadísticas
  total_destinatarios?: number
  enviados?: number
  entregados?: number
  leidos?: number
  respondidos?: number
  fallidos?: number

  // Relaciones
  template?: Template
  segmento?: {
    id: number
    nombre: string
    total_votantes: number
  }

  created_at?: string
  updated_at?: string
}

export interface Mensaje {
  id: number
  campana_id: number
  votante_id: number
  template_id: number
  canal: 'sms' | 'whatsapp' | 'email'
  destinatario: string // Teléfono o email
  asunto?: string
  contenido: string
  estado: 'pendiente' | 'enviado' | 'entregado' | 'leido' | 'fallido'
  fecha_envio?: string
  fecha_entrega?: string
  fecha_lectura?: string
  error_mensaje?: string

  // Relaciones
  votante?: {
    id: number
    cedula: string
    nombre: string
    apellido: string
    celular?: string
    email?: string
  }
  campana?: {
    id: number
    nombre: string
  }

  created_at?: string
  updated_at?: string
}

export interface EstadisticasCampana {
  total: number
  enviados: number
  entregados: number
  leidos: number
  respondidos: number
  fallidos: number
  pendientes: number
  tasa_entrega: number // Porcentaje
  tasa_lectura: number // Porcentaje
}

export interface TemplatePagination {
  data: Template[]
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}

export interface CampanaPagination {
  data: Campana[]
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}

export interface MensajePagination {
  data: Mensaje[]
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}

export interface TemplateFilters {
  canal?: string
  activo?: boolean
  search?: string
}

export interface CampanaFilters {
  estado?: string
  canal?: string
  fecha_desde?: string
  fecha_hasta?: string
  search?: string
}

export interface MensajeFilters {
  campana_id?: number
  votante_id?: number
  canal?: string
  estado?: string
  fecha_desde?: string
  fecha_hasta?: string
  search?: string
}
