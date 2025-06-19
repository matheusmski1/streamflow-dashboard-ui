'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, BarChart3, TrendingUp, Users, Activity, RefreshCw } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import StatCard from '@/components/StatCard';
import ProtectedRoute from '@/components/ProtectedRoute';

interface AnalyticsData {
  totalViews: number;
  conversionRate: number;
  activeUsers: number;
  bounceRate: number;
  isLoading: boolean;
  lastUpdated: Date | null;
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <AnalyticsContent />
    </ProtectedRoute>
  );
}

function AnalyticsContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalViews: 0,
    conversionRate: 0,
    activeUsers: 0,
    bounceRate: 0,
    isLoading: false,
    lastUpdated: null
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setAnalyticsData(prev => ({ ...prev, isLoading: true }));
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/analytics/dashboard', {
      //   headers: { 
      //     Authorization: `Bearer ${localStorage.getItem('auth_token')}`
      //   }
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('Failed to fetch analytics data');
      // }
      // 
      // const data = await response.json();
      // setAnalyticsData({
      //   totalViews: data.totalViews,
      //   conversionRate: data.conversionRate,
      //   activeUsers: data.activeUsers,
      //   bounceRate: data.bounceRate,
      //   isLoading: false,
      //   lastUpdated: new Date()
      // });
      
      console.warn('Analytics API not configured. Please set up your analytics endpoints.');
      setAnalyticsData(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      setAnalyticsData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={analyticsData.isLoading}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw size={16} className={analyticsData.isLoading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Analytics</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <div className="space-y-6">
            {/* Last Updated Info */}
            {analyticsData.lastUpdated && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  Last updated: {analyticsData.lastUpdated.toLocaleString()}
                </p>
              </div>
            )}

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Views"
                value={analyticsData.totalViews > 0 ? analyticsData.totalViews.toLocaleString() : '--'}
                icon={<Activity size={24} />}
                color="blue"
              />
              <StatCard
                title="Conversion Rate"
                value={analyticsData.conversionRate > 0 ? `${analyticsData.conversionRate}%` : '--'}
                icon={<TrendingUp size={24} />}
                color="green"
              />
              <StatCard
                title="Active Users"
                value={analyticsData.activeUsers > 0 ? analyticsData.activeUsers.toLocaleString() : '--'}
                icon={<Users size={24} />}
                color="yellow"
              />
              <StatCard
                title="Bounce Rate"
                value={analyticsData.bounceRate > 0 ? `${analyticsData.bounceRate}%` : '--'}
                icon={<BarChart3 size={24} />}
                color="red"
              />
            </div>

            {/* Analytics Content Placeholder */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Overview</h3>
              
              {analyticsData.isLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="mx-auto h-12 w-12 text-blue-600 animate-spin mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Loading Analytics</h3>
                  <p className="mt-2 text-gray-500">Please wait while we fetch your data...</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">Analytics Dashboard</h3>
                  <p className="mt-2 text-gray-500">
                    Configure your analytics service to display detailed reports and visualizations.
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    Charts, graphs, and data visualization components will appear here once configured.
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={handleRefresh}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Analytics Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Performance Metrics</h4>
                <div className="text-center py-8">
                  <TrendingUp className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Performance data will appear here</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">User Engagement</h4>
                <div className="text-center py-8">
                  <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Engagement metrics will appear here</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 