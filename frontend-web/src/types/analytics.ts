// Analytics - Tipos para módulo de análisis y reportes

export interface SeriesTemporal {
  fecha: string
  valor: number
  label?: string
}

export interface DistribucionItem {
  nombre: string
  valor: number
  porcentaje: number
  color?: string
  [key: string]: string | number | undefined
}

export interface MetricaComparativa {
  periodo_actual: number
  periodo_anterior: number
  cambio_absoluto: number
  cambio_porcentual: number
  tendencia: 'subiendo' | 'bajando' | 'estable'
}

export interface AnalyticsVotantes {
  total_votantes: number
  nuevos_mes_actual: number
  tasa_crecimiento: MetricaComparativa
  distribucion_por_departamento: DistribucionItem[]
  distribucion_por_genero: DistribucionItem[]
  distribucion_por_rango_edad: DistribucionItem[]
  evolucion_mensual: SeriesTemporal[]
  segmentos_mas_grandes: {
    segmento_id: number
    nombre: string
    total_votantes: number
    porcentaje: number
  }[]
}

export interface AnalyticsFinanciero {
  total_ingresos: number
  total_egresos: number
  balance_actual: number
  tasa_quemado: number // Burn rate
  proyeccion_agotamiento?: string // Fecha estimada

  ingresos_por_mes: SeriesTemporal[]
  egresos_por_mes: SeriesTemporal[]
  balance_acumulado: SeriesTemporal[]

  donaciones_por_tipo: DistribucionItem[]
  gastos_por_categoria: DistribucionItem[]

  top_donantes: {
    donante_id: number
    nombre: string
    total_donado: number
    numero_donaciones: number
  }[]

  gastos_pendientes_pago: number
  donaciones_por_confirmar: number
}

export interface AnalyticsComunicacion {
  total_mensajes_enviados: number
  total_destinatarios_unicos: number
  tasa_entrega_promedio: number
  tasa_apertura_promedio?: number

  mensajes_por_canal: DistribucionItem[]
  mensajes_por_mes: SeriesTemporal[]

  campanas_activas: number
  campanas_completadas: number

  rendimiento_por_segmento: {
    segmento_id: number
    nombre: string
    enviados: number
    entregados: number
    tasa_entrega: number
  }[]
}

export interface AnalyticsEventos {
  total_eventos: number
  eventos_proximos: number
  eventos_completados: number
  tasa_asistencia_promedio: number

  eventos_por_tipo: DistribucionItem[]
  eventos_por_mes: SeriesTemporal[]
  asistencia_promedio_por_tipo: {
    tipo: string
    promedio_asistentes: number
    total_eventos: number
  }[]

  eventos_mayor_asistencia: {
    evento_id: number
    nombre: string
    fecha: string
    total_asistentes: number
    tasa_asistencia: number
  }[]
}

export interface AnalyticsGeneral {
  votantes: AnalyticsVotantes
  financiero: AnalyticsFinanciero
  comunicacion: AnalyticsComunicacion
  eventos: AnalyticsEventos

  resumen_ejecutivo: {
    base_votantes: MetricaComparativa
    recaudacion: MetricaComparativa
    alcance_comunicacion: MetricaComparativa
    participacion_eventos: MetricaComparativa
  }
}

export interface FiltrosAnalytics {
  fecha_inicio?: string
  fecha_fin?: string
  departamento_id?: number
  municipio_id?: number
  segmento_id?: number
  categoria_gasto_id?: number
  tipo_evento?: string
  canal_comunicacion?: string
}

export interface ReporteExportable {
  id: number
  tipo: 'votantes' | 'financiero' | 'comunicacion' | 'eventos' | 'general'
  nombre: string
  descripcion?: string
  formato: 'pdf' | 'excel' | 'csv'
  filtros: FiltrosAnalytics
  generado_por: number
  fecha_generacion: string
  url_descarga?: string
  estado: 'generando' | 'completado' | 'error'
}

export interface ConfiguracionReporte {
  tipo: ReporteExportable['tipo']
  nombre: string
  descripcion?: string
  formato: ReporteExportable['formato']
  filtros: FiltrosAnalytics
  incluir_graficos: boolean
  incluir_tablas_detalle: boolean
  incluir_comparativas: boolean
}
