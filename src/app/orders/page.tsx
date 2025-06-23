'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Plus, Package, Search, RefreshCw, Edit2, Trash2, Activity } from 'lucide-react';
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
  const { user } = useAuth();
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Force re-render key para resolver problemas de hidratação
  const [renderKey, setRenderKey] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Debug: verificar se a aplicação está em modo desenvolvimento
  const isDevelopmentMode = process.env.NODE_ENV === 'development';

  // Debug: Log quando o componente é montado
  useEffect(() => {
    console.log('📱 OrdersContent component mounted');
    console.log('👤 User:', user);
    console.log('🌍 Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
      isDevelopment: isDevelopmentMode
    });
  }, []);

  // Debug: Log sempre que orders mudar
  useEffect(() => {
    console.log('📦 Orders state updated:', {
      count: orders.length,
      orders: orders.length > 0 ? orders : 'Empty array',
      isLoading,
      renderKey
    });
  }, [orders, isLoading, renderKey]);

  const updateFormData = (updates: Partial<OrderFormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...updates };
      // Auto-calculate amount when price or quantity changes
      if ('price' in updates || 'quantity' in updates) {
        updated.amount = updated.price * updated.quantity;
      }
      return updated;
    });
  };

  // Função para forçar re-render
  const forceUpdate = () => {
    setRenderKey(prev => prev + 1);
  };

  // Backup/restore dos orders no localStorage para casos extremos
  const saveOrdersBackup = (ordersData: Order[]) => {
    try {
      localStorage.setItem('orders_backup', JSON.stringify({
        orders: ordersData,
        timestamp: new Date().toISOString(),
        page: currentPage,
        search: searchTerm
      }));
    } catch (error) {
      console.warn('Failed to save orders backup:', error);
    }
  };

  const restoreOrdersBackup = () => {
    try {
      const backup = localStorage.getItem('orders_backup');
      if (backup) {
        const parsed = JSON.parse(backup);
        const backupAge = Date.now() - new Date(parsed.timestamp).getTime();
        
        // Usar backup apenas se for recente (< 5 minutos)
        if (backupAge < 5 * 60 * 1000 && Array.isArray(parsed.orders)) {
          console.log('🔄 Restoring orders from backup...');
          setOrders(parsed.orders);
          setLastUpdate(new Date(parsed.timestamp));
          forceUpdate();
          return true;
        }
      }
    } catch (error) {
      console.warn('Failed to restore orders backup:', error);
    }
    return false;
  };

  // Adiciona um interval para verificar se os dados mudaram (útil em produção)
  useEffect(() => {
    if (isDevelopmentMode) return; // Não executar em desenvolvimento
    
    let intervalId: NodeJS.Timeout;
    
    // Verifica mudanças a cada 30 segundos apenas se não estiver carregando
    if (!isLoading && orders.length > 0) {
      intervalId = setInterval(async () => {
        try {
          console.log('🔄 Background check for order updates...');
          const result = await apiClient.getOrders({
            page: currentPage,
            limit: 10,
            search: searchTerm
          });
          
          if (result?.orders && Array.isArray(result.orders)) {
            // Compara se houve mudanças nos dados
            const currentIds = orders.map(o => o.id).sort();
            const newIds = result.orders.map(o => o.id).sort();
            
            if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
              console.log('📊 Orders changed, updating state...');
              setOrders(result.orders);
              setLastUpdate(new Date());
              forceUpdate();
            }
          }
        } catch (error) {
          console.error('Background check failed:', error);
        }
      }, 30000); // 30 segundos
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isDevelopmentMode, isLoading, orders, currentPage, searchTerm]);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      
      console.log('🔍 Fetching orders...');
      console.log('📊 Current environment:', {
        isDevelopment: isDevelopmentMode,
        apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
        nodeEnv: process.env.NODE_ENV,
        currentPage,
        searchTerm
      });
      
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
        console.log('✅ Using mock orders for development:', mockOrders);
        setOrders(mockOrders);
        setTotalPages(1);
        return;
      }

      // Busca pedidos reais
      console.log('🌐 Fetching real orders from API...');
      const result = await apiClient.getOrders({
        page: currentPage,
        limit: 10,
        search: searchTerm
      });

      console.log('✅ Orders API response:', result);
      console.log('📦 Orders received:', result.orders?.length || 0);
      console.log('📊 Total count:', result.total);

      // Validação extra dos dados
      if (result && Array.isArray(result.orders)) {
        console.log('✅ Orders data is valid array');
        
        // Força re-render para resolver problemas de hidratação em produção
        setOrders([]);
        setTimeout(() => {
          setOrders(result.orders);
          setTotalPages(Math.max(1, Math.ceil((result.total || result.orders.length) / 10)));
          setLastUpdate(new Date());
          saveOrdersBackup(result.orders);
          forceUpdate();
        }, 0);
      } else {
        console.warn('⚠️ Invalid orders data structure:', result);
        setOrders([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('❌ Failed to fetch orders:', error);
      // Log mais detalhado do erro
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
      }
      
      // Tentar restaurar do backup em caso de erro
      if (!restoreOrdersBackup()) {
        // Em caso de erro sem backup, garantir que orders seja um array vazio
        setOrders([]);
      }
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
    const calculatedAmount = order.price * order.quantity;
    setFormData({
      customer: order.customer,
      product: order.product,
      quantity: order.quantity,
      price: order.price,
      title: order.customer, // Usando customer como title por enquanto
      description: '', // Backend não retorna description
      amount: calculatedAmount
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
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Orders List</h3>
                  {lastUpdate && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last updated: {lastUpdate.toLocaleTimeString()}
                    </p>
                  )}
                  {!isDevelopmentMode && (
                    <p className="text-xs text-blue-600 mt-1">
                      Render #{renderKey} | Orders: {orders.length} | 
                      {isLoading ? ' Loading...' : ' Ready'}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={fetchOrders}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                  >
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={() => {
                      forceUpdate();
                      fetchOrders();
                    }}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    title="Force refresh if data isn't updating"
                  >
                    <Activity size={16} />
                    <span>Force</span>
                  </button>
                  {!isDevelopmentMode && orders.length === 0 && (
                    <button
                      onClick={restoreOrdersBackup}
                      className="flex items-center space-x-2 px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700"
                      title="Restore from backup if orders are missing"
                    >
                      <Package size={16} />
                      <span>Restore</span>
                    </button>
                  )}
                </div>
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
            <div className="bg-white rounded-lg shadow-md border border-gray-200" key={`orders-table-${renderKey}-${orders.length}`}>
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
                    {orders.map((order, index) => {
                      // Garantir que os valores sejam números válidos
                      const price = Number(order.price) || 0;
                      const quantity = Number(order.quantity) || 1;
                      const total = price * quantity;
                      
                      return (
                        <tr key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{(order.id || 'unknown').slice(-8)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.customer || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.product || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${total.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status || 'PENDING')}`}>
                              {order.status || 'PENDING'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
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
                      );
                    })}
                  </tbody>
                </table>
                {isLoading && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading orders...</p>
                  </div>
                )}
                {!isLoading && orders.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No orders found</p>
                    <p className="text-sm text-gray-400 mt-2">
                      {searchTerm ? 'Try adjusting your search terms' : 'Create your first order using the button above'}
                    </p>
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
                      onChange={(e) => updateFormData({ customer: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Product</label>
                    <input
                      type="text"
                      required
                      value={formData.product}
                      onChange={(e) => updateFormData({ product: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => updateFormData({ title: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateFormData({ description: e.target.value })}
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
                        onChange={(e) => updateFormData({ quantity: parseInt(e.target.value) })}
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
                        onChange={(e) => updateFormData({ price: parseFloat(e.target.value) })}
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
