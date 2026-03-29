import axios from 'axios'

const authApi = axios.create({ baseURL: '/api/auth' })
const userApi = axios.create({ baseURL: '/api/users' })

// Attach access token to every user-service request
userApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
userApi.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const { data } = await authApi.post('/refresh', { token: refreshToken })
          localStorage.setItem('accessToken', data.accessToken)
          err.config.headers.Authorization = `Bearer ${data.accessToken}`
          return userApi.request(err.config)
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
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
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
  update: (id: string, payload: Partial<Omit<User, 'id'>>) =>
    userApi.put<User>(`/${id}`, payload).then((r) => r.data),
  delete: (id: string) => userApi.delete(`/${id}`).then((r) => r.data),
}
