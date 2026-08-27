export interface Gasto {
  id: number
  campana_id: number

  categoria: 'publicidad' | 'eventos' | 'logistica' | 'personal' | 'materiales' | 'transporte' | 'servicios_profesionales' | 'otro'
  subcategoria?: string
  descripcion: string
  monto: number
  moneda: 'COP' | 'USD'
  fecha_gasto: string
  fecha_registro?: string

  // Proveedor
  proveedor?: string
  nit_proveedor?: string
  numero_factura?: string

  // Pago
  metodo_pago?: 'efectivo' | 'transferencia' | 'cheque' | 'tarjeta'
  cuenta_bancaria?: string
  numero_comprobante?: string

  // Estado y Aprobación
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'pagado' | 'reportado_cne'
  responsable_id?: number
  aprobado_por_id?: number
  fecha_aprobacion?: string
  notas_aprobacion?: string
  requiere_validacion?: boolean
  observaciones_validacion?: string

  // Cumplimiento
  reportado_cne?: boolean
  fecha_reporte_cne?: string
  numero_reporte_cne?: string

  documentos_soporte?: string[]

  created_at?: string
  updated_at?: string
}

export interface GastoPagination {
  data: Gasto[]
  total: number
  per_page: number
  current_page: number
  last_page: number
}

export interface EstadisticasGastos {
  resumen: {
    total_gastado: number
    numero_gastos: number
    promedio_gasto: number
    pendientes_aprobacion: number
  }
  topes_legales: {
    limite_total: number
    gastado: number
    disponible: number
    porcentaje_usado: number
    alerta_80: boolean
    alerta_90: boolean
    limite_excedido: boolean
  } | null
  cumplimiento: {
    pendientes_reporte_cne: number
    reportados_cne: number
  }
  por_categoria: Array<{ categoria: string; cantidad: number; total: number }>
  por_mes: Array<{ mes: string; total: number }>
}

export interface GastoFilters {
  categoria?: string
  estado?: string
  metodo_pago?: string
  fecha_desde?: string
  fecha_hasta?: string
  search?: string
}
