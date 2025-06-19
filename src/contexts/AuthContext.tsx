
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { name: string; email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    // Simulate checking for stored auth token
    const token = localStorage.getItem('auth_token');
    if (token) {
      setIsAuthenticated(true);
      setUser({ name: 'John Doe', email: 'john@example.com' });
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate login
    console.log('Login attempt:', { email, password });
    localStorage.setItem('auth_token', 'mock_jwt_token');
    setIsAuthenticated(true);
    setUser({ name: 'John Doe', email });
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setIsAuthenticated(false);
    setUser(null);
    console.log('User logged out - cookie invalidated');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
