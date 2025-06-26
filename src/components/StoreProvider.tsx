'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'

interface StoreProviderProps {
  children: React.ReactNode
}

export default function StoreProvider({ children }: StoreProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      console.log('🔄 Zustand store hydrated successfully')
      setIsHydrated(true)
    })

    const timeout = setTimeout(() => {
      console.log('⏰ Hydration timeout, marking as hydrated')
    setIsHydrated(true)
    }, 1000)

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return <>{children}</>
} 