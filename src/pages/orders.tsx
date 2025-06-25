import React, { useState, useEffect, useCallback } from 'react';
import { Package, Search, RefreshCw, Edit2, Trash2, Plus, Eye } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import { apiClient, Order, CreateOrderDto } from '@/services/api';

interface OrderFormData {
  customer: string;
  product: string;
  quantity: number;
  price: number;
  title: string;
  description: string;
  amount: number;
}

export default function OrdersPage() {
  const { user, isDevelopmentMode } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<OrderFormData>({
    customer: '', product: '', quantity: 1, price: 0, title: '', description: '', amount: 0
  });
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (isDevelopmentMode) {
        // Dados mock para desenvolvimento
        const mockOrders: Order[] = [
          {
            id: 'dev-order-1',
            customer: 'João Silva',
            product: 'Notebook Dell',
            quantity: 1,
            price: 2999.99,
            status: 'PENDING',
            userId: user?.id || 'dev-user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'dev-order-2',
            customer: 'Maria Santos',
            product: 'Mouse Logitech',
            quantity: 2,
            price: 49.99,
            status: 'COMPLETED',
            userId: user?.id || 'dev-user',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
          }
        ];
        setOrders(mockOrders);
        setTotalPages(1);
        return;
      }

      // Busca dados reais
      const result = await apiClient.getOrders({
        page: currentPage,
        limit: 10,
        search: searchTerm
      });

      if (result && Array.isArray(result.orders)) {
        setOrders(result.orders);
        setTotalPages(Math.max(1, Math.ceil((result.total || result.orders.length) / 10)));
      } else {
        setOrders([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, isDevelopmentMode, user?.id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isDevelopmentMode) {
        // Simula criação em desenvolvimento
        const newOrder: Order = {
          id: 'dev-order-' + Date.now(),
          customer: formData.customer,
          product: formData.product,
          quantity: formData.quantity,
          price: formData.price,
          status: 'PENDING',
          userId: user?.id || 'dev-user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setOrders(prev => [newOrder, ...prev]);
        resetForm();
        return;
      }

      // Cria pedido real
      const orderData: CreateOrderDto = {
        ...formData,
        userId: user?.id || ''
      };
      
      const newOrder = await apiClient.createOrder(orderData);
      setOrders(prev => [newOrder, ...prev]);
      resetForm();
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      if (!isDevelopmentMode) {
        await apiClient.deleteOrder(orderId);
      }
      setOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const resetForm = () => {
    setFormData({ customer: '', product: '', quantity: 1, price: 0, title: '', description: '', amount: 0 });
    setEditingOrder(null);
    setShowCreateForm(false);
  };

  const updateFormData = (updates: Partial<OrderFormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...updates };
      if ('price' in updates || 'quantity' in updates) {
        updated.amount = updated.price * updated.quantity;
      }
      return updated;
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Layout title="Orders Management">
      <div className="space-y-6">
        {/* Header com botão de criar */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-600">Manage your orders and track their status</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </button>
        </div>

        {/* Busca */}
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={fetchOrders}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Development Mode Notice */}
        {isDevelopmentMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">🚧 Development Mode</h3>
            <p className="text-sm text-blue-700">
              You&apos;re viewing mock data. In production, this will show real orders from your API.
            </p>
          </div>
        )}

        {/* Lista de orders */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ${order.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-600 hover:text-red-900 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {orders.length === 0 && (
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first order.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modal de criação */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Order</h3>
              
              <form onSubmit={handleCreateOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <input
                    type="text"
                    required
                    value={formData.customer}
                    onChange={(e) => updateFormData({ customer: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product</label>
                  <input
                    type="text"
                    required
                    value={formData.product}
                    onChange={(e) => updateFormData({ product: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => updateFormData({ title: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => updateFormData({ description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => updateFormData({ quantity: parseInt(e.target.value) })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => updateFormData({ price: parseFloat(e.target.value) })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Create Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 