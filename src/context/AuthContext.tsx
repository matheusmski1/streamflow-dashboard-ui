import { createContext, ReactNode, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/auth';
import { User, apiClient } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const PUBLIC_ROUTES = ['/', '/login'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const store = useAuthStore();
  const router = useRouter();
  const { user, token, isAuthenticated, logout, setIsLoading } = store;

  useEffect(() => {
    const checkAuth = async () => {
      if (token && !isAuthenticated) {
        try {
          setIsLoading(true);
          await apiClient.verifyToken();
        } catch (error) {
          logout();
          if (!PUBLIC_ROUTES.includes(router.pathname)) {
            router.replace(`/login?redirect=${router.pathname}`);
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    checkAuth();
  }, [user, token, isAuthenticated, logout, setIsLoading, router]);

  const value = {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    login: store.login,
    logout: store.logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 