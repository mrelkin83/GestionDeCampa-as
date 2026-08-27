export interface Donante {
  id: number
  campana_id: number
  tipo: 'persona_natural' | 'persona_juridica'

  // Persona natural
  documento?: string
  tipo_documento?: 'CC' | 'CE' | 'PA' | 'TI'
  nombres?: string
  apellidos?: string

  // Persona jurídica
  nit?: string
  razon_social?: string
  representante_legal?: string

  // Contacto
  email?: string
  telefono?: string
  direccion?: string
  municipio_id?: number

  // Calculado por el backend
  nombre_completo?: string
  total_donado?: number
  numero_donaciones?: number
  fecha_primera_donacion?: string
  fecha_ultima_donacion?: string
  categoria?: string
  notas?: string
  es_valido?: boolean
  razon_invalido?: string
  acepta_publicacion?: boolean

  created_at?: string
  updated_at?: string
}

export interface Donacion {
  id: number
  campana_id: number
  donante_id: number

  // Información de la Donación
  monto: number
  moneda: 'COP' | 'USD'
  tipo: 'efectivo' | 'transferencia' | 'cheque' | 'especie' | 'servicio'
  fecha_donacion: string
  concepto?: string
  numero_comprobante?: string
  numero_cuenta_destino?: string
  descripcion_especie?: string
  valor_estimado_especie?: number

  // Estado
  estado: 'pendiente' | 'confirmada' | 'rechazada' | 'reportada_cne'
  notas?: string
  excede_tope_individual?: boolean
  requiere_validacion?: boolean
  observaciones_validacion?: string

  // Cumplimiento
  reportada_cne?: boolean
  fecha_reporte_cne?: string
  numero_reporte_cne?: string

  // Relaciones
  donante?: Donante

  created_at?: string
  updated_at?: string
}

export interface DonacionPagination {
  data: Donacion[]
  total: number
  per_page: number
  current_page: number
  last_page: number
}

export interface EstadisticasDonaciones {
  resumen: {
    total_recaudado: number
    numero_donaciones: number
    promedio_donacion: number
    efectivo: number
    especie: number
  }
  topes_legales: {
    limite_total: number
    recaudado: number
    disponible: number
    porcentaje_usado: number
    alerta_80: boolean
    alerta_90: boolean
    limite_excedido: boolean
  } | null
  cumplimiento: {
    pendientes_reporte_cne: number
    reportadas_cne: number
  }
  por_tipo: Array<{ tipo: string; cantidad: number; total: number }>
}
