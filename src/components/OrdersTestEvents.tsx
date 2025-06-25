import React, { useState } from 'react';
import { Package, Circle, RefreshCw } from 'lucide-react';
import { apiClient, CreateOrderDto } from '@/services/api';

const uuidStatic = 'fe5c2895-26d6-48b8-a529-17aea2d2f4b8';

interface GeneratedOrder extends CreateOrderDto {
  id: string;
  timestamp: string;
}

const customers = ['Acme Inc.', 'Globex', 'Initech', 'Umbrella', 'Wayne Enterprises'];
const products = ['Widget', 'Gadget', 'Doohickey', 'Contraption', 'Thingamajig'];

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateRandomOrder = (): GeneratedOrder => {
  const customer = customers[randomInt(0, customers.length - 1)];
  const product = products[randomInt(0, products.length - 1)];
  const quantity = randomInt(1, 5);
  const price = randomInt(10, 500);
  const amount = price * quantity;
  const timestamp = new Date().toISOString();
  return {
    id: `order-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp,
    customer,
    product,
    quantity,
    price,
    amount,
    status: 'PENDING',
    title: `${product} x${quantity}`,
    description: `Order of ${quantity} ${product}(s) for ${customer}`,
    userId: uuidStatic,
  };
};

const OrdersTestEvents: React.FC = () => {
  const [orders, setOrders] = useState<GeneratedOrder[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const generateOrders = async () => {
    setIsGenerating(true);
    const generated: GeneratedOrder[] = [];
    for (let i = 0; i < 10; i++) {
      generated.push(generateRandomOrder());
      await new Promise(r => setTimeout(r, 100));
    }
    setOrders(generated);
    setIsGenerating(false);
  };

  const sendToSQS = async () => {
    if (orders.length === 0) return;
    setIsSending(true);
    console.log(`🚀 Iniciando envio de ${orders.length} orders para SQS (20s)`);
    const duration = 20000;
    const start = Date.now();
    let index = 0;
    const interval = setInterval(async () => {
      if (Date.now() - start >= duration) {
        clearInterval(interval);
        setIsSending(false);
        console.log(`✅ Envio concluído: ${index} orders enviadas`);
        return;
      }
      if (index < orders.length) {
        const order = orders[index];
        try {
          const { id, timestamp, ...orderData } = order;
          console.log(`📤 Enviando order ${index + 1}/${orders.length}:`, orderData);
          const res = await apiClient.createOrder(orderData);
          console.log(`✅ Order ${index + 1} enviada com sucesso:`, res.id);
        } catch (err) {
          console.error(`❌ Erro ao enviar order ${index + 1}:`, err);
        }
        index++;
      }
    }, 1000);
  };

  const sendToSQSFast = async () => {
    if (orders.length === 0) return;
    setIsSending(true);
    console.log(`🚀 Iniciando envio rápido de ${orders.length} orders para SQS (2s)`);
    let index = 0;
    const interval = setInterval(async () => {
      if (index >= orders.length) {
        clearInterval(interval);
        setIsSending(false);
        console.log(`✅ Envio rápido concluído: ${index} orders enviadas`);
        return;
      }
      const order = orders[index];
      try {
        const { id, timestamp, ...orderData } = order;
        console.log(`📤 Enviando order ${index + 1}/${orders.length} (rápido):`, orderData);
        const res = await apiClient.createOrder(orderData);
        console.log(`✅ Order ${index + 1} enviada com sucesso (rápido):`, res.id);
      } catch (err) {
        console.error(`❌ Erro ao enviar order ${index + 1} (rápido):`, err);
      }
      index++;
    }, 200); // 200ms = 2 segundos para 10 orders
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={generateOrders}
          disabled={isGenerating || isSending}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <Circle size={16} className={isGenerating ? 'animate-spin' : ''} />
          <span>{isGenerating ? 'Gerando...' : 'Gerar 10 Orders'}</span>
        </button>
        
        {orders.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={sendToSQS}
              disabled={isSending}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              <Package size={16} className={isSending ? 'animate-spin' : ''} />
              <span>{isSending ? 'Enviando...' : 'SQS (20s)'}</span>
            </button>
            
            <button
              onClick={sendToSQSFast}
              disabled={isSending}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            >
              <Package size={16} className={isSending ? 'animate-spin' : ''} />
              <span>{isSending ? 'Enviando...' : 'SQS (2s)'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Orders Preview */}
      {orders.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Orders Geradas ({orders.length})</h4>
            <div className="text-xs text-gray-500">
              {orders.length > 0 && `Total: R$ ${orders.reduce((sum, o) => sum + o.amount, 0).toFixed(2)}`}
            </div>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {orders.map((order, index) => (
              <div key={order.id} className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{order.customer}</p>
                    <p className="text-xs text-gray-600">{order.product} x{order.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">R$ {order.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{new Date(order.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Pronto para gerar eventos</span>
        </div>
      </div>
    </div>
  );
};

export default OrdersTestEvents; 