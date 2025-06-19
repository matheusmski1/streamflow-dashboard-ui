'use client'

import { useAuth } from '../hooks/useAuth'

interface AuthLoaderProps {
  children: React.ReactNode
}

export default function AuthLoader({ children }: AuthLoaderProps) {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return <>{children}</>
} 