
import React from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import Dashboard from '../components/Dashboard';
import LoginForm from '../components/LoginForm';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Dashboard /> : <LoginForm />;
};

const Index: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
