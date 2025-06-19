
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ExternalLink, ArrowLeft, Book } from 'lucide-react';

const Docs: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Proteção de rota
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft size={20} />
              <span>Voltar ao Dashboard</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Documentação da API</h1>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Informações sobre a documentação */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start space-x-4">
              <Book className="text-blue-600 mt-1" size={24} />
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Swagger UI - Documentação Interativa
                </h2>
                <p className="text-gray-600 mb-4">
                  Explore todos os endpoints da API, teste requisições e veja as respostas em tempo real.
                  A documentação é gerada automaticamente pelo NestJS.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                  <h3 className="font-medium text-blue-900 mb-2">Endpoints Disponíveis:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <span className="font-mono">POST /api/auth/login</span> - Autenticação de usuário</li>
                    <li>• <span className="font-mono">POST /api/auth/logout</span> - Logout e invalidação de cookie</li>
                    <li>• <span className="font-mono">GET /api/stream</span> - Server-Sent Events stream</li>
                    <li>• <span className="font-mono">GET /api/orders</span> - Listar pedidos (paginado)</li>
                    <li>• <span className="font-mono">POST /api/orders</span> - Criar novo pedido</li>
                    <li>• <span className="font-mono">PUT /api/orders/:id</span> - Atualizar pedido</li>
                    <li>• <span className="font-mono">DELETE /api/orders/:id</span> - Deletar pedido</li>
                  </ul>
                </div>
                <div className="flex space-x-4">
                  <a
                    href="/api/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    <ExternalLink size={16} />
                    <span>Abrir Swagger UI</span>
                  </a>
                  <button
                    onClick={() => window.open('/api/docs', '_blank')}
                    className="inline-flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    <Book size={16} />
                    <span>Nova Aba</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Iframe incorporado (opcional) */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Preview da Documentação</h3>
              <p className="text-sm text-gray-600">
                Documentação interativa incorporada (simulada)
              </p>
            </div>
            
            <div className="p-6">
              <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Book size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  Swagger UI Integration
                </h3>
                <p className="text-gray-600 mb-4">
                  Em um ambiente real, aqui seria exibido o Swagger UI incorporado via iframe
                  apontando para <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">/api/docs</span>
                </p>
                <div className="bg-white border border-gray-200 rounded-md p-4 text-left max-w-md mx-auto">
                  <h4 className="font-medium text-gray-800 mb-2">Exemplo de iframe:</h4>
                  <code className="text-xs text-gray-600 block">
                    {`<iframe 
  src="/api/docs" 
  width="100%" 
  height="600px"
  frameBorder="0">
</iframe>`}
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Links úteis */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Links Rápidos</h4>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="block text-blue-600 hover:text-blue-800 text-sm"
                >
                  → Dashboard Principal
                </button>
                <button
                  onClick={() => navigate('/orders')}
                  className="block text-blue-600 hover:text-blue-800 text-sm"
                >
                  → Gerenciar Pedidos
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Recursos</h4>
              <div className="space-y-2">
                <a
                  href="https://swagger.io/tools/swagger-ui/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:text-blue-800 text-sm"
                >
                  → Sobre o Swagger UI
                </a>
                <a
                  href="https://docs.nestjs.com/openapi/introduction"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:text-blue-800 text-sm"
                >
                  → NestJS OpenAPI
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Docs;
