
import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Users, Zap } from 'lucide-react';
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

const StreamTable: React.FC = () => {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [eventsPerSecond, setEventsPerSecond] = useState(0);
  const [lastEventTime, setLastEventTime] = useState<number>(Date.now());

  // Simulate Server-Sent Events with mock data
  useEffect(() => {
    const generateMockEvent = (): StreamEvent => ({
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      event_type: ['user_action', 'system_event', 'error', 'warning'][Math.floor(Math.random() * 4)],
      user_id: `user_${Math.floor(Math.random() * 1000)}`,
      data: {
        action: ['click', 'view', 'purchase', 'login', 'logout'][Math.floor(Math.random() * 5)],
        value: Math.floor(Math.random() * 1000),
        location: ['homepage', 'dashboard', 'profile', 'settings'][Math.floor(Math.random() * 4)]
      }
    });

    const interval = setInterval(() => {
      const newEvent = generateMockEvent();
      const now = Date.now();
      
      setEvents(prevEvents => [newEvent, ...prevEvents.slice(0, 99)]); // Keep last 100 events
      
      // Calculate events per second
      const timeDiff = (now - lastEventTime) / 1000;
      if (timeDiff > 0) {
        setEventsPerSecond(Math.round(1 / timeDiff * 10) / 10);
      }
      setLastEventTime(now);
    }, Math.random() * 2000 + 500); // Random interval between 0.5-2.5 seconds

    return () => clearInterval(interval);
  }, [lastEventTime]);

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
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Events"
          value={events.length.toLocaleString()}
          icon={<Activity size={24} />}
          color="blue"
        />
        <StatCard
          title="Events/Second"
          value={eventsPerSecond}
          icon={<Zap size={24} />}
          color="green"
        />
        <StatCard
          title="Active Users"
          value={new Set(events.map(e => e.user_id)).size}
          icon={<Users size={24} />}
          color="yellow"
        />
        <StatCard
          title="Error Rate"
          value={`${Math.round((events.filter(e => e.event_type === 'error').length / events.length) * 100) || 0}%`}
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No events yet</h3>
              <p className="mt-1 text-sm text-gray-500">Waiting for incoming stream data...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamTable;
