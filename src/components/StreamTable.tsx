'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Activity, TrendingUp, Users, Zap, RefreshCw, Trash2 } from 'lucide-react';
import StatCard from './StatCard';

interface StreamEvent {
  id: string;
  timestamp: string;
  event_type: string;
  user_id: string;
  data: {
    action: string;
    value: number;
    location: string;
  };
}

interface StreamStats {
  totalEvents: number;
  eventsPerSecond: number;
  activeUsers: number;
  errorRate: number;
}

const StreamTable: React.FC = () => {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [stats, setStats] = useState<StreamStats>({
    totalEvents: 0,
    eventsPerSecond: 0,
    activeUsers: 0,
    errorRate: 0
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    connectToStream();
    return () => disconnectFromStream();
  }, []);

  const connectToStream = async () => {
    try {
      setIsLoading(true);
      
      // TODO: Replace with actual EventSource connection
      // const eventSource = new EventSource('/api/stream/events');
      // 
      // eventSource.onopen = () => {
      //   setIsConnected(true);
      //   setIsLoading(false);
      // };
      // 
      // eventSource.onmessage = (event) => {
      //   const streamEvent: StreamEvent = JSON.parse(event.data);
      //   setEvents(prevEvents => [streamEvent, ...prevEvents.slice(0, 99)]);
      //   updateStats();
      // };
      // 
      // eventSource.onerror = () => {
      //   setIsConnected(false);
      //   setTimeout(connectToStream, 5000); // Retry connection
      // };
      
      console.warn('Stream service not configured. Please set up your streaming endpoints.');
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to connect to stream:', error);
      setIsConnected(false);
      setIsLoading(false);
    }
  };

  const disconnectFromStream = () => {
    // TODO: Close EventSource connection
    // if (eventSource) {
    //   eventSource.close();
    // }
    setIsConnected(false);
  };

  const updateStats = useCallback(() => {
    if (events.length === 0) return;

    const now = Date.now();
    const recentEvents = events.filter(event => 
      now - new Date(event.timestamp).getTime() < 60000 // Last minute
    );

    const uniqueUsers = new Set(events.map(e => e.user_id));
    const errorEvents = events.filter(e => e.event_type === 'error');

    setStats({
      totalEvents: events.length,
      eventsPerSecond: recentEvents.length / 60,
      activeUsers: uniqueUsers.size,
      errorRate: events.length > 0 ? (errorEvents.length / events.length) * 100 : 0
    });
  }, [events]);

  // Update stats when events change
  useEffect(() => {
    updateStats();
  }, [updateStats]);

  const handleRefresh = () => {
    setEvents([]);
    connectToStream();
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
      user_action: 'bg-blue-100 text-blue-800',
      system_event: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800'
    };
    return colors[eventType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-md border border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium text-gray-700">
            {isConnected ? 'Connected to stream' : 'Disconnected from stream'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
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
          value={stats.eventsPerSecond.toFixed(1)}
          icon={<Zap size={24} />}
          color="green"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={<Users size={24} />}
          color="yellow"
        />
        <StatCard
          title="Error Rate"
          value={`${stats.errorRate.toFixed(1)}%`}
          icon={<TrendingUp size={24} />}
          color="red"
        />
      </div>

      {/* Stream Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Live Event Stream</h3>
          <p className="text-sm text-gray-600">Real-time events as they happen</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
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
            <tbody className="bg-white divide-y divide-gray-200 max-h-96 overflow-y-auto">
              {events.map((event, index) => (
                <tr 
                  key={event.id} 
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(event.event_type)}`}>
                      {event.event_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.user_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.data.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.data.value}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {event.data.location}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {events.length === 0 && (
            <div className="text-center py-12">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {isConnected ? 'No events yet' : 'Stream disconnected'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {isConnected 
                  ? 'Waiting for incoming stream data...' 
                  : 'Please configure your streaming service endpoints'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamTable; 