import axios from 'axios'
import { supabase } from './supabase'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
})

// Interceptor to add Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  
  return config
})

export const inventoryApi = {
  getItems: () => api.get('/api/items').then(res => res.data),
  addItem: (item: any) => api.post('/api/items', item).then(res => res.data),
  updateItem: (id: string, updates: any) => api.put(`/api/items/${id}`, updates).then(res => res.data),
  deleteItem: (id: string) => api.delete(`/api/items/${id}`).then(res => res.data),
}

export const userApi = {
  getProfile: () => api.get('/api/profile').then(res => res.data),
  getUsers: () => api.get('/api/users').then(res => res.data),
}

export default api
