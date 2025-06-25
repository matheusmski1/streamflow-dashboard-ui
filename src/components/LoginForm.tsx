import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { AlertCircle } from 'lucide-react';
import { apiClient } from '@/services/api';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState('');
  const { login, isDevelopmentMode } = useAuth(false);
  const router = useRouter();
  const redirect = router.query.redirect as string || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isDevelopmentMode) {
        // Em desenvolvimento, simula um usuário
        const user = {
          id: 'dev_user_' + Date.now(),
          name: email.split('@')[0],
          email: email,
          role: 'USER' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Simula um token JWT
        const token = 'dev_token_' + Date.now();

        // Chama a função login do contexto
        login(token, user);

        // Redireciona para a página solicitada ou dashboard
        router.push(redirect);
      } else {
        // Login real usando a API
        const response = await apiClient.login({ email, password });
        
        // Token será armazenado via AuthStore (cookie)
        
        // Chama a função login do contexto
        login(response.access_token, response.user);

        // Redireciona para a página solicitada ou dashboard
        router.push(redirect);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isDevelopmentMode) {
        // Em desenvolvimento, simula registro
        setError('Registration is not available in development mode');
        return;
      } else {
        // Registro real usando a API
        const response = await apiClient.register({ name, email, password });
        
        // Token será armazenado via AuthStore (cookie)
        
        // Chama a função login do contexto
        login(response.access_token, response.user);

        // Redireciona para a página solicitada ou dashboard
        router.push(redirect);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {showRegister ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your StreamFlow dashboard
          </p>
        </div>
        
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <form className="mt-6 space-y-6" onSubmit={showRegister ? handleRegister : handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            {showRegister && (
              <div>
                <label htmlFor="name" className="sr-only">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                  showRegister ? (name ? '' : 'rounded-t-md') : 'rounded-t-md'
                } focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : (showRegister ? 'Sign up' : 'Sign in')}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setShowRegister(!showRegister);
                setError('');
                setName('');
                setEmail('');
                setPassword('');
              }}
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              {showRegister 
                ? 'Already have an account? Sign in' 
                : 'Need an account? Sign up'
              }
            </button>
          </div>

          {/* Development notice */}
          {isDevelopmentMode ? (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                <strong>🚧 Development Mode Active:</strong> You can login with any valid email and password (min 6 characters).
                Registration is disabled in development mode.
              </p>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Production Mode:</strong> Connected to backend API. 
                Use real credentials or create a new account.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginForm; 