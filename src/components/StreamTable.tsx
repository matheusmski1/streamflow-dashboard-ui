'use client';

import React, { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Activity, TrendingUp, Users, Zap, RefreshCw, Trash2, Wifi, WifiOff } from 'lucide-react';
import StatCard from './StatCard';
import { StreamEventSource, StreamEvent, apiClient } from '@/services/api';

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
  const streamRef = React.useRef<StreamEventSource | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [hasAttemptedConnection, setHasAttemptedConnection] = useState(false);

  const addExternalEvent = useCallback((event: StreamEvent) => {
    setEvents(prevEvents => {
      const newEvents = [event, ...prevEvents.slice(0, 99)];
      return newEvents;
    });
  }, []);

  useImperativeHandle(ref, () => ({
    addEvent: addExternalEvent
  }), [addExternalEvent]);

  const disconnectFromStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.disconnect();
      streamRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    return () => disconnectFromStream();
  }, [disconnectFromStream]);

  useEffect(() => {
    if (externalEvents.length > 0) {
      externalEvents.forEach((externalEvent) => {
        setEvents(prevEvents => {
          const newEvents = [externalEvent, ...prevEvents.slice(0, 99)];
          return newEvents;
        });
        if (onEventReceived) {
          onEventReceived(externalEvent);
        }
      });
    }
  }, [externalEvents, onEventReceived]);

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
    const recentEvents = events.filter(event => now - new Date(event.timestamp).getTime() < 60000);
    const errorEvents = events.filter(e => e.eventType === 'ERROR');
    setStats({
      totalEvents: events.length,
      eventsPerSecond: recentEvents.length / 60,
      activeUsers: 0,
      errorRate: events.length > 0 ? (errorEvents.length / events.length) * 100 : 0
    });
  }, [events]);

  const connectToStream = useCallback(async () => {
    try {
      setIsLoading(true);
      setConnectionAttempts(prev => prev + 1);
      setHasAttemptedConnection(true);

      const streamOptions = {
        type: eventTypeFilter !== 'all' ? eventTypeFilter : undefined,
      };
      const eventSource = new StreamEventSource();
      streamRef.current = eventSource;

      eventSource.connect(
        (event) => {
          try {
            let raw = event.data?.trim() || '';
            if (raw.startsWith('data:')) {
              const braceIndex = raw.indexOf('{');
              if (braceIndex !== -1) raw = raw.slice(braceIndex);
            }
            const eventData = JSON.parse(raw) as StreamEvent;
            setEvents(prevEvents => {
              const newEvents = [eventData, ...prevEvents.slice(0, 99)];
              return newEvents;
            });
            if (onEventReceived) {
              onEventReceived(eventData);
            }
          } catch (error) {
            console.error('Failed to parse event data:', error);
          }
        },
        (error) => {
          console.error('Stream error:', error);
          setIsConnected(false);
          setIsLoading(false);
        },
        () => {
          setIsConnected(true);
          setIsLoading(false);
        },
        streamOptions
      );
    } catch (error) {
      console.error('Failed to connect to stream:', error);
      setIsConnected(false);
      setIsLoading(false);
    }
  }, [eventTypeFilter, onEventReceived]);

  const handleConnect = useCallback(() => {
    if (!isConnected && !isLoading) {
      setConnectionAttempts(0);
      connectToStream();
    }
  }, [isConnected, isLoading, connectToStream]);

  const handleRefresh = useCallback(() => {
    disconnectFromStream();
    setConnectionAttempts(0);
    connectToStream();
  }, [disconnectFromStream, connectToStream]);

  const handleDisconnect = useCallback(() => {
    disconnectFromStream();
    setConnectionAttempts(0);
  }, [disconnectFromStream]);

  const handleClearEvents = useCallback(() => {
    setEvents([]);
    setStats({
      totalEvents: 0,
      eventsPerSecond: 0,
      activeUsers: 0,
      errorRate: 0
    });
  }, []);

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
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Connection Status and Controls */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
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
          <div className="flex items-center space-x-3">
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Events</option>
              <option value="USER_ACTION">User Actions</option>
              <option value="SYSTEM_EVENT">System Events</option>
              <option value="ERROR">Errors</option>
              <option value="WARNING">Warnings</option>
            </select>
            <button
              onClick={isConnected ? disconnectFromStream : connectToStream}
              className={`px-3 py-1 text-sm font-medium rounded-md ${
                isConnected
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              {isConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-500">Total Events</div>
            <div className="text-lg font-bold text-gray-900">{stats.totalEvents}</div>
          </div>
          <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-500">Events/Sec</div>
            <div className="text-lg font-bold text-gray-900">{stats.eventsPerSecond.toFixed(2)}</div>
          </div>
          <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-500">Active Users</div>
            <div className="text-lg font-bold text-gray-900">{stats.activeUsers}</div>
          </div>
          <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
            <div className="text-sm font-medium text-gray-500">Error Rate</div>
            <div className="text-lg font-bold text-gray-900">{stats.errorRate.toFixed(1)}%</div>
          </div>
        </div>
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