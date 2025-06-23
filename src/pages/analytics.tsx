import React from 'react';
import { BarChart3, TrendingUp, PieChart, LineChart } from 'lucide-react';
import Layout from '@/components/Layout';

export default function AnalyticsPage() {
  return (
    <Layout title="Analytics">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Analyze your business performance and trends</p>
        </div>

        {/* Placeholder para analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sales Chart</p>
                <p className="text-2xl font-bold text-gray-900">Coming Soon</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                <p className="text-2xl font-bold text-gray-900">+12.3%</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <PieChart className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Distribution</p>
                <p className="text-2xl font-bold text-gray-900">Charts</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center">
              <LineChart className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Trends</p>
                <p className="text-2xl font-bold text-gray-900">Reports</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow border border-gray-200 text-center">
          <BarChart3 className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
          <p className="text-gray-600 mb-4">
            Detailed analytics and reporting features will be available here.
          </p>
          <p className="text-sm text-gray-500">
            This section will include charts, graphs, and detailed business insights.
          </p>
        </div>
      </div>
    </Layout>
  );
} 