'use client';

import React, { useState, useEffect } from 'react';
import { Zap, Circle, Trophy, Users, Target, RefreshCw, Package } from 'lucide-react';
import { StreamEvent, apiClient, CreateOrderDto } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface CorinthiansEvent {
  id: string;
  player: string;
  action: string;
  location: string;
  value: number;
  userId: string;
  timestamp: string;
  eventType: 'USER_ACTION' | 'SYSTEM_EVENT' | 'ERROR' | 'WARNING';
  createdAt: string;
}

interface MatchEvent {
  minute: number;
  description: string;
  event: CorinthiansEvent;
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
    { 
      minute: 0, 
      description: 'Apito inicial - Corinthians vs Flamengo',
      event: {
        id: 'match-0',
        player: 'Árbitro',
        action: 'partida_iniciada',
        location: 'Neo Química Arena',
        value: 1,
        userId: 'arbitro',
        timestamp: new Date().toISOString(),
        eventType: 'SYSTEM_EVENT',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 2, 
      description: 'Falta de Rodrigo Garro em Arrascaeta',
      event: {
        id: 'match-2',
        player: 'Rodrigo Garro',
        action: 'falta_cometida',
        location: 'Meio-campo',
        value: 1,
        userId: 'rodrigo-garro',
        timestamp: new Date().toISOString(),
        eventType: 'USER_ACTION',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 5, 
      description: 'Chute de Yuri Alberto defendido por Rossi',
      event: {
        id: 'match-5',
        player: 'Yuri Alberto',
        action: 'chute_no_gol',
        location: 'Área do Flamengo',
        value: 1,
        userId: 'yuri-alberto',
        timestamp: new Date().toISOString(),
        eventType: 'USER_ACTION',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 8, 
      description: 'Cartão amarelo para Félix Torres',
      event: {
        id: 'match-8',
        player: 'Félix Torres',
        action: 'cartao_amarelo',
        location: 'Defesa',
        value: 1,
        userId: 'felix-torres',
        timestamp: new Date().toISOString(),
        eventType: 'WARNING',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 12, 
      description: 'GOL DO CORINTHIANS! Yuri Alberto (assistência: Rodrigo Garro)',
      event: {
        id: 'match-12',
        player: 'Yuri Alberto',
        action: 'gol_marcado',
        location: 'Área do Flamengo',
        value: 100,
        userId: 'yuri-alberto',
        timestamp: new Date().toISOString(),
        eventType: 'USER_ACTION',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 15, 
      description: 'Assistência de Rodrigo Garro para o gol',
      event: {
        id: 'match-15',
        player: 'Rodrigo Garro',
        action: 'assistencia',
        location: 'Meio-campo',
        value: 50,
        userId: 'rodrigo-garro',
        timestamp: new Date().toISOString(),
        eventType: 'USER_ACTION',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 18, 
      description: 'Defesa milagrosa de Hugo Souza em Gabigol',
      event: {
        id: 'match-18',
        player: 'Hugo Souza',
        action: 'defesa_importante',
        location: 'Área do Corinthians',
        value: 1,
        userId: 'hugo-souza',
        timestamp: new Date().toISOString(),
        eventType: 'USER_ACTION',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 22, 
      description: 'Falta sofrida por Yuri Alberto',
      event: {
        id: 'match-22',
        player: 'Yuri Alberto',
        action: 'falta_sofrida',
        location: 'Ataque',
        value: 1,
        userId: 'yuri-alberto',
        timestamp: new Date().toISOString(),
        eventType: 'USER_ACTION',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 25, 
      description: 'Escanteio a favor do Corinthians',
      event: {
        id: 'match-25',
        player: 'Árbitro',
        action: 'escanteio',
        location: 'Lateral',
        value: 1,
        userId: 'arbitro',
        timestamp: new Date().toISOString(),
        eventType: 'SYSTEM_EVENT',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 28, 
      description: 'Chute de Memphis Depay para fora',
      event: {
        id: 'match-28',
        player: 'Memphis Depay',
        action: 'chute_para_fora',
        location: 'Área do Corinthians',
        value: 1,
        userId: 'memphis-depay',
        timestamp: new Date().toISOString(),
        eventType: 'USER_ACTION',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 32, 
      description: 'GOL DO FLAMENGO! Gabigol (assistência: Arrascaeta)',
      event: {
        id: 'match-32',
        player: 'Gabigol',
        action: 'gol_marcado',
        location: 'Área do Corinthians',
        value: 100,
        userId: 'gabigol',
        timestamp: new Date().toISOString(),
        eventType: 'USER_ACTION',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 35, 
      description: 'Cartão amarelo para André Ramalho',
      event: {
        id: 'match-35',
        player: 'André Ramalho',
        action: 'cartao_amarelo',
        location: 'Defesa',
        value: 1,
        userId: 'andre-ramalho',
        timestamp: new Date().toISOString(),
        eventType: 'WARNING',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 38, 
      description: 'Substituição: Charles sai, Raniele entra',
      event: {
        id: 'match-38',
        player: 'Charles',
        action: 'substituicao',
        location: 'Bancos',
        value: 1,
        userId: 'charles',
        timestamp: new Date().toISOString(),
        eventType: 'SYSTEM_EVENT',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 42, 
      description: 'Defesa de Félix Torres em Pedro',
      event: {
        id: 'match-42',
        player: 'Félix Torres',
        action: 'defesa_importante',
        location: 'Defesa',
        value: 1,
        userId: 'felix-torres',
        timestamp: new Date().toISOString(),
        eventType: 'USER_ACTION',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 45, 
      description: 'Fim do primeiro tempo - Corinthians 1 x 1 Flamengo',
      event: {
        id: 'match-45',
        player: 'Árbitro',
        action: 'intervalo',
        location: 'Centro',
        value: 1,
        userId: 'arbitro',
        timestamp: new Date().toISOString(),
        eventType: 'SYSTEM_EVENT',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 47, 
      description: 'Início do segundo tempo',
      event: {
        id: 'match-47',
        player: 'Árbitro',
        action: 'partida_iniciada',
        location: 'Centro',
        value: 1,
        userId: 'arbitro',
        timestamp: new Date().toISOString(),
        eventType: 'SYSTEM_EVENT',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 50, 
      description: 'Chute de Ángel Romero defendido por Rossi',
      event: {
        id: 'match-50',
        player: 'Ángel Romero',
        action: 'chute_no_gol',
        location: 'Área do Flamengo',
        value: 1,
        userId: 'angel-romero',
        timestamp: new Date().toISOString(),
        eventType: 'USER_ACTION',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 53, 
      description: 'GOL DO CORINTHIANS! Memphis Depay (assistência: Ángel Romero)',
      event: {
        id: 'match-53',
        player: 'Memphis Depay',
        action: 'gol_marcado',
        location: 'Área do Flamengo',
        value: 100,
        userId: 'memphis-depay',
        timestamp: new Date().toISOString(),
        eventType: 'USER_ACTION',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 55, 
      description: 'Assistência de Ángel Romero para o gol',
      event: {
        id: 'match-55',
        player: 'Ángel Romero',
        action: 'assistencia',
        location: 'Meio-campo',
        value: 50,
        userId: 'angel-romero',
        timestamp: new Date().toISOString(),
        eventType: 'USER_ACTION',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 58, 
      description: 'Cartão vermelho para Félix Torres',
      event: {
        id: 'match-58',
        player: 'Félix Torres',
        action: 'cartao_vermelho',
        location: 'Defesa',
        value: 1,
        userId: 'felix-torres',
        timestamp: new Date().toISOString(),
        eventType: 'ERROR',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 60, 
      description: 'Substituição: Yuri Alberto sai, Kayke entra',
      event: {
        id: 'match-60',
        player: 'Yuri Alberto',
        action: 'substituicao',
        location: 'Bancos',
        value: 1,
        userId: 'yuri-alberto',
        timestamp: new Date().toISOString(),
        eventType: 'SYSTEM_EVENT',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 65, 
      description: 'Defesa milagrosa de Hugo Souza em Arrascaeta',
      event: {
        id: 'match-65',
        player: 'Hugo Souza',
        action: 'defesa_milagrosa',
        location: 'Área do Corinthians',
        value: 1,
        userId: 'hugo-souza',
        timestamp: new Date().toISOString(),
        eventType: 'USER_ACTION',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 68, 
      description: 'Gol perdido por Kayke',
      event: {
        id: 'match-68',
        player: 'Kayke',
        action: 'gol_perdido',
        location: 'Área do Flamengo',
        value: 1,
        userId: 'kayke',
        timestamp: new Date().toISOString(),
        eventType: 'USER_ACTION',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 72, 
      description: 'Substituição: Memphis Depay sai, Igor Coronado entra',
      event: {
        id: 'match-72',
        player: 'Memphis Depay',
        action: 'substituicao',
        location: 'Bancos',
        value: 1,
        userId: 'memphis-depay',
        timestamp: new Date().toISOString(),
        eventType: 'SYSTEM_EVENT',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 75, 
      description: 'GOL DO FLAMENGO! Pedro (assistência: Everton Ribeiro)',
      event: {
        id: 'match-75',
        player: 'Pedro',
        action: 'gol_marcado',
        location: 'Área do Corinthians',
        value: 100,
        userId: 'pedro',
        timestamp: new Date().toISOString(),
        eventType: 'USER_ACTION',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 78, 
      description: 'Cartão amarelo para Diego Palacios',
      event: {
        id: 'match-78',
        player: 'Diego Palacios',
        action: 'cartao_amarelo',
        location: 'Defesa',
        value: 1,
        userId: 'diego-palacios',
        timestamp: new Date().toISOString(),
        eventType: 'WARNING',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 82, 
      description: 'Defesa de André Ramalho em Gabigol',
      event: {
        id: 'match-82',
        player: 'André Ramalho',
        action: 'defesa_importante',
        location: 'Defesa',
        value: 1,
        userId: 'andre-ramalho',
        timestamp: new Date().toISOString(),
        eventType: 'USER_ACTION',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 85, 
      description: 'Substituição: Rodrigo Garro sai, Maycon entra',
      event: {
        id: 'match-85',
        player: 'Rodrigo Garro',
        action: 'substituicao',
        location: 'Bancos',
        value: 1,
        userId: 'rodrigo-garro',
        timestamp: new Date().toISOString(),
        eventType: 'SYSTEM_EVENT',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 88, 
      description: 'Chute de Igor Coronado para fora',
      event: {
        id: 'match-88',
        player: 'Igor Coronado',
        action: 'chute_para_fora',
        location: 'Área do Corinthians',
        value: 1,
        userId: 'igor-coronado',
        timestamp: new Date().toISOString(),
        eventType: 'USER_ACTION',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 90, 
      description: 'Fim da partida - Corinthians 2 x 2 Flamengo',
      event: {
        id: 'match-90',
        player: 'Árbitro',
        action: 'partida_finalizada',
        location: 'Centro',
        value: 1,
        userId: 'arbitro',
        timestamp: new Date().toISOString(),
        eventType: 'SYSTEM_EVENT',
        createdAt: new Date().toISOString()
      }
    },
    { 
      minute: 91, 
      description: 'Resultado final: Empate 2x2',
      event: {
        id: 'match-91',
        player: 'Sistema',
        action: 'empate',
        location: 'Centro',
        value: 1,
        userId: 'sistema',
        timestamp: new Date().toISOString(),
        eventType: 'SYSTEM_EVENT',
        createdAt: new Date().toISOString()
      }
    }
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
      player: randomPlayer,
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
          player: matchEvent.event.player,
          timestamp: eventTime.toISOString(),
          eventType: matchEvent.event.action as 'USER_ACTION' | 'SYSTEM_EVENT' | 'ERROR' | 'WARNING',
          userId: user?.id || 'corinthians-fan',
          action: matchEvent.event.action,
          value: matchEvent.event.value,
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
            const matchEvent = matchEvents.find(me => me.event.action === event.action && me.event.action as 'USER_ACTION' | 'SYSTEM_EVENT' | 'ERROR' | 'WARNING' === event.eventType);
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
  const convertEventToOrder = (event: CorinthiansEvent, matchEvent: MatchEvent | undefined): CreateOrderDto => {
    const baseOrder: CreateOrderDto = {
      customer: 'Corinthians FC',
      product: event.action,
      quantity: 1,
      price: event.value,
      status: 'PENDING',
      title: `${event.player} - ${event.action}`,
      description: matchEvent ? matchEvent.description : `${event.action} por ${event.player}`,
      amount: event.value,
      userId: 'corinthians-fc',
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
                    const matchEvent = matchEvents.find(me => me.event.action === event.action && me.event.action as 'USER_ACTION' | 'SYSTEM_EVENT' | 'ERROR' | 'WARNING' === event.eventType);
                    const description = matchEvent?.description || `${event.action} por ${event.player}`;
                    
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