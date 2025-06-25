import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/auth';
import { apiClient } from '@/services/api';
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
        store.setIsLoading(false);
        return;
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
        router.push('/login');
      } finally {
        store.setIsLoading(false);
      }
    };
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user: store.user, 
        isAuthenticated: store.isAuthenticated, 
        isLoading: store.isLoading,
        login: (token: string, user: User) => {
          console.log('🏪 AuthContext login called with:', { token, user });
          store.login(token, user);
          console.log('🏪 AuthContext state after login:', { 
            isAuthenticated: store.isAuthenticated, 
            user: store.user 
          });
        },
        logout: () => {
          Cookies.remove('access_token');
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