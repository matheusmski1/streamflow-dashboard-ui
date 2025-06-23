import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';

export default function Home() {
  const { isAuthenticated } = useAuth(false);
  const router = useRouter();

  useEffect(() => {
    // Se não está autenticado, redireciona para login
    if (!isAuthenticated) {
      router.replace('/login');
    } else {
      // Se está autenticado, redireciona para dashboard
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Mostra loading enquanto determina o redirecionamento
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  );
} 