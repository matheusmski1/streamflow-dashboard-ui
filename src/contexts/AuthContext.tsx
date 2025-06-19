'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../store/auth';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: any) => void;
  logout: () => void;
  isDevelopmentMode: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PUBLIC_ROUTES = ['/login'];

const isDevelopment = process.env.NODE_ENV === 'development';

export function AuthProvider({ children }: { children: ReactNode }) {
  const store = useAuthStore();

  return (
    <AuthContext.Provider 
      value={{ 
        user: store.user, 
        isAuthenticated: store.isAuthenticated, 
        isLoading: store.isLoading,
        login: store.login,
        logout: store.logout,
        isDevelopmentMode: isDevelopment
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(requireAuth: boolean = true) {
  const context = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  if (context.isDevelopmentMode) {
    return context;
  }

  if (!isDevelopment) {
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (requireAuth && !context.isAuthenticated && !isPublicRoute) {
      router.replace(`/login?redirect=${pathname}`);
    }

    if (context.isAuthenticated && isPublicRoute) {
      router.replace('/dashboard');
    }
  }

  return context;
} 