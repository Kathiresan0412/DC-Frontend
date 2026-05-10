import axios from 'axios'
import type { AxiosError } from 'axios'

export type AppRole = 'admin' | 'manager' | 'employee'
export type UserStatus = 'active' | 'inactive'

export type ProfilePayload = {
  full_name: string
  phone?: string
  bio?: string
  avatar_url?: string
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

export type CustomerStatus = 'Active' | 'Due' | 'New lead'

export type Customer = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  business: string
  plan: string
  status: CustomerStatus
  balance: number
  lastService: string
  created_at?: string
  updated_at?: string
}

export type CustomerPayload = Pick<Customer, 'name' | 'email' | 'phone' | 'address' | 'status' | 'balance'> & Partial<Pick<Customer, 'business' | 'plan' | 'lastService'>>

export type PublicEnquiryPayload = {
  name: string
  email: string
  phone: string
  address: string
  business: string
  service: string
  message?: string
}

export type ServiceStatus = 'Active' | 'Inactive'

export type ServiceOffering = {
  id: string
  name: string
  business: string
  category: string
  description: string
  price: number
  billing: string
  status: ServiceStatus
  includes: string[]
  trustPoints: string[]
  serviceArea: string
  contactPhone: string
  secondaryPhone: string
  email: string
  imageUrl: string
  source: string
  created_at?: string
  updated_at?: string
}

export type ServicePayload = Omit<ServiceOffering, 'id' | 'created_at' | 'updated_at'>

export type InvoiceStatus = 'Draft' | 'Sent' | 'Confirmed' | 'Paid' | 'Due' | 'Overdue'

export type EmailLog = {
  type: 'invoice' | 'payment_slip'
  to: string
  subject: string
  body: string
  sent_at: string
}

export type ProofPayment = {
  payment_id?: string
  method?: string
  totalAmount: number
  paidAmount: number
  receivableAmount: number
  generated_at: string
  notes?: string
}

export type Invoice = {
  id: string
  invoice_id: string
  customerId: string
  customer: string
  email: string
  business: string
  serviceId: string
  service: string
  issued: string
  due: string
  amount: number
  paid: number
  receivable: number
  status: InvoiceStatus
  agreementLink: string
  feedback: string
  confirmed_at?: string
  proofPayment?: ProofPayment
  proofPayments?: ProofPayment[]
  emails: EmailLog[]
  created_at?: string
  updated_at?: string
}

export type InvoicePayload = {
  customerId: string
  serviceId: string
  due: string
  amount: number
  paid?: number
  status?: InvoiceStatus
}

export type Payment = {
  id: string
  payment_id: string
  invoiceId: string
  invoice_id: string
  customerId: string
  customer: string
  email: string
  business: string
  service: string
  method: string
  amount: number
  paid_at: string
  date: string
  notes: string
  created_at?: string
  updated_at?: string
}

export type PaymentPayload = {
  invoiceId: string
  method: string
  amount: number
  paid_at?: string
  notes?: string
}

export type ActivityEntityType = 'auth' | 'profile' | 'user' | 'item' | 'customer' | 'service' | 'invoice' | 'payment'

export type ActivityLog = {
  id: string
  action: string
  entityType: ActivityEntityType
  entityId: string
  entityLabel: string
  summary: string
  details: Record<string, unknown>
  actor: {
    id: string
    name: string
    email: string
    role: AppRole | 'customer' | 'system'
  }
  business?: string
  customerId?: string
  invoiceId?: string
  paymentId?: string
  serviceId?: string
  targetUserId?: string
  created_at: string
}

export type ActivityLogFilters = Partial<{
  query: string
  action: string
  entityType: ActivityEntityType | ''
  business: string
  actorId: string
  customerId: string
  from: string
  to: string
  limit: number
}>

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://dc-backend-plum.vercel.app',
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
    const token = window.localStorage.getItem('primozen_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }

  return config
})

