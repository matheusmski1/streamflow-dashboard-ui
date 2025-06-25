'use client';

import React, { useState } from 'react';
import { Zap, Circle, Trophy, Users, Target, RefreshCw, Package } from 'lucide-react';
import { StreamEvent, apiClient } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface CorinthiansEvent {
  id: string;
  timestamp: string;
  eventType: 'USER_ACTION' | 'SYSTEM_EVENT' | 'ERROR' | 'WARNING';
  userId: string;
  action: string;
  value: number;
  location: string;
  createdAt: string;
}

interface MatchEvent {
  minute: number;
  event: string;
  type: 'USER_ACTION' | 'SYSTEM_EVENT' | 'ERROR' | 'WARNING';
  value: number;
  description: string;
}

const CorinthiansTestEvents: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<CorinthiansEvent[]>([]);
  const [generationCount, setGenerationCount] = useState(0);
  const [isSimulatingMatch, setIsSimulatingMatch] = useState(false);
  const { user } = useAuth();

  // Dados temáticos do Corinthians
  const corinthiansData = {
    players: [
      'Hugo Souza', 'Matheus Donelli', 'Felipe Longo', 'Kauê', 'Matheuzinho',
      'Félix Torres', 'André Ramalho', 'Diego Palacios', 'Matheus Bidu', 'Cacá',
      'Gustavo Henrique', 'João Pedro', 'Léo Mana', 'Giovane', 'Charles',
      'Ryan', 'Maycon', 'Rodrigo Garro', 'Raniele', 'André Carrillo',
      'Igor Coronado', 'Talles Magno', 'Ángel Romero', 'Kayke', 'Yuri Alberto',
      'Memphis Depay', 'Héctor Hernández'
    ],
    actions: [
      'gol_marcado', 'assistencia', 'defesa_importante', 'cartao_amarelo', 'cartao_vermelho',
      'substituicao', 'falta_cometida', 'falta_sofrida', 'chute_no_gol', 'chute_para_fora',
      'cruzamento', 'escanteio', 'passe_certo', 'passe_errado', 'drible_bem_sucedido',
      'interceptacao', 'saida_do_gol', 'defesa_milagrosa', 'gol_perdido', 'gol_contra'
    ],
    locations: [
      'Neo Química Arena', 'Morumbi', 'Pacaembu', 'Itaquera', 'Vila Belmiro',
      'Allianz Parque', 'Maracanã', 'Mineirão', 'Beira-Rio', 'Arena do Grêmio',
      'Arena Corinthians', 'Centro de Treinamento', 'Vila Capanema', 'Estádio do Corinthians'
    ],
    events: [
      'partida_iniciada', 'intervalo', 'partida_finalizada', 'vitória', 'derrota',
      'empate', 'classificacao_libertadores', 'classificacao_sulamericana', 'rebaixamento',
      'campeonato_brasileiro', 'copa_do_brasil', 'libertadores', 'mundial', 'paulista'
    ]
  };

  // Dados do Flamengo para a partida
  const flamengoData = {
    players: [
      'Rossi', 'Wesley', 'Fabrício Bruno', 'Léo Pereira', 'Ayrton Lucas',
      'Allan', 'Gerson', 'Arrascaeta', 'Everton Ribeiro', 'Pedro', 'Gabigol',
      'Matheus Cunha', 'Varela', 'David Luiz', 'Cleiton', 'Thiago Maia',
      'Victor Hugo', 'Luiz Araújo', 'Bruno Henrique', 'Marinho', 'Matheus França'
    ]
  };

  // Eventos cronológicos de uma partida
  const matchEvents: MatchEvent[] = [
    { minute: 0, event: 'partida_iniciada', type: 'SYSTEM_EVENT', value: 1, description: 'Apito inicial - Corinthians vs Flamengo' },
    { minute: 2, event: 'falta_cometida', type: 'USER_ACTION', value: 1, description: 'Falta de Rodrigo Garro em Arrascaeta' },
    { minute: 5, event: 'chute_no_gol', type: 'USER_ACTION', value: 1, description: 'Chute de Yuri Alberto defendido por Rossi' },
    { minute: 8, event: 'cartao_amarelo', type: 'WARNING', value: 1, description: 'Cartão amarelo para Félix Torres' },
    { minute: 12, event: 'gol_marcado', type: 'USER_ACTION', value: 1, description: 'GOL DO CORINTHIANS! Yuri Alberto (assistência: Rodrigo Garro)' },
    { minute: 15, event: 'assistencia', type: 'USER_ACTION', value: 1, description: 'Assistência de Rodrigo Garro para o gol' },
    { minute: 18, event: 'defesa_importante', type: 'USER_ACTION', value: 1, description: 'Defesa milagrosa de Hugo Souza em Gabigol' },
    { minute: 22, event: 'falta_sofrida', type: 'USER_ACTION', value: 1, description: 'Falta sofrida por Yuri Alberto' },
    { minute: 25, event: 'escanteio', type: 'USER_ACTION', value: 1, description: 'Escanteio a favor do Corinthians' },
    { minute: 28, event: 'chute_para_fora', type: 'USER_ACTION', value: 1, description: 'Chute de Memphis Depay para fora' },
    { minute: 32, event: 'gol_marcado', type: 'USER_ACTION', value: 1, description: 'GOL DO FLAMENGO! Gabigol (assistência: Arrascaeta)' },
    { minute: 35, event: 'cartao_amarelo', type: 'WARNING', value: 1, description: 'Cartão amarelo para André Ramalho' },
    { minute: 38, event: 'substituicao', type: 'SYSTEM_EVENT', value: 1, description: 'Substituição: Charles sai, Raniele entra' },
    { minute: 42, event: 'defesa_importante', type: 'USER_ACTION', value: 1, description: 'Defesa de Félix Torres em Pedro' },
    { minute: 45, event: 'intervalo', type: 'SYSTEM_EVENT', value: 1, description: 'Fim do primeiro tempo - Corinthians 1 x 1 Flamengo' },
    { minute: 47, event: 'partida_iniciada', type: 'SYSTEM_EVENT', value: 1, description: 'Início do segundo tempo' },
    { minute: 50, event: 'chute_no_gol', type: 'USER_ACTION', value: 1, description: 'Chute de Ángel Romero defendido por Rossi' },
    { minute: 53, event: 'gol_marcado', type: 'USER_ACTION', value: 1, description: 'GOL DO CORINTHIANS! Memphis Depay (assistência: Ángel Romero)' },
    { minute: 55, event: 'assistencia', type: 'USER_ACTION', value: 1, description: 'Assistência de Ángel Romero para o gol' },
    { minute: 58, event: 'cartao_vermelho', type: 'ERROR', value: 1, description: 'Cartão vermelho para Félix Torres' },
    { minute: 60, event: 'substituicao', type: 'SYSTEM_EVENT', value: 1, description: 'Substituição: Yuri Alberto sai, Kayke entra' },
    { minute: 65, event: 'defesa_milagrosa', type: 'USER_ACTION', value: 1, description: 'Defesa milagrosa de Hugo Souza em Arrascaeta' },
    { minute: 68, event: 'gol_perdido', type: 'USER_ACTION', value: 1, description: 'Gol perdido por Kayke' },
    { minute: 72, event: 'substituicao', type: 'SYSTEM_EVENT', value: 1, description: 'Substituição: Memphis Depay sai, Igor Coronado entra' },
    { minute: 75, event: 'gol_marcado', type: 'USER_ACTION', value: 1, description: 'GOL DO FLAMENGO! Pedro (assistência: Everton Ribeiro)' },
    { minute: 78, event: 'cartao_amarelo', type: 'WARNING', value: 1, description: 'Cartão amarelo para Diego Palacios' },
    { minute: 82, event: 'defesa_importante', type: 'USER_ACTION', value: 1, description: 'Defesa de André Ramalho em Gabigol' },
    { minute: 85, event: 'substituicao', type: 'SYSTEM_EVENT', value: 1, description: 'Substituição: Rodrigo Garro sai, Maycon entra' },
    { minute: 88, event: 'chute_para_fora', type: 'USER_ACTION', value: 1, description: 'Chute de Igor Coronado para fora' },
    { minute: 90, event: 'partida_finalizada', type: 'SYSTEM_EVENT', value: 1, description: 'Fim da partida - Corinthians 2 x 2 Flamengo' },
    { minute: 91, event: 'empate', type: 'SYSTEM_EVENT', value: 1, description: 'Resultado final: Empate 2x2' }
  ];

  const generateCorinthiansEvent = (): CorinthiansEvent => {
    const eventTypes: Array<'USER_ACTION' | 'SYSTEM_EVENT' | 'ERROR' | 'WARNING'> = [
      'USER_ACTION', 'SYSTEM_EVENT', 'ERROR', 'WARNING'
    ];
    
    const randomEventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const randomPlayer = corinthiansData.players[Math.floor(Math.random() * corinthiansData.players.length)];
    const randomAction = corinthiansData.actions[Math.floor(Math.random() * corinthiansData.actions.length)];
    const randomLocation = corinthiansData.locations[Math.floor(Math.random() * corinthiansData.locations.length)];
    const randomEvent = corinthiansData.events[Math.floor(Math.random() * corinthiansData.events.length)];
    
    // Valores baseados no tipo de evento
    let value = 0;
    let action = '';
    
    switch (randomEventType) {
      case 'USER_ACTION':
        action = `${randomPlayer}_${randomAction}`;
        value = Math.floor(Math.random() * 100) + 1;
        break;
      case 'SYSTEM_EVENT':
        action = randomEvent;
        value = Math.floor(Math.random() * 10) + 1;
        break;
      case 'ERROR':
        action = `erro_${randomAction}`;
        value = Math.floor(Math.random() * 500) + 100;
        break;
      case 'WARNING':
        action = `aviso_${randomAction}`;
        value = Math.floor(Math.random() * 50) + 10;
        break;
    }

    return {
      id: `corinthians-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      eventType: randomEventType,
      userId: user?.id || 'corinthians-fan',
      action,
      value,
      location: randomLocation,
      createdAt: new Date().toISOString()
    };
  };

  const generateTestEvents = async () => {
    setIsGenerating(true);
    console.log('⚽ CorinthiansTestEvents: Starting event generation...');
    
    try {
      const events: CorinthiansEvent[] = [];
      
      // Gera 10 eventos com delay para simular tempo real
      for (let i = 0; i < 10; i++) {
        const event = generateCorinthiansEvent();
        events.push(event);
        
        console.log(`⚽ CorinthiansTestEvents: Generated event ${i + 1}/10:`, event);
        
        // Pequeno delay entre eventos para simular tempo real
        if (i < 9) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      setLastGenerated(events);
      setGenerationCount(prev => prev + 1);
      
      console.log('⚽ CorinthiansTestEvents: All events generated successfully:', events);
      
      // Tenta enviar os eventos para o backend (se disponível)
      try {
        console.log('⚽ CorinthiansTestEvents: Attempting to send events to backend...');
        
        // Aqui você pode implementar a lógica para enviar os eventos
        // Por exemplo, fazer uma chamada POST para um endpoint que simula o streaming
        // const response = await fetch('/api/test-events', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(events)
        // });
        
        // Por enquanto, vamos apenas simular o envio
        console.log('⚽ CorinthiansTestEvents: Events would be sent to backend:', events.length, 'events');
        
        // Simula o envio para o stream (você pode implementar isso depois)
        events.forEach((event, index) => {
          setTimeout(() => {
            console.log(`⚽ CorinthiansTestEvents: Simulating stream event ${index + 1}:`, event);
            // Aqui você pode disparar um evento customizado ou integrar com o sistema de streaming
          }, index * 100);
        });
        
      } catch (backendError) {
        console.warn('⚽ CorinthiansTestEvents: Backend not available, events generated locally only:', backendError);
      }
      
    } catch (error) {
      console.error('⚽ CorinthiansTestEvents: Error generating events:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const simulateMatch = async () => {
    setIsSimulatingMatch(true);
    console.log('⚽ CorinthiansTestEvents: Starting match simulation...');
    
    try {
      const events: CorinthiansEvent[] = [];
      const matchStartTime = new Date();
      
      // Simula cada evento da partida com timing real
      for (let i = 0; i < matchEvents.length; i++) {
        const matchEvent = matchEvents[i];
        
        // Calcula o tempo real baseado no minuto da partida
        const eventTime = new Date(matchStartTime.getTime() + (matchEvent.minute * 1000));
        
        const event: CorinthiansEvent = {
          id: `match-${Date.now()}-${i}`,
          timestamp: eventTime.toISOString(),
          eventType: matchEvent.type as 'USER_ACTION' | 'SYSTEM_EVENT' | 'ERROR' | 'WARNING',
          userId: user?.id || 'corinthians-fan',
          action: matchEvent.event,
          value: matchEvent.value,
          location: 'Neo Química Arena',
          createdAt: eventTime.toISOString()
        };
        
        events.push(event);
        
        console.log(`⚽ CorinthiansTestEvents: Match event ${i + 1}/${matchEvents.length} (${matchEvent.minute}'):`, matchEvent.description);
        
        // Delay baseado no tempo real da partida (1 segundo = 1 minuto de jogo)
        if (i < matchEvents.length - 1) {
          const nextMinute = matchEvents[i + 1].minute;
          const currentMinute = matchEvent.minute;
          const delay = (nextMinute - currentMinute) * 1000; // 1 segundo por minuto
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      setLastGenerated(events);
      setGenerationCount(prev => prev + 1);
      
      console.log('⚽ CorinthiansTestEvents: Match simulation completed:', events);
      
      // Envia eventos para o SQS durante 20 segundos
      console.log('📦 CorinthiansTestEvents: Starting SQS sending process (20 seconds)...');
      
      const startTime = Date.now();
      const duration = 20000; // 20 segundos
      let eventIndex = 0;
      
      const sendInterval = setInterval(async () => {
        if (Date.now() - startTime >= duration) {
          clearInterval(sendInterval);
          console.log('📦 CorinthiansTestEvents: SQS sending completed after 20 seconds');
          return;
        }
        
        if (eventIndex < events.length) {
          const event = events[eventIndex];
          try {
            console.log(`📦 CorinthiansTestEvents: Sending event ${eventIndex + 1}/${events.length} to SQS:`, event.action);
            
            // Converte evento para order e envia
            const matchEvent = matchEvents.find(me => me.event === event.action && me.type === event.eventType);
            const order = convertEventToOrder(event, matchEvent);
            
            // Envia para SQS
            const result = await apiClient.createOrder(order);
            console.log(`📦 CorinthiansTestEvents: Event ${eventIndex + 1} sent to SQS successfully:`, result.id);
            
          } catch (error) {
            console.error(`📦 CorinthiansTestEvents: Error sending event ${eventIndex + 1} to SQS:`, error);
          }
          
          eventIndex++;
        }
      }, 1000); // Envia um evento por segundo
      
    } catch (error) {
      console.error('⚽ CorinthiansTestEvents: Error simulating match:', error);
    } finally {
      setIsSimulatingMatch(false);
    }
  };

  // Função para converter eventos do Corinthians em orders criativas
  const convertEventToOrder = (event: CorinthiansEvent, matchEvent: MatchEvent | undefined): any => {
    const baseOrder = {
      customer: 'Corinthians FC',
      product: event.action,
      quantity: event.value,
      price: 0,
      status: 'PENDING' as const,
      title: '',
      description: matchEvent?.description || `${event.action} por ${event.userId}`,
      amount: 0,
      userId: event.userId
    };

    // Mapeia eventos para orders criativas
    switch (event.eventType) {
      case 'USER_ACTION':
        if (event.action === 'gol_marcado') {
          return {
            ...baseOrder,
            product: 'Gol',
            quantity: 1,
            price: 1000.00, // Gol vale 1000 reais
            title: `Gol do Corinthians - ${matchEvent?.description || 'Gol marcado'}`,
            amount: 1000.00,
            status: 'COMPLETED'
          };
        } else if (event.action === 'assistencia') {
          return {
            ...baseOrder,
            product: 'Assistência',
            quantity: 1,
            price: 500.00, // Assistência vale 500 reais
            title: `Assistência - ${matchEvent?.description || 'Assistência registrada'}`,
            amount: 500.00,
            status: 'COMPLETED'
          };
        } else if (event.action === 'defesa_importante' || event.action === 'defesa_milagrosa') {
          return {
            ...baseOrder,
            product: 'Defesa',
            quantity: 1,
            price: 300.00, // Defesa vale 300 reais
            title: `Defesa Importante - ${matchEvent?.description || 'Defesa realizada'}`,
            amount: 300.00,
            status: 'COMPLETED'
          };
        } else {
          return {
            ...baseOrder,
            product: event.action,
            quantity: 1,
            price: 50.00,
            title: `${event.action} - ${matchEvent?.description || 'Ação realizada'}`,
            amount: 50.00,
            status: 'PROCESSING'
          };
        }

      case 'SYSTEM_EVENT':
        if (event.action === 'partida_iniciada') {
          return {
            ...baseOrder,
            product: 'Início da Partida',
            quantity: 1,
            price: 0.00,
            title: 'Partida Corinthians vs Flamengo Iniciada',
            amount: 0.00,
            status: 'COMPLETED'
          };
        } else if (event.action === 'partida_finalizada') {
          return {
            ...baseOrder,
            product: 'Fim da Partida',
            quantity: 1,
            price: 0.00,
            title: 'Partida Corinthians vs Flamengo Finalizada',
            amount: 0.00,
            status: 'COMPLETED'
          };
        } else if (event.action === 'substituicao') {
          return {
            ...baseOrder,
            product: 'Substituição',
            quantity: 1,
            price: 100.00,
            title: `Substituição - ${matchEvent?.description || 'Jogador substituído'}`,
            amount: 100.00,
            status: 'PROCESSING'
          };
        } else {
          return {
            ...baseOrder,
            product: event.action,
            quantity: 1,
            price: 25.00,
            title: `${event.action} - ${matchEvent?.description || 'Evento do sistema'}`,
            amount: 25.00,
            status: 'PROCESSING'
          };
        }

      case 'ERROR':
        return {
          ...baseOrder,
          product: 'Cartão Vermelho',
          quantity: 1,
          price: -500.00, // Cartão vermelho custa 500 reais
          title: `Cartão Vermelho - ${matchEvent?.description || 'Falta grave'}`,
          amount: -500.00,
          status: 'CANCELLED'
        };

      case 'WARNING':
        return {
          ...baseOrder,
          product: 'Cartão Amarelo',
          quantity: 1,
          price: -100.00, // Cartão amarelo custa 100 reais
          title: `Cartão Amarelo - ${matchEvent?.description || 'Advertência'}`,
          amount: -100.00,
          status: 'PENDING'
        };

      default:
        return baseOrder;
    }
  };

  const getEventTypeColor = (eventType: string) => {
    const colors = {
      USER_ACTION: 'bg-green-100 text-green-800',
      SYSTEM_EVENT: 'bg-blue-100 text-blue-800',
      ERROR: 'bg-red-100 text-red-800',
      WARNING: 'bg-yellow-100 text-yellow-800'
    };
    return colors[eventType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'USER_ACTION':
        return <Circle size={16} />;
      case 'SYSTEM_EVENT':
        return <Trophy size={16} />;
      case 'ERROR':
        return <Target size={16} />;
      case 'WARNING':
        return <Users size={16} />;
      default:
        return <Zap size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-lg">
              ⚽
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Corinthians Event Generator</h2>
              <p className="text-sm text-gray-600">Gera eventos de teste com tema do Corinthians</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Gerações realizadas</div>
            <div className="text-2xl font-bold text-gray-900">{generationCount}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={generateTestEvents}
            disabled={isGenerating || isSimulatingMatch}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap size={16} className={isGenerating ? 'animate-spin' : ''} />
            <span>
              {isGenerating ? 'Gerando eventos...' : 'Gerar 10 Eventos Corinthians'}
            </span>
          </button>
          
          <button
            onClick={simulateMatch}
            disabled={isGenerating || isSimulatingMatch}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Circle size={16} className={isSimulatingMatch ? 'animate-spin' : ''} />
            <span>
              {isSimulatingMatch ? 'Simulando partida...' : 'Simular Partida vs Flamengo'}
            </span>
          </button>
          
          {lastGenerated.length > 0 && (
            <button
              onClick={() => {
                console.log('⚽ CorinthiansTestEvents: Sending events to stream...');
                // Aqui você pode implementar a integração com o sistema de streaming
                alert('Funcionalidade de integração com streaming será implementada em breve!');
              }}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <RefreshCw size={16} />
              <span>Enviar para Stream</span>
            </button>
          )}
          
          {lastGenerated.length > 0 && (
            <div className="text-sm text-gray-600">
              Última geração: {new Date().toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Generated Events Table */}
      {lastGenerated.length > 0 && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
              <div className="flex items-center">
                <Circle className="w-8 h-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">USER_ACTION</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {lastGenerated.filter(e => e.eventType === 'USER_ACTION').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
              <div className="flex items-center">
                <Trophy className="w-8 h-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">SYSTEM_EVENT</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {lastGenerated.filter(e => e.eventType === 'SYSTEM_EVENT').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-red-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">ERROR</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {lastGenerated.filter(e => e.eventType === 'ERROR').length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-yellow-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">WARNING</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {lastGenerated.filter(e => e.eventType === 'WARNING').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Eventos Gerados</h3>
                  <p className="text-sm text-gray-600">Últimos 10 eventos do Corinthians</p>
                </div>
                <div className="text-sm text-gray-500">
                  {lastGenerated.length} eventos
                </div>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Local
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lastGenerated.map((event, index) => {
                    // Encontra a descrição correspondente se for um evento de partida
                    const matchEvent = matchEvents.find(me => me.event === event.action && me.type === event.eventType);
                    const description = matchEvent?.description || `${event.action} por ${event.userId}`;
                    
                    return (
                      <tr 
                        key={event.id} 
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(event.eventType)}`}>
                            {getEventIcon(event.eventType)}
                            <span className="ml-1">{event.eventType}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {event.action}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.value}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {event.location}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {description}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Info Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">ℹ️ Como funciona</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Gera 10 eventos aleatórios com tema do Corinthians</p>
          <p>• Inclui jogadores, ações, locais e eventos reais do clube</p>
          <p>• Simula diferentes tipos de eventos (USER_ACTION, SYSTEM_EVENT, ERROR, WARNING)</p>
          <p>• Útil para testar o sistema de streaming e visualização de dados</p>
        </div>
      </div>

      {/* Match Info Panel */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-red-800 mb-2">⚽ Simulação de Partida</h3>
        <div className="text-sm text-red-700 space-y-1">
          <p><strong>Corinthians vs Flamengo</strong></p>
          <p>• Simula uma partida completa com 30+ eventos cronológicos</p>
          <p>• Timing realista (1 segundo = 1 minuto de jogo)</p>
          <p>• Inclui gols, cartões, substituições, defesas e mais</p>
          <p>• Resultado final: Corinthians 2 x 2 Flamengo</p>
          <p>• Duração: ~90 segundos de simulação</p>
        </div>
      </div>

      {/* Orders Mapping Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-purple-800 mb-2">📦 Mapeamento de Orders</h3>
        <div className="text-sm text-purple-700 space-y-1">
          <p><strong>Como os eventos viram orders:</strong></p>
          <p>• <strong>Gol</strong> → Order R$ 1.000 (COMPLETED)</p>
          <p>• <strong>Assistência</strong> → Order R$ 500 (COMPLETED)</p>
          <p>• <strong>Defesa</strong> → Order R$ 300 (COMPLETED)</p>
          <p>• <strong>Cartão Vermelho</strong> → Order -R$ 500 (CANCELLED)</p>
          <p>• <strong>Cartão Amarelo</strong> → Order -R$ 100 (PENDING)</p>
          <p>• <strong>Substituição</strong> → Order R$ 100 (PROCESSING)</p>
          <p>• <strong>Outras ações</strong> → Order R$ 50 (PROCESSING)</p>
          <p>• <strong>Eventos do sistema</strong> → Order R$ 25 (PROCESSING)</p>
        </div>
      </div>
    </div>
  );
};

export default CorinthiansTestEvents; 