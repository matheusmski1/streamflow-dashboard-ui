'use client';

import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../store/auth';
import { apiClient } from '@/lib/api';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  isDevelopmentMode: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PUBLIC_ROUTES = ['/', '/login'];

// Verifica se está em modo de desenvolvimento
const isDevelopment = process.env.NEXT_PUBLIC_DEV_MODE === 'true' || process.env.NODE_ENV === 'development';

export function AuthProvider({ children }: { children: ReactNode }) {
  const store = useAuthStore();
  const router = useRouter();

  // Verifica o token ao inicializar
  useEffect(() => {
    const checkAuth = async () => {
      if (isDevelopment) {
        store.setIsLoading(false); // Garante que não fica em loading
        return; // Em desenvolvimento, não verifica token
      }

      const token = Cookies.get('access_token');
      if (!token) {
        store.logout();
        return;
      }

      try {
        store.setIsLoading(true);
        const response = await apiClient.verifyToken();
        store.login(token, response.user);
      } catch (error) {
        console.error('Token verification failed:', error);
        Cookies.remove('access_token');
        store.logout();
        router.replace('/login');
      } finally {
        store.setIsLoading(false);
      }
    };

    checkAuth();
  }, []); // Executar apenas uma vez na inicialização

  return (
    <AuthContext.Provider 
      value={{ 
        user: store.user, 
        isAuthenticated: store.isAuthenticated, 
        isLoading: store.isLoading,
        login: store.login,
        logout: () => {
          Cookies.remove('access_token');
          store.logout();
          router.replace('/login');
        },
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

  // Sempre chama todos os hooks primeiro (regra dos React Hooks)
  useEffect(() => {
    // Não redireciona em modo de desenvolvimento ou durante loading
    if (context.isDevelopmentMode || context.isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    // Se precisa de autenticação e não está autenticado e não está em rota pública
    if (requireAuth && !context.isAuthenticated && !isPublicRoute) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Se está autenticado e está em rota pública, redireciona para dashboard
    if (context.isAuthenticated && isPublicRoute) {
      router.replace('/dashboard');
      return;
    }
  }, [context.isAuthenticated, context.isLoading, context.isDevelopmentMode, pathname, requireAuth, router]);

  return context;
} 