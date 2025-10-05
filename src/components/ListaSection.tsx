'use client';

import { useAppStore } from '@/store/useAppStore';
import { Order } from '@/types';
import OrderDetails from './OrderDetails';
import { useState, useEffect } from 'react';

export default function ListaSection() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { getConfirmedOrders, language, updateItemStatus, orders } = useAppStore();
  
  // Force refresh when orders change
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [orders]);
  
  const confirmedOrders = getConfirmedOrders();

  if (selectedOrder) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setSelectedOrder(null)}
            className="mobile-button-secondary px-4 py-2 h-auto"
          >
            ← {language === 'es' ? 'Volver a Lista' : 'Back to List'}
          </button>
        </div>
        <OrderDetails 
          order={selectedOrder} 
          onBack={() => setSelectedOrder(null)}
          onUpdateItemStatus={updateItemStatus}
        />
      </div>
    );
  }

  return (
    <div>
      <h2 className="section-header">
        {language === 'es' ? 'Lista de Pedidos - Cocina' : 'Order List - Kitchen'}
      </h2>
      
      {confirmedOrders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-mobile-lg text-gray-500">
            {language === 'es' ? 'No hay pedidos confirmados' : 'No confirmed orders'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {confirmedOrders.map((order, orderIndex) => (
            <button
              key={`${order.id}-${refreshKey}-${orderIndex}`}
              onClick={() => setSelectedOrder(order)}
              className="w-full text-left mobile-button-primary p-4 h-auto"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-mobile-lg">
                    {language === 'es' ? 'Mesa' : 'Table'} {order.tableNumber}
                  </div>
                  <div className="text-sm text-gray-200">
                    {order.waiterName} • {order.items.length} {language === 'es' ? 'items' : 'items'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm">
                    {order.confirmedAt ? new Date(order.confirmedAt).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : ''}
                  </div>
                  <div className={`status-badge mt-1 ${
                    order.status === 'CONFIRMED' ? 'status-confirmed' : 
                    order.status === 'PREPARED' ? 'status-prepared' : 'status-canceled'
                  }`}>
                    {getStatusText(order.status, language)}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-200">
                {order.items.slice(0, 2).map((item, index) => (
                  <span key={item.id}>
                    {item.menuItem.name[language]}
                    {index < order.items.slice(0, 2).length - 1 ? ', ' : ''}
                  </span>
                ))}
                {order.items.length > 2 && ` +${order.items.length - 2} ${language === 'es' ? 'más' : 'more'}`}
                
                {order.todoJunto && (
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800">
                      ⚠️ {language === 'es' ? 'Todo junto' : 'All together'}
                    </span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function getStatusText(status: string, language: string): string {
  const statusTexts = {
    es: {
      'CONFIRMED': 'Confirmado',
      'PREPARED': 'Preparado',
      'PAGADO': 'Pagado',
      'CANCELED': 'Cancelado'
    },
    en: {
      'CONFIRMED': 'Confirmed',
      'PREPARED': 'Prepared',
      'PAGADO': 'Paid',
      'CANCELED': 'Canceled'
    }
  };
  return statusTexts[language as 'es' | 'en'][status as keyof typeof statusTexts.es] || status;
}