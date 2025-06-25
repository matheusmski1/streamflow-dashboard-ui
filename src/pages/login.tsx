import React from 'react';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/LoginForm';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function LoginPage() {
  const { isAuthenticated } = useAuth(false);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <LoginForm />;
} 