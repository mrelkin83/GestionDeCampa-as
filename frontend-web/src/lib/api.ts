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

  register: async (data: {
    name: string
    email: string
    password: string
    password_confirmation: string
    phone?: string
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

  delete: async (id: number) => {
    const response = await api.delete(`/crm/votantes/${id}`)
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

  delete: async (id: number) => {
    const response = await api.delete(`/eventos/${id}`)
    return response.data
  },
}

// Templates API
export const templatesAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/communication/templates', { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/communication/templates/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/communication/templates', data)
    return response.data
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/communication/templates/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete(`/communication/templates/${id}`)
    return response.data
  },

  preview: async (id: number, votanteId: number) => {
    const response = await api.get(`/communication/templates/${id}/preview/${votanteId}`)
    return response.data
  },
}

// Campañas API
export const campanasAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/communication/campanas', { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/communication/campanas/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/communication/campanas', data)
    return response.data
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/communication/campanas/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete(`/communication/campanas/${id}`)
    return response.data
  },

  enviar: async (id: number) => {
    const response = await api.post(`/communication/campanas/${id}/enviar`)
    return response.data
  },

  programar: async (id: number, fecha: string) => {
    const response = await api.post(`/communication/campanas/${id}/programar`, { fecha_programada: fecha })
    return response.data
  },

  cancelar: async (id: number) => {
    const response = await api.post(`/communication/campanas/${id}/cancelar`)
    return response.data
  },

  estadisticas: async (id: number) => {
    const response = await api.get(`/communication/campanas/${id}/estadisticas`)
    return response.data
  },

  mensajes: async (id: number, params?: any) => {
    const response = await api.get(`/communication/campanas/${id}/mensajes`, { params })
    return response.data
  },
}

// Mensajes API
export const mensajesAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/communication/mensajes', { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/communication/mensajes/${id}`)
    return response.data
  },

  reenviar: async (id: number) => {
    const response = await api.post(`/communication/mensajes/${id}/reenviar`)
    return response.data
  },
}

// Donantes API
export const donantesAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/donaciones/donantes', { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/donaciones/donantes/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/donaciones/donantes', data)
    return response.data
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/donaciones/donantes/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete(`/donaciones/donantes/${id}`)
    return response.data
  },

  getDonaciones: async (id: number, params?: any) => {
    const response = await api.get(`/donaciones/donantes/${id}/donaciones`, { params })
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

  update: async (id: number, data: any) => {
    const response = await api.put(`/donaciones/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete(`/donaciones/${id}`)
    return response.data
  },

  confirmar: async (id: number) => {
    const response = await api.post(`/donaciones/${id}/confirmar`)
    return response.data
  },

  rechazar: async (id: number, motivo?: string) => {
    const response = await api.post(`/donaciones/${id}/rechazar`, { motivo })
    return response.data
  },

  generarRecibo: async (id: number) => {
    const response = await api.post(`/donaciones/${id}/recibo`)
    return response.data
  },

  estadisticas: async (params?: any) => {
    const response = await api.get('/donaciones/estadisticas', { params })
    return response.data
  },
}

// Recibos API
export const recibosAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/donaciones/recibos', { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/donaciones/recibos/${id}`)
    return response.data
  },

  descargar: async (id: number) => {
    const response = await api.get(`/donaciones/recibos/${id}/pdf`, {
      responseType: 'blob'
    })
    return response.data
  },

  regenerar: async (id: number) => {
    const response = await api.post(`/donaciones/recibos/${id}/regenerar`)
    return response.data
  },
}

// Categorías de Gasto API
export const categoriasGastoAPI = {
  getAll: async (params?: any) => {
    const response = await api.get('/gastos/categorias', { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/gastos/categorias/${id}`)
    return response.data
  },

  create: async (data: any) => {
    const response = await api.post('/gastos/categorias', data)
    return response.data
  },

  update: async (id: number, data: any) => {
    const response = await api.put(`/gastos/categorias/${id}`, data)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete(`/gastos/categorias/${id}`)
    return response.data
  },

  presupuesto: async () => {
    const response = await api.get('/gastos/categorias/presupuesto')
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

  delete: async (id: number) => {
    const response = await api.delete(`/gastos/${id}`)
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

  uploadRecibo: async (id: number, file: File) => {
    const formData = new FormData()
    formData.append('recibo', file)
    const response = await api.post(`/gastos/${id}/recibo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
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
  getAll: async (params?: any) => {
    const response = await api.get('/reportes', { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/reportes/${id}`)
    return response.data
  },

  generar: async (data: any) => {
    const response = await api.post('/reportes/generar', data)
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

  plantillas: async () => {
    const response = await api.get('/reportes/plantillas')
    return response.data
  },
}

export default api
