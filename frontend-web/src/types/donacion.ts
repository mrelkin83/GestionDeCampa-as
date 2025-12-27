export interface Donante {
  id: number
  campana_id: number
  tipo: 'persona' | 'empresa'

  // Información Personal/Empresa
  nombre: string
  apellido?: string // Solo para personas
  razon_social?: string // Solo para empresas
  tipo_documento: 'cedula' | 'nit' | 'pasaporte' | 'cedula_extranjeria'
  numero_documento: string

  // Contacto
  email?: string
  telefono?: string
  celular?: string

  // Dirección
  direccion?: string
  ciudad?: string
  departamento?: string
  pais: string

  // Información Adicional
  ocupacion?: string
  empresa?: string
  sector_economico?: string
  es_anonimo: boolean

  // Estadísticas
  total_donaciones?: number
  monto_total_donado?: number
  ultima_donacion?: string

  created_at?: string
  updated_at?: string
}

export interface Donacion {
  id: number
  campana_id: number
  donante_id: number

  // Información de la Donación
  monto: number
  fecha_donacion: string
  metodo_pago: 'efectivo' | 'transferencia' | 'tarjeta_credito' | 'tarjeta_debito' | 'cheque' | 'otro'
  referencia?: string // Número de transacción, cheque, etc.
  banco?: string

  // Estado y Validación
  estado: 'pendiente' | 'confirmada' | 'rechazada' | 'reversada'
  observaciones?: string

  // Compliance
  requiere_reporte: boolean // Si supera límites legales
  verificada: boolean
  fecha_verificacion?: string
  verificada_por?: number // user_id

  // Recibo
  recibo_id?: number
  recibo_generado: boolean

  // Relaciones
  donante?: Donante
  recibo?: Recibo

  created_at?: string
  updated_at?: string
}

export interface Recibo {
  id: number
  donacion_id: number
  campana_id: number

  // Información del Recibo
  numero_recibo: string
  fecha_emision: string
  monto: number

  // Beneficiario (Campaña/Candidato)
  beneficiario_nombre: string
  beneficiario_documento: string

  // Donante
  donante_nombre: string
  donante_documento: string

  // Archivo
  pdf_url?: string
  pdf_generado: boolean

  // Relaciones
  donacion?: Donacion

  created_at?: string
  updated_at?: string
}

export interface EstadisticasDonaciones {
  total_recaudado: number
  total_donaciones: number
  total_donantes: number
  promedio_donacion: number

  // Por método de pago
  por_metodo: {
    efectivo: number
    transferencia: number
    tarjeta: number
    cheque: number
    otro: number
  }

  // Por estado
  confirmadas: number
  pendientes: number
  rechazadas: number

  // Por periodo
  mes_actual: number
  mes_anterior: number
  trimestre_actual: number
  anio_actual: number

  // Top donantes
  top_donantes?: {
    donante: Donante
    monto_total: number
    cantidad_donaciones: number
  }[]
}

export interface DonantePagination {
  data: Donante[]
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}

export interface DonacionPagination {
  data: Donacion[]
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}

export interface ReciboPagination {
  data: Recibo[]
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}

export interface DonanteFilters {
  tipo?: string
  search?: string
  monto_min?: number
  monto_max?: number
}

export interface DonacionFilters {
  donante_id?: number
  metodo_pago?: string
  estado?: string
  fecha_desde?: string
  fecha_hasta?: string
  monto_min?: number
  monto_max?: number
  search?: string
}

export interface ReciboFilters {
  donante_id?: number
  fecha_desde?: string
  fecha_hasta?: string
  search?: string
}
