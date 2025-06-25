import React from 'react';
import Layout from '@/components/Layout';
import CorinthiansTestEvents from '@/components/CorinthiansTestEvents';
import StreamTable from '@/components/StreamTable';

export default function CorinthiansTestPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Corinthians Test Events
          </h1>
          <p className="text-gray-600 mb-8">
            Teste de eventos do Corinthians e streaming em tempo real
          </p>
        </div>
        
        {/* Grid com duas colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna da esquerda - Gerador de Eventos */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🎮 Gerador de Eventos</h2>
            <CorinthiansTestEvents />
          </div>
          
          {/* Coluna da direita - Streaming */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📡 Streaming em Tempo Real</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-4">
                Conecte ao streaming para ver os eventos que chegam via SQS!
              </p>
              <StreamTable />
            </div>
          </div>
        </div>
        
        {/* Instruções */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">🎯 Como usar:</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <p>1. <strong>Conecte ao streaming</strong> clicando em &quot;Connect&quot; na seção de streaming</p>
            <p>2. <strong>Clique em &quot;Simular Partida vs Flamengo&quot;</strong> para gerar eventos</p>
            <p>3. <strong>Os eventos serão enviados para SQS</strong> durante 20 segundos (1 por segundo)</p>
            <p>4. <strong>Veja os eventos aparecerem</strong> no streaming conforme chegam via SQS</p>
            <p>5. <strong>Acompanhe as estatísticas</strong> e logs detalhados</p>
          </div>
        </div>
      </div>
    </Layout>
  );
} 