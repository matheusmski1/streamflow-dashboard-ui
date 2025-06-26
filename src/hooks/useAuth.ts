import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuthStore } from '../store/auth'

const PUBLIC_ROUTES = ['/', '/login']

export const useAuth = (requireAuth: boolean = true) => {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  useEffect(() => {
    const pathname = router.pathname
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

    if (requireAuth && !isAuthenticated && !isPublicRoute) {
      router.replace(`/login?redirect=${pathname}`)
      return
    }

    if (isAuthenticated && isPublicRoute) {
      router.replace('/dashboard')
      return
    }
  }, [isAuthenticated, router.pathname, requireAuth, router])

  return {
    user,
    isAuthenticated,
    isLoading: false,
  }
} 