'use client';

import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Activity, TrendingUp, Users, Zap, RefreshCw, Trash2, Wifi, WifiOff } from 'lucide-react';
import StatCard from './StatCard';
import { StreamEventSource, StreamEvent, apiClient } from '@/services/api';
import { useAuth } from '@/context/AuthContext';

interface StreamStats {
  totalEvents: number;
  eventsPerSecond: number;
  activeUsers: number;
  errorRate: number;
}

interface StreamTableProps {
  externalEvents?: StreamEvent[];
  onEventReceived?: (event: StreamEvent) => void;
}

const StreamTable = forwardRef<{ addEvent: (event: StreamEvent) => void }, StreamTableProps>(({ externalEvents = [], onEventReceived }, ref) => {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [stats, setStats] = useState<StreamStats>({
    totalEvents: 0,
    eventsPerSecond: 0,
    activeUsers: 0,
    errorRate: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [streamSource, setStreamSource] = useState<StreamEventSource | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [showUserOnly, setShowUserOnly] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [hasAttemptedConnection, setHasAttemptedConnection] = useState(false);
  const { user, isDevelopmentMode } = useAuth();

  // Only disconnect when component unmounts
  useEffect(() => {
    return () => disconnectFromStream();
  }, []);

  // When filters change, only reconnect if already connected
  useEffect(() => {
    if (isConnected && hasAttemptedConnection) {
      handleRefresh();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showUserOnly, eventTypeFilter]);

  // Process external events (from Corinthians generator)
  useEffect(() => {
    if (externalEvents.length > 0) {
      console.log('🎯 StreamTable: Processing external events:', externalEvents.length);
      
      externalEvents.forEach((externalEvent) => {
        console.log('🎯 StreamTable: Adding external event to stream:', externalEvent);
        
        // Adiciona o evento ao streaming local
        setEvents(prevEvents => {
          const newEvents = [externalEvent, ...prevEvents.slice(0, 99)];
          console.log('🎯 StreamTable: Updated events array with external event:', newEvents.length);
          return newEvents;
        });
        
        // Notifica o callback se fornecido
        if (onEventReceived) {
          onEventReceived(externalEvent);
        }
      });
    }
  }, [externalEvents, onEventReceived]);

  // Função para adicionar eventos externos (usada pelo Corinthians generator)
  const addExternalEvent = (event: StreamEvent) => {
    console.log('🎯 StreamTable: Adding external event:', event);
    setEvents(prevEvents => {
      const newEvents = [event, ...prevEvents.slice(0, 99)];
      console.log('🎯 StreamTable: Updated events array with external event:', newEvents.length);
      return newEvents;
    });
  };

  // Expõe a função via ref
  useImperativeHandle(ref, () => ({
    addEvent: addExternalEvent
  }));

  const connectToStream = async () => {
    try {
      console.log('🚀 StreamTable: Starting connection process...');
      console.log('🚀 StreamTable: Development mode:', isDevelopmentMode);
      console.log('🚀 StreamTable: User info:', user);
      
      setIsLoading(true);
      setConnectionAttempts(prev => prev + 1);
      setHasAttemptedConnection(true);

      // Primeiro tenta fazer ping no serviço de stream
      if (!isDevelopmentMode) {
        console.log('🏓 StreamTable: Attempting to ping stream service...');
        try {
          const pingResult = await apiClient.pingStream();
          console.log('🏓 StreamTable: Ping successful:', pingResult);
        } catch (error) {
          console.warn('🏓 StreamTable: Stream service ping failed:', error);
          console.warn('🏓 StreamTable: This might indicate the stream service is not available');
          setIsLoading(false);
          return;
        }
      }
      
      if (isDevelopmentMode) {
        console.log('🎭 StreamTable: Running in development mode, using mock data');
        // Simula conexão em desenvolvimento
        setIsConnected(true);
        setIsLoading(false);
        
        // Simula alguns eventos
        const mockEvents: StreamEvent[] = [
          {
            id: 'dev-event-1',
            timestamp: new Date().toISOString(),
            eventType: 'USER_ACTION',
            userId: user?.id || 'dev-user',
            action: 'order_created',
            value: 299.99,
            location: 'dashboard',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'dev-event-2',
            timestamp: new Date(Date.now() - 30000).toISOString(),
            eventType: 'SYSTEM_EVENT',
            userId: user?.id || 'dev-user',
            action: 'user_login',
            value: 1,
            location: 'auth',
            createdAt: new Date(Date.now() - 30000).toISOString(),
          },
          {
            id: 'dev-event-3',
            timestamp: new Date(Date.now() - 60000).toISOString(),
            eventType: 'ERROR',
            userId: user?.id || 'dev-user',
            action: 'api_error',
            value: 500,
            location: 'orders',
            createdAt: new Date(Date.now() - 60000).toISOString(),
          }
        ];
        console.log('🎭 StreamTable: Setting mock events:', mockEvents);
        setEvents(mockEvents);
        return;
      }

      console.log('🔌 StreamTable: Setting up real SSE connection...');
      // Conexão real usando SSE
      const streamOptions = {
        type: eventTypeFilter !== 'all' ? eventTypeFilter : undefined,
        userOnly: showUserOnly
      };
      
      console.log('🔌 StreamTable: Stream options:', streamOptions);

      const eventSource = new StreamEventSource();
      setStreamSource(eventSource);

      eventSource.connect(
        (event) => {
          try {
            console.log('📨 StreamTable: Received SSE event raw data:', event.data);
            console.log('📨 StreamTable: Event type:', event.type);
            console.log('📨 StreamTable: Event origin:', event.origin);
            
            // O event.data vem como string do SSE, pode ter diferentes formatos
            let jsonString = event.data;
            if (typeof jsonString === 'string') {
              // Remove prefixos comuns do SSE
              if (jsonString.startsWith('data: ')) {
                jsonString = jsonString.substring(6); // Remove "data: "
              } else if (jsonString.startsWith('data:')) {
                jsonString = jsonString.substring(5); // Remove "data:"
              }
              
              // Remove quebras de linha, tabs e espaços extras
              jsonString = jsonString.replace(/[\r\n\t]/g, '').trim();
              
              // Se ainda tem prefixo de data, tenta extrair apenas o JSON
              const jsonMatch = jsonString.match(/\{.*\}/);
              if (jsonMatch) {
                jsonString = jsonMatch[0];
              }
            }
            
            console.log('📨 StreamTable: Processed JSON string:', jsonString);
            
            const eventData = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
            const streamEvent: StreamEvent = eventData;
            console.log('📨 StreamTable: Successfully parsed stream event:', streamEvent);
            console.log('📨 StreamTable: Event value:', streamEvent.value, 'Type:', typeof streamEvent.value);
            
            setEvents(prevEvents => {
              const newEvents = [streamEvent, ...prevEvents.slice(0, 99)];
              console.log('📨 StreamTable: Updated events array length:', newEvents.length);
              return newEvents;
            });
          } catch (error) {
            console.error('❌ StreamTable: Error parsing stream event:', error);
            console.error('❌ StreamTable: Raw data type:', typeof event.data);
            console.error('❌ StreamTable: Raw data content:', event.data);
            console.error('❌ StreamTable: Raw data length:', event.data?.length);
          }
        },
        (error) => {
          console.error('❌ StreamTable: Stream error callback triggered:', error);
          setIsConnected(false);
          setIsLoading(false);
          // Manual reconnection only - no automatic retry
        },
        () => {
          console.log('✅ StreamTable: Stream connection opened successfully');
          setIsConnected(true);
          setIsLoading(false);
          setConnectionAttempts(0);
        },
        streamOptions
      );
      
    } catch (error) {
      console.error('💥 StreamTable: Failed to connect to stream:', error);
      console.error('💥 StreamTable: Error details:', {
        name: (error as Error).name,
        message: (error as Error).message,
        stack: (error as Error).stack
      });
      setIsConnected(false);
      setIsLoading(false);
    }
  };

  const disconnectFromStream = () => {
    console.log('🔌 StreamTable: Disconnecting from stream...');
    if (streamSource) {
      streamSource.disconnect();
      setStreamSource(null);
    }
    setIsConnected(false);
    console.log('🔌 StreamTable: Disconnection completed');
  };

  // Update stats when events change
  useEffect(() => {
    if (events.length === 0) {
      setStats({
        totalEvents: 0,
        eventsPerSecond: 0,
        activeUsers: 0,
        errorRate: 0
      });
      return;
    }

    const now = Date.now();
    const recentEvents = events.filter(event => 
      now - new Date(event.timestamp).getTime() < 60000 // Last minute
    );

    const uniqueUsers = new Set(events.map(e => e.userId));
    const errorEvents = events.filter(e => e.eventType === 'ERROR');

    setStats({
      totalEvents: events.length,
      eventsPerSecond: recentEvents.length / 60,
      activeUsers: uniqueUsers.size,
      errorRate: events.length > 0 ? (errorEvents.length / events.length) * 100 : 0
    });
  }, [events]);

  const handleConnect = () => {
    console.log('🔗 StreamTable: Handle connect triggered');
    console.log('🔗 StreamTable: Current connection state:', { isConnected, isLoading });
    if (!isConnected && !isLoading) {
      console.log('🔗 StreamTable: Starting connection...');
      setConnectionAttempts(0);
      connectToStream();
    } else {
      console.log('🔗 StreamTable: Connection already in progress or connected');
    }
  };

  const handleRefresh = () => {
    console.log('🔄 StreamTable: Handle refresh triggered');
    disconnectFromStream();
    setConnectionAttempts(0);
    connectToStream();
  };

  const handleDisconnect = () => {
    console.log('🔌 StreamTable: Handle disconnect triggered');
    disconnectFromStream();
    setConnectionAttempts(0);
  };

  const handleClearEvents = () => {
    setEvents([]);
    setStats({
      totalEvents: 0,
      eventsPerSecond: 0,
      activeUsers: 0,
      errorRate: 0
    });
  };

  const getEventTypeColor = (eventType: string) => {
    const colors = {
      USER_ACTION: 'bg-blue-100 text-blue-800',
      SYSTEM_EVENT: 'bg-green-100 text-green-800',
      ERROR: 'bg-red-100 text-red-800',
      WARNING: 'bg-yellow-100 text-yellow-800'
    };
    return colors[eventType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatEventValue = (value: number | string | undefined, eventType: string) => {
    // Verificar se value existe e é um número válido
    if (value === undefined || value === null || isNaN(Number(value))) {
      return '0';
    }
    
    const numValue = Number(value);
    
    if (eventType === 'ERROR' || eventType === 'WARNING') {
      return numValue.toString();
    }
    return numValue.toFixed(2);
  };

  const filteredEvents = events.filter(event => {
    if (eventTypeFilter !== 'all' && event.eventType !== eventTypeFilter) {
      return false;
    }
    if (showUserOnly && event.userId !== user?.id) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Development Mode Notice */}
      {isDevelopmentMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">🚧 Development Mode Active</h3>
          <p className="text-sm text-blue-700">
            Stream functionality is working with mock data. In production, it will connect to the real-time SSE endpoint.
          </p>
        </div>
      )}

      {/* Debug Information */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-800 mb-2">🔍 Debug Information</h3>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}</div>
          <div><strong>Stream URL:</strong> {process.env.NEXT_PUBLIC_STREAM_URL}</div>
          <div><strong>Development Mode:</strong> {isDevelopmentMode ? 'Yes' : 'No'}</div>
          <div><strong>User ID:</strong> {user?.id || 'Not logged in'}</div>
          <div><strong>Connection Status:</strong> {isConnected ? 'Connected' : 'Disconnected'}</div>
          <div><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
          <div><strong>Connection Attempts:</strong> {connectionAttempts}</div>
          <div><strong>Total Events:</strong> {events.length}</div>
        </div>
      </div>

      {/* Connection Status and Controls */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {isConnected ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-red-500" />}
            <div>
              <span className="text-sm font-medium text-gray-700">
                {isConnected 
                  ? 'Connected to stream' 
                  : hasAttemptedConnection 
                    ? 'Disconnected from stream'
                    : 'Ready to connect'
                }
              </span>
              {connectionAttempts > 0 && !isConnected && isLoading && (
                <div className="text-xs text-gray-500">
                  Connecting... (attempt {connectionAttempts})
                </div>
              )}
              {connectionAttempts > 0 && !isConnected && !isLoading && hasAttemptedConnection && (
                <div className="text-xs text-gray-500">
                  Connection failed. Click Connect to retry.
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {!isConnected ? (
              <button
                onClick={handleConnect}
                disabled={isLoading}
                className="flex items-center space-x-2 px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                <Wifi size={16} className={isLoading ? 'animate-spin' : ''} />
                <span>{isLoading ? 'Connecting...' : 'Connect'}</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center space-x-2 px-3 py-1 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  <WifiOff size={16} />
                  <span>Disconnect</span>
                </button>
              </>
            )}
            <button
              onClick={handleClearEvents}
              disabled={events.length === 0}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 size={16} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Event Type</label>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="USER_ACTION">User Action</option>
              <option value="SYSTEM_EVENT">System Event</option>
              <option value="ERROR">Error</option>
              <option value="WARNING">Warning</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="userOnly"
              checked={showUserOnly}
              onChange={(e) => setShowUserOnly(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="userOnly" className="ml-2 text-sm text-gray-700">
              My events only
            </label>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Events"
          value={stats.totalEvents.toLocaleString()}
          icon={<Activity size={24} />}
          color="blue"
        />
        <StatCard
          title="Events/Second"
          value={stats.eventsPerSecond ? stats.eventsPerSecond.toFixed(1) : '0.0'}
          icon={<Zap size={24} />}
          color="green"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers || 0}
          icon={<Users size={24} />}
          color="yellow"
        />
        <StatCard
          title="Error Rate"
          value={`${stats.errorRate ? stats.errorRate.toFixed(1) : '0.0'}%`}
          icon={<TrendingUp size={24} />}
          color="red"
        />
      </div>

      {/* Stream Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Live Event Stream</h3>
              <p className="text-sm text-gray-600">Real-time events as they happen</p>
            </div>
            <div className="text-sm text-gray-500">
              Showing {filteredEvents.length} of {events.length} events
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event, index) => (
                <tr 
                  key={event.id} 
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(event.eventType)}`}>
                      {event.eventType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {event.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatEventValue(event.value, event.eventType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {event.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                    {(event.userId || '').slice(-8)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEvents.length === 0 && (
            <div className="text-center py-8">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No events</h3>
              <p className="mt-1 text-sm text-gray-500">
                {isConnected 
                  ? 'Waiting for new events...' 
                  : hasAttemptedConnection 
                    ? 'Connection lost. Click Connect to reconnect.'
                    : 'Click Connect to start receiving events'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

StreamTable.displayName = 'StreamTable';

export default StreamTable; 