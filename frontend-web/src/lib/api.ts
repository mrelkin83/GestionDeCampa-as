import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor para agregar el token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('auth_token')
      localStorage.removeItem('ws_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  // Solo super_admin puede llamar esto (ver backend-core routes/api.php);
  // no es un auto-registro público.
  register: async (data: {
    email: string
    password: string
    password_confirmation: string
    first_name: string
    last_name: string
    phone?: string
    document_type: 'CC' | 'CE' | 'TI' | 'PAS'
    document_number: string
    role_id: number
  }) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  me: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  updateProfile: async (data: { first_name?: string; last_name?: string; phone?: string }) => {
    const response = await api.put('/auth/profile', data)
    return response.data
  },

  changePassword: async (data: {
    current_password: string
    new_password: string
    new_password_confirmation: string
  }) => {
    const response = await api.put('/auth/password', data)
    return response.data
  },
}

export const rolesAPI = {
  getAll: async () => {
    const response = await api.get('/roles')
    return response.data
  },
}

// Departamentos API
export const departamentosAPI = {
  getAll: async () => {
    const response = await api.get('/electoral/departamentos')
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/electoral/departamentos/${id}`)
    return response.data
  },

  getMunicipios: async (id: number) => {
    const response = await api.get(`/electoral/departamentos/${id}/municipios`)
    return response.data
  },
}

// Votantes API
export const votantesAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/crm/votantes', { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/crm/votantes/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/crm/votantes', data)
    return response.data
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/crm/votantes/${id}`, data)
    return response.data
  },

  registrarContacto: async (id: number, data: any) => {
    const response = await api.post(`/crm/votantes/${id}/contacto`, data)
    return response.data
  },

  getContactos: async (id: number) => {
    const response = await api.get(`/crm/votantes/${id}/contactos`)
    return response.data
  },
}

// Segmentos API
export const segmentosAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/crm/segmentos', { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/crm/segmentos/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/crm/segmentos', data)
    return response.data
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/crm/segmentos/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete(`/crm/segmentos/${id}`)
    return response.data
  },

  getVotantes: async (id: number, params?: any) => {
    const response = await api.get(`/crm/segmentos/${id}/votantes`, { params })
    return response.data
  },

  addVotantes: async (id: number, votantes: number[]) => {
    const response = await api.post(`/crm/segmentos/${id}/votantes`, { votantes })
    return response.data
  },

  removeVotantes: async (id: number, votantes: number[]) => {
    const response = await api.delete(`/crm/segmentos/${id}/votantes`, { data: { votantes } })
    return response.data
  },
}

// Eventos API
export const eventosAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/eventos', { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/eventos/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/eventos', data)
    return response.data
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/eventos/${id}`, data)
    return response.data
  },

  getAsistencias: async (id: number) => {
    const response = await api.get(`/eventos/${id}/asistencias`)
    return response.data
  },
}

// Templates API
export const templatesAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/comunicacion/templates', { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/comunicacion/templates/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/comunicacion/templates', data)
    return response.data
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/comunicacion/templates/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete(`/comunicacion/templates/${id}`)
    return response.data
  },

  preview: async (id: number, votanteId: number) => {
    const response = await api.get(`/comunicacion/templates/${id}/preview/${votanteId}`)
    return response.data
  },
}

// Campañas API
export const campanasAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/comunicacion/campanas', { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/comunicacion/campanas/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/comunicacion/campanas', data)
    return response.data
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/comunicacion/campanas/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete(`/comunicacion/campanas/${id}`)
    return response.data
  },

  enviar: async (id: number) => {
    const response = await api.post(`/comunicacion/campanas/${id}/enviar`)
    return response.data
  },

  programar: async (id: number, fecha: string) => {
    const response = await api.post(`/comunicacion/campanas/${id}/programar`, { fecha_programada: fecha })
    return response.data
  },

  cancelar: async (id: number) => {
    const response = await api.post(`/comunicacion/campanas/${id}/cancelar`)
    return response.data
  },

  estadisticas: async (id: number) => {
    const response = await api.get(`/comunicacion/campanas/${id}/estadisticas`)
    return response.data
  },
}

// Mensajes API
export const mensajesAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/comunicacion/mensajes', { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/comunicacion/mensajes/${id}`)
    return response.data
  },

  reenviar: async (id: number) => {
    const response = await api.post(`/comunicacion/mensajes/${id}/reenviar`)
    return response.data
  },
}

