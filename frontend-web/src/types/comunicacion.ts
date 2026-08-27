export interface Template {
  id: number
  campana_id: number
  created_by_id?: number
  nombre: string
  canal: 'sms' | 'whatsapp' | 'email'
  asunto?: string // Solo para email
  contenido: string
  variables_disponibles?: string[] // Ej: ['nombre', 'apellido', 'municipio']
  activo: boolean
  veces_usado?: number
  ultima_vez_usado?: string
  created_at?: string
  updated_at?: string
}

export interface Campana {
  id: number
  campana_id: number
  nombre: string
  descripcion?: string
  template_id?: number
  segmento_id?: number
  canal: 'sms' | 'whatsapp' | 'email' | 'multiple'
  estado: 'borrador' | 'programada' | 'enviando' | 'completada' | 'cancelada' | 'fallida'
  fecha_programada?: string
  fecha_inicio_envio?: string
  fecha_fin_envio?: string

  // Estadísticas
  total_destinatarios?: number
  total_enviados?: number
  total_entregados?: number
  total_abiertos?: number
  total_clicks?: number
  total_fallidos?: number
  tasa_entrega?: number
  tasa_apertura?: number

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
  campana_comunicacion_id: number
  votante_id: number
  canal: 'sms' | 'whatsapp' | 'email'
  destinatario: string // Teléfono o email
  asunto?: string
  contenido: string
  estado: 'pendiente' | 'enviado' | 'entregado' | 'fallido'
  fecha_envio?: string
  fecha_entrega?: string
  fecha_apertura?: string
  fecha_click?: string
  error_mensaje?: string
  proveedor?: string
  mensaje_id_externo?: string

  // Relaciones
  votante?: {
    id: number
    documento: string
    primer_nombre: string
    primer_apellido: string
    nombre_completo?: string
    celular?: string
    email?: string
  }
  campana_comunicacion?: {
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
