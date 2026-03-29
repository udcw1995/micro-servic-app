import axios from 'axios'

const authApi = axios.create({ baseURL: '/api/auth' })

function createAuthenticatedApi(baseURL: string) {
  const api = axios.create({ baseURL })

  api.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  })

  api.interceptors.response.use(
    (res) => res,
    async (err) => {
      if (err.response?.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          try {
            const { data } = await authApi.post('/refresh', { token: refreshToken })
            localStorage.setItem('accessToken', data.accessToken)
            err.config.headers.Authorization = `Bearer ${data.accessToken}`
            return api.request(err.config)
          } catch {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
          }
        }
      }
      return Promise.reject(err)
    }
  )

  return api
}

const userApi = createAuthenticatedApi('/api/users')
const roleApi = createAuthenticatedApi('/api/roles')

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  roleId?: string | null
  role?: { id: string; name: string } | null
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface RolePrivileges {
  [key: string]: boolean
}

export interface Role {
  id: string
  name: string
  privileges: RolePrivileges
  createdAt?: string
  updatedAt?: string
}

export interface UpdateUserPayload {
  firstName?: string
  lastName?: string
  email?: string
  roleId?: string | null
}

export const authService = {
  register: (payload: RegisterPayload) =>
    authApi.post<User>('/register', payload).then((r) => r.data),

  login: (payload: LoginPayload) =>
    authApi.post<AuthResponse>('/login', payload).then((r) => r.data),
}

export const userService = {
  getAll: () => userApi.get<User[]>('/').then((r) => r.data),
  getById: (id: string) => userApi.get<User>(`/${id}`).then((r) => r.data),
  update: (id: string, payload: UpdateUserPayload) =>
    userApi.put<User>(`/${id}`, payload).then((r) => r.data),
  delete: (id: string) => userApi.delete(`/${id}`).then((r) => r.data),
}

export const roleService = {
  getAll: () => roleApi.get<Role[]>('/').then((r) => r.data),
  getById: (id: string) => roleApi.get<Role>(`/${id}`).then((r) => r.data),
  create: (payload: { name: string; privileges: RolePrivileges }) =>
    roleApi.post<Role>('/', payload).then((r) => r.data),
  update: (id: string, payload: Partial<{ name: string; privileges: RolePrivileges }>) =>
    roleApi.put<Role>(`/${id}`, payload).then((r) => r.data),
  delete: (id: string) => roleApi.delete(`/${id}`).then((r) => r.data),
}