export const authApi = {
  login: (credentials: { email: string; password: string }) => api.post('/api/auth/login', credentials).then(res => res.data),
  bootstrap: (user: { email: string; password: string; full_name: string }) => api.post('/api/auth/bootstrap', user).then(res => res.data),
  changePassword: (password: string, currentPassword: string) => api.post('/api/auth/change-password', { password, currentPassword }).then(res => res.data),
  setSession: (token: string) => {
    window.localStorage.setItem('primozen_token', token)
  },
  clearSession: () => {
    window.localStorage.removeItem('primozen_token')
  },
}

export const inventoryApi = {
  getItems: () => api.get('/api/items').then(res => res.data),
  addItem: (item: InventoryItemPayload) => api.post('/api/items', item).then(res => res.data),
  updateItem: (id: string, updates: InventoryItemPayload) => api.put(`/api/items/${id}`, updates).then(res => res.data),
  deleteItem: (id: string) => api.delete(`/api/items/${id}`).then(res => res.data),
}

export const customerApi = {
  getCustomers: (): Promise<Customer[]> => api.get('/api/customers').then(res => res.data),
  createCustomer: (customer: CustomerPayload): Promise<Customer> => api.post('/api/customers', customer).then(res => res.data),
  updateCustomer: (id: string, updates: Partial<CustomerPayload>): Promise<Customer> => api.put(`/api/customers/${id}`, updates).then(res => res.data),
  deleteCustomer: (id: string) => api.delete(`/api/customers/${id}`).then(res => res.data),
}

export const publicEnquiryApi = {
  create: (enquiry: PublicEnquiryPayload): Promise<Customer> => api.post('/api/public/enquiries', enquiry).then(res => res.data),
}

export const serviceApi = {
  getServices: (): Promise<ServiceOffering[]> => api.get('/api/services').then(res => res.data),
  createService: (service: ServicePayload): Promise<ServiceOffering> => api.post('/api/services', service).then(res => res.data),
  updateService: (id: string, updates: Partial<ServicePayload>): Promise<ServiceOffering> => api.put(`/api/services/${id}`, updates).then(res => res.data),
  deleteService: (id: string) => api.delete(`/api/services/${id}`).then(res => res.data),
}

export const invoiceApi = {
  getInvoices: (): Promise<Invoice[]> => api.get('/api/invoices').then(res => res.data),
  createInvoice: (invoice: InvoicePayload): Promise<Invoice> => api.post('/api/invoices', invoice).then(res => res.data),
  sendInvoice: (id: string): Promise<{ invoice: Invoice; email: EmailLog }> => api.post(`/api/invoices/${id}/send`).then(res => res.data),
  getPublicInvoice: (invoiceId: string): Promise<Invoice> => api.get(`/api/public/invoices/${invoiceId}`).then(res => res.data),
  confirmInvoice: (invoiceId: string, payload: { paidAmount: number; feedback?: string }): Promise<{ invoice: Invoice; email: EmailLog }> =>
    api.post(`/api/public/invoices/${invoiceId}/confirm`, payload).then(res => res.data),
}

export const paymentApi = {
  getPayments: (): Promise<Payment[]> => api.get('/api/payments').then(res => res.data),
  createPayment: (payment: PaymentPayload): Promise<{ payment: Payment; invoice: Invoice }> => api.post('/api/payments', payment).then(res => res.data),
}

export const activityApi = {
  getActivityLogs: (filters: ActivityLogFilters = {}): Promise<ActivityLog[]> => (
    api.get('/api/activity-logs', { params: filters }).then(res => res.data)
  ),
}

export const userApi = {
  getProfile: () => api.get('/api/profile').then(res => res.data),
  updateProfile: (updates: ProfilePayload) => api.put('/api/profile', updates).then(res => res.data),
  getUsers: () => api.get('/api/users').then(res => res.data),
  createUser: (user: CreateUserPayload) => api.post('/api/users', user).then(res => res.data),
  updateUser: (id: string, updates: UpdateUserPayload) => api.patch(`/api/users/${id}`, updates).then(res => res.data),
  deleteUser: (id: string) => api.delete(`/api/users/${id}`).then(res => res.data),
}

export default api
