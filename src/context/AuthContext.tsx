import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/auth';
import { apiClient } from '@/services/api';

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
      // Em desenvolvimento, permite acesso total
      if (isDevelopment) {
        store.setIsLoading(false);
        return;
      }

      // Se já tem user, token e isAuthenticated no store, verifica se o token ainda é válido
      if (store.user && store.token && store.isAuthenticated) {
        try {
          store.setIsLoading(true);
          await apiClient.verifyToken();
          store.setIsLoading(false);
        } catch (error) {
          console.error('Token verification failed:', error);
          store.logout();
          router.push('/login');
        }
        return;
      }

      // Se não tem dados completos, faz logout
      store.logout();
      store.setIsLoading(false);
    };

    // Aguarda um pouco para garantir que o store foi hidratado
    const timeout = setTimeout(checkAuth, 100);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user: store.user, 
        isAuthenticated: store.isAuthenticated, 
        isLoading: store.isLoading,
        login: (token: string, user: User) => {
          store.login(token, user);
        },
        logout: () => {
          store.logout();
          router.push('/login');
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

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
} 