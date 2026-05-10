import axios from 'axios'
import type { AxiosError } from 'axios'

export type AppRole = 'admin' | 'manager' | 'employee'
export type UserStatus = 'active' | 'inactive'

export type ProfilePayload = {
  full_name: string
  phone?: string
  bio?: string
}

export type CreateUserPayload = {
  full_name: string
  email: string
  password: string
  role: AppRole
}

export type UpdateUserPayload = Partial<{
  full_name: string
  role: AppRole
  status: UserStatus
}>

export type InventoryItemPayload = Record<string, unknown>

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
})

export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong') => {
  const axiosError = error as AxiosError<{ error?: string }>

  if (axiosError.response?.data?.error) {
    return axiosError.response.data.error
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('servicehub_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
})

export const authApi = {
  login: (credentials: { email: string; password: string }) => api.post('/api/auth/login', credentials).then(res => res.data),
  bootstrap: (user: { email: string; password: string; full_name: string }) => api.post('/api/auth/bootstrap', user).then(res => res.data),
  changePassword: (password: string) => api.post('/api/auth/change-password', { password }).then(res => res.data),
  setSession: (token: string) => {
    window.localStorage.setItem('servicehub_token', token)
  },
  clearSession: () => {
    window.localStorage.removeItem('servicehub_token')
  },
}

export const inventoryApi = {
  getItems: () => api.get('/api/items').then(res => res.data),
  addItem: (item: InventoryItemPayload) => api.post('/api/items', item).then(res => res.data),
  updateItem: (id: string, updates: InventoryItemPayload) => api.put(`/api/items/${id}`, updates).then(res => res.data),
  deleteItem: (id: string) => api.delete(`/api/items/${id}`).then(res => res.data),
}

export const userApi = {
  getProfile: () => api.get('/api/profile').then(res => res.data),
  updateProfile: (updates: ProfilePayload) => api.put('/api/profile', updates).then(res => res.data),
  getUsers: () => api.get('/api/users').then(res => res.data),
  createUser: (user: CreateUserPayload) => api.post('/api/users', user).then(res => res.data),
  updateUser: (id: string, updates: UpdateUserPayload) => api.patch(`/api/users/${id}`, updates).then(res => res.data),
}

export default api
