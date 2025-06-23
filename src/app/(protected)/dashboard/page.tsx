'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X, Activity, TrendingUp, Users, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import StreamTable from '@/components/StreamTable';
import StatCard from '@/components/StatCard';
import { apiClient, Order } from '@/lib/api';

export default function DashboardPage() {
  const { user, isDevelopmentMode } = useAuth();
  
  // Debug: Log environment info
  useEffect(() => {
    console.log('🏠 Dashboard Environment Info:', {
      isDevelopmentMode,
      NODE_ENV: process.env.NODE_ENV,
      DEV_MODE: process.env.NEXT_PUBLIC_DEV_MODE,
      API_URL: process.env.NEXT_PUBLIC_API_URL
    });
  }, [isDevelopmentMode]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    activeOrders: 0,
    totalRevenue: 0,
    completedOrders: 0,
    pendingOrders: 0
  });
  const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        if (isDevelopmentMode) {
          // Simula dados em desenvolvimento
          const mockOrders: Order[] = [
            {
              id: 'dev-order-1',
              customer: 'João Silva',
              product: 'Produto A',
              quantity: 2,
              price: 299.99,
              status: 'COMPLETED',
              userId: user?.id || 'dev-user',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 'dev-order-2',
              customer: 'Maria Santos',
              product: 'Produto B',
              quantity: 1,
              price: 199.99,
              status: 'PENDING',
              userId: user?.id || 'dev-user',
              createdAt: new Date(Date.now() - 86400000).toISOString(),
              updatedAt: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: 'dev-order-3',
              customer: 'Pedro Costa',
              product: 'Produto C',
              quantity: 3,
              price: 149.99,
              status: 'PROCESSING',
              userId: user?.id || 'dev-user',
              createdAt: new Date(Date.now() - 172800000).toISOString(),
              updatedAt: new Date(Date.now() - 172800000).toISOString(),
            }
          ];
          setOrders(mockOrders);
          
          // Calcula estatísticas dos dados mock
          const activeOrders = mockOrders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;
          const totalRevenue = mockOrders.filter(o => o.status === 'COMPLETED').reduce((sum, order) => sum + order.price, 0);
          const completedOrders = mockOrders.filter(o => o.status === 'COMPLETED').length;
          const pendingOrders = mockOrders.filter(o => o.status === 'PENDING').length;
          
          setStats({ activeOrders, totalRevenue, completedOrders, pendingOrders });
          return;
        }

        // Busca dados reais
        console.log('🔍 Dashboard: Fetching orders from API...');
        const response = await apiClient.getOrders();
        console.log('📦 Dashboard: API response:', response);
        
        // Garantir que sempre seja um array - response.orders é o array de pedidos
        const ordersData = response && Array.isArray(response.orders) ? response.orders : [];
        console.log('📊 Dashboard: Orders data:', ordersData);
        setOrders(ordersData);
        
        // Calcula estatísticas
        const activeOrders = ordersData.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;
        const totalRevenue = ordersData.filter(o => o.status === 'COMPLETED').reduce((sum, order) => sum + order.price, 0);
        const completedOrders = ordersData.filter(o => o.status === 'COMPLETED').length;
        const pendingOrders = ordersData.filter(o => o.status === 'PENDING').length;
        
        setStats({ activeOrders, totalRevenue, completedOrders, pendingOrders });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Em caso de erro, garantir que orders seja um array vazio
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isDevelopmentMode]); // Removido user?.id para evitar loop

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {user?.name || 'User'}! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              Here&apos;s what&apos;s happening with your business today.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live Dashboard</span>
          </div>
        </div>
      </div>

      {/* Development Mode Notice */}
      {isDevelopmentMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">🚧 Development Mode Active</h3>
                     <p className="text-sm text-blue-700">
             You&apos;re currently viewing mock data. In production, this will show real-time data from your backend API.
           </p>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Orders"
          value={isLoading ? '...' : stats.activeOrders.toLocaleString()}
          icon={<Activity size={24} />}
          color="blue"
        />
        <StatCard
          title="Total Revenue"
          value={isLoading ? '...' : `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={<TrendingUp size={24} />}
          color="green"
        />
        <StatCard
          title="Completed Orders"
          value={isLoading ? '...' : stats.completedOrders.toLocaleString()}
          icon={<Zap size={24} />}
          color="yellow"
        />
        <StatCard
          title="Pending Orders"
          value={isLoading ? '...' : stats.pendingOrders.toLocaleString()}
          icon={<Users size={24} />}
          color="red"
        />
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <p className="text-sm text-gray-600">Latest orders from your customers</p>
            </div>
            <a 
              href="/orders" 
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all orders →
            </a>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(orders || []).slice(0, 5).map((order, index) => (
                <tr key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                    ${order.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(orders || []).length === 0 && !isLoading && (
            <div className="text-center py-8">
              <Activity className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first order
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Real-time Stream Section */}
      <StreamTable />
    </div>
  )
} 