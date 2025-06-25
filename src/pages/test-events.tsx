import React from 'react';
import Layout from '@/components/Layout';
import OrdersTestEvents from '@/components/OrdersTestEvents';
import StreamTable from '@/components/StreamTable';
import { Zap, Activity, BarChart3 } from 'lucide-react';

export default function TestEventsPage() {
  return (
    <Layout title="Live Streaming Test">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center space-x-3 mb-2">
            <Zap className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Live Streaming Test</h1>
          </div>
          <p className="text-blue-100 text-lg">
            Teste o sistema de streaming em tempo real com dados simulados
          </p>
        </div>

        {/* Main Content - Streaming First */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Streaming Section - Takes 2/3 of the space */}
          <div className="xl:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-6 h-6 text-blue-600" />
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">📡 Live Event Stream</h2>
                      <p className="text-sm text-gray-600">Eventos em tempo real via Server-Sent Events</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-600">Live</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <StreamTable />
              </div>
            </div>
          </div>

          {/* Control Panel - Takes 1/3 of the space */}
          <div className="space-y-4">
            {/* Event Generator */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-green-50">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">⚙️ Event Generator</h3>
                    <p className="text-sm text-gray-600">Gere dados de teste</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <OrdersTestEvents />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-purple-50">
                <h3 className="text-lg font-semibold text-gray-900">📊 Quick Stats</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Events Generated</p>
                    <p className="text-2xl font-bold text-blue-600">0</p>
                  </div>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Activity className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-green-900">Events Sent</p>
                    <p className="text-2xl font-bold text-green-600">0</p>
                  </div>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-purple-900">Stream Status</p>
                    <p className="text-lg font-semibold text-purple-600">Ready</p>
                  </div>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <div className="w-5 h-5 bg-purple-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">🚀 Como usar</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
              <div>
                <p className="font-medium">Conecte ao Stream</p>
                <p className="text-blue-700">Clique em &quot;Connect&quot; no painel de streaming para iniciar a conexão SSE</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
              <div>
                <p className="font-medium">Gere Eventos</p>
                <p className="text-blue-700">Use o gerador para criar 10 orders de teste com dados aleatórios</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
              <div>
                <p className="font-medium">Envie para SQS</p>
                <p className="text-blue-700">Envie as orders para o SQS e veja aparecerem no stream em tempo real</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 