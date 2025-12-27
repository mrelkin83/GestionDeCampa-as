export interface CategoriaGasto {
  id: number
  campana_id: number
  nombre: string
  descripcion?: string
  color: string // Hex color para visualización
  icono?: string
  presupuesto_asignado: number
  gasto_actual?: number
  porcentaje_usado?: number
  activa: boolean
  created_at?: string
  updated_at?: string
}

export interface Gasto {
  id: number
  campana_id: number
  categoria_id: number

  // Información del Gasto
  concepto: string
  descripcion?: string
  monto: number
  fecha_gasto: string

  // Proveedor / Beneficiario
  proveedor?: string
  nit_proveedor?: string
  contacto_proveedor?: string

  // Pago
  metodo_pago: 'efectivo' | 'transferencia' | 'tarjeta_credito' | 'tarjeta_debito' | 'cheque' | 'otro'
  numero_factura?: string
  numero_comprobante?: string
  recibo_url?: string // URL del archivo adjunto

  // Estado y Aprobación
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'pagado'
  requiere_aprobacion: boolean
  aprobado: boolean
  aprobado_por?: number // user_id
  fecha_aprobacion?: string
  motivo_rechazo?: string

  observaciones?: string

  // Relaciones
  categoria?: CategoriaGasto

  created_at?: string
  updated_at?: string
}

export interface PresupuestoCategoria {
  categoria_id: number
  categoria_nombre: string
  categoria_color: string
  presupuesto_asignado: number
  gasto_ejecutado: number
  disponible: number
  porcentaje_ejecutado: number
  numero_gastos: number
  excede_presupuesto: boolean
}

export interface EstadisticasGastos {
  // Totales
  total_gastos: number
  monto_total: number
  presupuesto_total: number
  ejecutado_total: number
  disponible_total: number
  porcentaje_ejecutado: number

  // Por estado
  pendientes: number
  aprobados: number
  rechazados: number
  pagados: number

  // Por periodo
  mes_actual: number
  mes_anterior: number
  trimestre_actual: number
  anio_actual: number

  // Por categoría (top 5)
  por_categoria?: PresupuestoCategoria[]

  // Alertas
  categorias_sobre_presupuesto: number
  gastos_pendientes_aprobacion: number
}

export interface GastoPagination {
  data: Gasto[]
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}

export interface CategoriaGastoPagination {
  data: CategoriaGasto[]
  total: number
  per_page: number
  current_page: number
  last_page: number
  from: number
  to: number
}

export interface GastoFilters {
  categoria_id?: number
  estado?: string
  metodo_pago?: string
  fecha_desde?: string
  fecha_hasta?: string
  monto_min?: number
  monto_max?: number
  search?: string
}

export interface CategoriaGastoFilters {
  activa?: boolean
  search?: string
}
