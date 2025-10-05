'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Order } from '@/types';
import OrderDetails from './OrderDetails';

export default function ArchivoSection() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  
  const { getPaidOrders, getOrdersByDateRange, language } = useAppStore();
  
  // Get orders for selected date
  const getOrdersForDate = () => {
    const startDate = new Date(selectedDate);
    const endDate = new Date(selectedDate);
    endDate.setHours(23, 59, 59, 999);
    
    return getOrdersByDateRange(startDate, endDate).filter(order => 
      order.status === 'PAGADO'
    );
  };
  
  const ordersForDate = getOrdersForDate();

  if (selectedOrder) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setSelectedOrder(null)}
            className="mobile-button-secondary px-4 py-2 h-auto"
          >
            ← {language === 'es' ? 'Volver al Archivo' : 'Back to Archive'}
          </button>
        </div>
        <OrderDetails 
          order={selectedOrder} 
          onBack={() => setSelectedOrder(null)}
          readOnly={true}
        />
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-header">
        {language === 'es' ? 'Archivo de Pedidos' : 'Order Archive'}
      </h2>
      
      <div className="bg-white rounded-lg p-4 mb-6 shadow-md">
        <label className="block text-mobile-lg font-semibold mb-2">
          {language === 'es' ? 'Seleccionar Fecha:' : 'Select Date:'}
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg text-mobile-lg"
        />
      </div>
      
      {ordersForDate.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-mobile-lg text-gray-500">
            {language === 'es' 
              ? 'No hay pedidos pagados para esta fecha' 
              : 'No paid orders for this date'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-md mb-4">
            <h3 className="text-mobile-lg font-semibold mb-2">
              {language === 'es' ? 'Resumen del Día' : 'Daily Summary'}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  {language === 'es' ? 'Total Pedidos:' : 'Total Orders:'}
                </p>
                <p className="text-mobile-xl font-bold text-primary-600">
                  {ordersForDate.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {language === 'es' ? 'Ingresos Total:' : 'Total Revenue:'}
                </p>
                <p className="text-mobile-xl font-bold text-success-600">
                  €{ordersForDate
                    .reduce((total, order) => 
                      total + order.items.reduce((sum, item) => sum + item.menuItem.price, 0), 0
                    )
                    .toFixed(2)
                  }
                </p>
              </div>
            </div>
          </div>
          
          {ordersForDate.map(order => {
            const total = order.items.reduce((sum, item) => sum + item.menuItem.price, 0);
            
            return (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="w-full text-left order-item p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-mobile-lg">
                      {language === 'es' ? 'Mesa' : 'Table'} {order.tableNumber} - 
                      {language === 'es' ? 'Pedido' : 'Order'} #{order.id.slice(-6)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.waiterName} • {order.items.length} {language === 'es' ? 'items' : 'items'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {order.paidAt ? new Date(order.paidAt).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : ''}
                    </div>
                    <div className="status-pagado">
                      {language === 'es' ? 'Pagado' : 'Paid'}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  {order.items.slice(0, 2).map((item, index) => (
                    <span key={item.id}>
                      {item.menuItem.name[language]}
                      {index < order.items.slice(0, 2).length - 1 ? ', ' : ''}
                    </span>
                  ))}
                  {order.items.length > 2 && ` +${order.items.length - 2} ${language === 'es' ? 'más' : 'more'}`}
                  
                  {order.todoJunto && (
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⚠️ {language === 'es' ? 'Todo junto' : 'All together'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="text-right">
                  <span className="font-bold text-success-600">
                    €{total.toFixed(2)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}