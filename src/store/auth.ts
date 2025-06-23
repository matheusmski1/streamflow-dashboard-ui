import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'

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
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setIsAuthenticated: (value: boolean) => void
  setIsLoading: (value: boolean) => void
  login: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false, // Começa como false em desenvolvimento
      setUser: (user) => set({ user }),
      setIsAuthenticated: (value) => set({ isAuthenticated: value }),
      setIsLoading: (value) => set({ isLoading: value }),
      login: (token, user) => {
        // Salva o token apenas em cookie (parte do teste)
        set({ user, isAuthenticated: true, isLoading: false })
      },
      logout: () => {
        Cookies.remove('access_token')
        set({ user: null, isAuthenticated: false, isLoading: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        // NÃO persiste isAuthenticated para evitar hidratação incorreta
        // isAuthenticated: state.isAuthenticated 
      }),
    }
  )
) 