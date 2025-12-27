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

export default api
