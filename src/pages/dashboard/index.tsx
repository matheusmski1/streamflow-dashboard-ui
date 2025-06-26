import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, TrendingUp, Users, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import StreamTable from '@/components/StreamTable';
import StatCard from '@/components/StatCard';
import { apiClient, Order } from '@/services/api';

export default function DashboardPage() {
  const { user } = useAuth();
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
        const result = await apiClient.getOrders();
        setOrders(result.orders);
        
        const activeOrders = result.orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;
        const totalRevenue = result.orders.filter(o => o.status === 'COMPLETED').reduce((sum, order) => sum + order.price, 0);
        const completedOrders = result.orders.filter(o => o.status === 'COMPLETED').length;
        const pendingOrders = result.orders.filter(o => o.status === 'PENDING').length;
        
        setStats({ activeOrders, totalRevenue, completedOrders, pendingOrders });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <Layout title="Welcome to Dashboard">
      <div className="space-y-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Active Orders"
            value={stats.activeOrders}
            icon={<Activity />}
            trend={10}
            loading={isLoading}
          />
          <StatCard
            title="Total Revenue"
            value={stats.totalRevenue}
            icon={<TrendingUp />}
            trend={15}
            loading={isLoading}
            isCurrency
          />
          <StatCard
            title="Completed Orders"
            value={stats.completedOrders}
            icon={<Users />}
            trend={5}
            loading={isLoading}
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={<Zap />}
            trend={-8}
            loading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
              <Link
                href="/orders"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                View all
              </Link>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{order.customer}</p>
                      <p className="text-sm text-gray-600">
                        {order.product} x {order.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ${order.price.toFixed(2)}
                      </p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Live Stream</h2>
              <Link
                href="/test-events"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Test Events
              </Link>
            </div>
            <StreamTable />
          </div>
        </div>
      </div>
    </Layout>
  );
} 