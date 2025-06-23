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
        // Salva o token em localStorage para que possa ser lido pelo frontend
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', token)
        }

        // Também define um cookie para que o backend possa usá-lo se estiver no mesmo domínio
        Cookies.set('access_token', token, {
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        })
        set({ user, isAuthenticated: true, isLoading: false })
      },
      logout: () => {
        Cookies.remove('access_token')
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token')
        }
        set({ user: null, isAuthenticated: false, isLoading: false })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
) 