// Donantes API
export const donantesAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/donantes', { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/donantes/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/donantes', data)
    return response.data
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/donantes/${id}`, data)
    return response.data
  },

  // No existe (ni debería existir) un DELETE real de donantes: son
  // registros con historial de donaciones sujeto a reporte ante el CNE.
  // La acción real equivalente en el backend es marcarInvalido.
  marcarInvalido: async (id: number, razon: string) => {
    const response = await api.post(`/donantes/${id}/marcar-invalido`, { razon_invalido: razon })
    return response.data
  },

  getDonaciones: async (id: number, params?: any) => {
    const response = await api.get(`/donantes/${id}/historial`, { params })
    return response.data
  },
}

// Donaciones API
export const donacionesAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/donaciones', { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/donaciones/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/donaciones', data)
    return response.data
  },

  confirmar: async (id: number, numeroComprobante: string) => {
    const response = await api.post(`/donaciones/${id}/confirmar`, { numero_comprobante: numeroComprobante })
    return response.data
  },

  rechazar: async (id: number, motivo?: string) => {
    const response = await api.post(`/donaciones/${id}/rechazar`, { motivo })
    return response.data
  },

  reportarCNE: async (id: number, numeroReporteCne: string) => {
    const response = await api.post(`/donaciones/${id}/reportar-cne`, { numero_reporte_cne: numeroReporteCne })
    return response.data
  },

  estadisticas: async (params?: any) => {
    const response = await api.get('/donaciones/estadisticas', { params })
    return response.data
  },
}

// Gastos API
export const gastosAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/gastos', { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/gastos/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/gastos', data)
    return response.data
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/gastos/${id}`, data)
    return response.data
  },

  aprobar: async (id: number) => {
    const response = await api.post(`/gastos/${id}/aprobar`)
    return response.data
  },

  rechazar: async (id: number, motivo?: string) => {
    const response = await api.post(`/gastos/${id}/rechazar`, { motivo })
    return response.data
  },

  marcarPagado: async (id: number) => {
    const response = await api.post(`/gastos/${id}/pagar`)
    return response.data
  },

  estadisticas: async (params?: any) => {
    const response = await api.get('/gastos/estadisticas', { params })
    return response.data
  },

}

// Analytics API
export const analyticsAPI = {
  // Analytics general - todas las métricas
  general: async (params?: any) => {
    const response = await api.get('/analytics/general', { params })
    return response.data
  },

  // Analytics de votantes
  votantes: async (params?: any) => {
    const response = await api.get('/analytics/votantes', { params })
    return response.data
  },

  // Analytics financiero
  financiero: async (params?: any) => {
    const response = await api.get('/analytics/financiero', { params })
    return response.data
  },

  // Analytics de comunicación
  comunicacion: async (params?: any) => {
    const response = await api.get('/analytics/comunicacion', { params })
    return response.data
  },

  // Analytics de eventos
  eventos: async (params?: any) => {
    const response = await api.get('/analytics/eventos', { params })
    return response.data
  },

  // Resumen ejecutivo
  resumenEjecutivo: async (params?: any) => {
    const response = await api.get('/analytics/resumen-ejecutivo', { params })
    return response.data
  },
}

// Reportes API
export const reportesAPI = {
  getAll: async (campanaId: number) => {
    const response = await api.get('/reportes', { params: { campana_id: campanaId } })
    return response.data
  },

  generar: async (campanaId: number, data: any) => {
    const response = await api.post('/reportes/generar', { ...data, campana_id: campanaId })
    return response.data
  },

  descargar: async (id: number) => {
    const response = await api.get(`/reportes/${id}/descargar`, {
      responseType: 'blob'
    })
    return response.data
  },

  eliminar: async (id: number) => {
    const response = await api.delete(`/reportes/${id}`)
    return response.data
  },
}

export default api
