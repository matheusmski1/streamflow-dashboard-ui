import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setIsAuthenticated: (value: boolean) => void
  setIsLoading: (value: boolean) => void
  login: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setIsAuthenticated: (value) => set({ isAuthenticated: value }),
      setIsLoading: (value) => set({ isLoading: value }),
      login: (token, user) => {
        set({ user, token, isAuthenticated: true, isLoading: false })
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
) 