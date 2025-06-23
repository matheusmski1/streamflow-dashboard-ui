'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Plus, Package, Search, RefreshCw, Edit2, Trash2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient, Order, CreateOrderDto } from '@/lib/api';

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
  return (
    <ProtectedRoute>
      <OrdersContent />
    </ProtectedRoute>
  );
}

function OrdersContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, isDevelopmentMode } = useAuth();

  const [formData, setFormData] = useState<OrderFormData>({
    customer: '',
    product: '',
    quantity: 1,
    price: 0,
    title: '',
    description: '',
    amount: 0
  });

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  // Calcula o amount quando price ou quantity muda
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      amount: prev.price * prev.quantity
    }));
  }, [formData.price, formData.quantity]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      
      if (isDevelopmentMode) {
        // Simula alguns pedidos em desenvolvimento
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

      // Busca pedidos reais
      const response = await apiClient.getOrders({
        page: currentPage,
        limit: 10,
        search: searchTerm
      });
      
      // Garantir que sempre seja um array
      const ordersData = Array.isArray(response) ? response : [];
      setOrders(ordersData);
      // Note: Ajustar quando a API retornar paginação
      setTotalPages(Math.ceil(ordersData.length / 10));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      // Em caso de erro, garantir que orders seja um array vazio
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

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
        setFormData({ customer: '', product: '', quantity: 1, price: 0, title: '', description: '', amount: 0 });
        setShowCreateForm(false);
        return;
      }

      // Cria pedido real
      const orderData: CreateOrderDto = {
        ...formData,
        userId: user?.id || ''
      };
      
      console.log('Creating order with data:', orderData);
      const newOrder = await apiClient.createOrder(orderData);
      console.log('Order created successfully:', newOrder);
      console.log('Should trigger SSE event for order.created');
      
      setOrders(prev => [newOrder, ...prev]);
      setFormData({ customer: '', product: '', quantity: 1, price: 0, title: '', description: '', amount: 0 });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      if (isDevelopmentMode) {
        // Simula atualização em desenvolvimento
        setOrders(prev => prev.map(order => 
          order.id === editingOrder.id 
            ? { ...order, ...formData, updatedAt: new Date().toISOString() }
            : order
        ));
        setEditingOrder(null);
        setFormData({ customer: '', product: '', quantity: 1, price: 0, title: '', description: '', amount: 0 });
        return;
      }

      // Atualiza pedido real
      const updatedOrder = await apiClient.updateOrder(editingOrder.id, formData);
      setOrders(prev => prev.map(order => 
        order.id === editingOrder.id ? updatedOrder : order
      ));
      setEditingOrder(null);
      setFormData({ customer: '', product: '', quantity: 1, price: 0, title: '', description: '', amount: 0 });
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update order: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      if (isDevelopmentMode) {
        // Simula remoção em desenvolvimento
        setOrders(prev => prev.filter(order => order.id !== orderId));
        return;
      }

      // Remove pedido real
      await apiClient.deleteOrder(orderId);
      setOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Failed to delete order:', error);
      alert('Failed to delete order: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const startEdit = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      customer: order.customer,
      product: order.product,
      quantity: order.quantity,
      price: order.price,
      title: order.customer, // Usando customer como title por enquanto
      description: '', // Backend não retorna description
      amount: order.price * order.quantity
    });
    setShowCreateForm(true);
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

  const resetForm = () => {
    setFormData({ customer: '', product: '', quantity: 1, price: 0, title: '', description: '', amount: 0 });
    setEditingOrder(null);
    setShowCreateForm(false);
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
              <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus size={16} />
                <span>New Order</span>
              </button>
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Orders</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {isDevelopmentMode && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 mb-2">🚧 Development Mode Active</h3>
              <p className="text-sm text-blue-700">
                Orders functionality is working with mock data. In production, it will connect to the real backend API.
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Orders List</h3>
                <button
                  onClick={fetchOrders}
                  disabled={isLoading}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order, index) => (
                      <tr key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{(order.id || '').slice(-8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.product}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${order.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${(order.price * order.quantity).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEdit(order)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(order.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No orders found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Create/Edit Order Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingOrder ? 'Edit Order' : 'Create New Order'}
                </h3>
                <form onSubmit={editingOrder ? handleUpdateOrder : handleCreateOrder} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                    <input
                      type="text"
                      required
                      value={formData.customer}
                      onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product</label>
                    <input
                      type="text"
                      required
                      value={formData.product}
                      onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      readOnly
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      {editingOrder ? 'Update' : 'Create'} Order
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
