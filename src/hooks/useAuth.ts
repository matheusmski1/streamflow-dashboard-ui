import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '../store/auth'

// Rotas públicas que não requerem autenticação
const PUBLIC_ROUTES = ['/login']

// Verifica se está em modo de desenvolvimento
const isDevelopment = process.env.NODE_ENV === 'development'

export const useAuth = (requireAuth: boolean = true) => {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    // Em modo de desenvolvimento, permite acesso total
    if (isDevelopment) {
      return
    }

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

    // Se requer autenticação e não está autenticado
    if (requireAuth && !isAuthenticated && !isPublicRoute) {
      router.replace(`/login?redirect=${pathname}`)
      return
    }

    // Se está autenticado e está em uma página pública (login)
    if (isAuthenticated && isPublicRoute) {
      router.replace('/dashboard')
      return
    }
  }, [isAuthenticated, pathname, requireAuth, router])

  return {
    user,
    isAuthenticated,
    isLoading: false, // Sempre false em desenvolvimento
  }
} 