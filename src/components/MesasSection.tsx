'use client';

import { useAppStore } from '@/store/useAppStore';
import { useState, useEffect } from 'react';
import OrderDetails from './OrderDetails';
import { Order, ORDER_STATUS_TRANSITIONS, Table } from '@/types';

export default function MesasSection() {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { orders, tables, language, markOrderAsPaid } = useAppStore();
  
  // Force refresh when orders change
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [orders]);
  
  // Get orders by table (excluding paid and canceled)
  const getTableOrders = (tableNumber: number) => {
    return orders.filter(order => 
      order.tableNumber === tableNumber && 
      order.status !== 'CANCELED' && 
      order.status !== 'PAGADO'
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };
  
  // Get all available tables from API and their status
  const availableTables = tables.map(table => {
    const tableNum = parseInt(table.id.replace(/\D/g, '')) || 1;
    return { ...table, number: tableNum };
  }).sort((a, b) => a.number - b.number);
  
  const getTotalForTable = (tableNumber: number) => {
    const tableOrders = getTableOrders(tableNumber);
    return tableOrders.reduce((total, order) => {
      return total + order.items.reduce((orderTotal, item) => orderTotal + item.menuItem.price, 0);
    }, 0);
  };

  if (selectedOrder) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setSelectedOrder(null)}
            className="mobile-button-secondary px-4 py-2 h-auto"
          >
            ← {language === 'es' ? 'Volver a Mesa' : 'Back to Table'} {selectedTable}
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

  if (selectedTable) {
    const tableOrders = getTableOrders(selectedTable);
    const tableTotal = getTotalForTable(selectedTable);
    
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setSelectedTable(null)}
            className="mobile-button-secondary px-4 py-2 h-auto"
          >
            ← {language === 'es' ? 'Volver a Mesas' : 'Back to Tables'}
          </button>
        </div>
        
        <h2 className="section-header">
          {language === 'es' ? 'Mesa' : 'Table'} {selectedTable}
        </h2>
        
        <div className="bg-white rounded-lg p-4 mb-6 shadow-md">
          <div className="flex justify-between items-center">
            <span className="text-mobile-lg font-semibold">
              {language === 'es' ? 'Total Mesa:' : 'Table Total:'}
            </span>
            <span className="text-mobile-xl font-bold text-primary-600">
              €{tableTotal.toFixed(2)}
            </span>
          </div>
        </div>
        
        {tableOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-mobile-lg text-gray-500">
              {language === 'es' ? 'No hay pedidos para esta mesa' : 'No orders for this table'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tableOrders.map((order, orderIndex) => (
              <button
                key={`${order.id}-${refreshKey}-${orderIndex}`}
                onClick={() => setSelectedOrder(order)}
                className="w-full text-left order-item p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold text-mobile-lg">
                      {language === 'es' ? 'Pedido' : 'Order'} #{order.id.slice(-6)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {order.waiterName} • {order.items.length} {language === 'es' ? 'items' : 'items'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className={`status-badge mt-1 ${
                      order.status === 'TO_CONFIRM' ? 'status-to-confirm' :
                      order.status === 'CONFIRMED' ? 'status-confirmed' : 
                      order.status === 'PREPARED' ? 'status-prepared' : 'status-canceled'
                    }`}>
                      {getStatusText(order.status, language)}
                    </div>
                    
                    {order.status === 'PREPARED' && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await markOrderAsPaid(order.id);
                          } catch (error) {
                            console.error('Failed to mark order as paid:', error);
                            alert('Error al marcar como pagado. Se guardó localmente.');
                          }
                        }}
                        className="mt-2 w-full bg-success-500 hover:bg-success-600 text-white text-xs py-1 px-2 rounded font-medium"
                      >
                        {language === 'es' ? 'Marcar Pagado' : 'Mark as Paid'}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
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
                
                <div className="text-right mt-2">
                  <span className="font-bold text-primary-600">
                    €{order.items.reduce((sum, item) => sum + item.menuItem.price, 0).toFixed(2)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="section-header">
        {language === 'es' ? 'Estado de las Mesas' : 'Table Status'}
      </h2>
      
      {availableTables.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-mobile-lg text-gray-500">
            {language === 'es' ? 'No hay mesas configuradas' : 'No tables configured'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {availableTables.map((table, tableIndex) => {
            const tableOrders = getTableOrders(table.number);
            const tableTotal = getTotalForTable(table.number);
            const activeOrders = tableOrders.filter(order => order.status !== 'PREPARED').length;
            const hasActiveOrders = activeOrders > 0;
            
            return (
              <button
                key={`table-${table.id}-${refreshKey}-${tableIndex}`}
                onClick={() => setSelectedTable(table.number)}
                className={`p-4 h-auto aspect-square flex flex-col justify-center items-center ${
                  hasActiveOrders 
                    ? 'mobile-button-warning' 
                    : 'mobile-button-success opacity-50'
                }`}
              >
                <div className="text-3xl mb-2">🍽️</div>
                <div className="text-mobile-lg font-bold mb-1">{table.name}</div>
                <div className="text-xs opacity-90 mb-1">{table.id}</div>
                <div className="text-sm opacity-90">
                  {activeOrders} {language === 'es' ? 'activos' : 'active'}
                </div>
                {tableTotal > 0 && (
                  <div className="text-sm font-bold mt-1">
                    €{tableTotal.toFixed(2)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function getStatusText(status: string, language: string): string {
  const statusTexts = {
    es: {
      'TO_CONFIRM': 'Por Confirmar',
      'CONFIRMED': 'Confirmado',
      'PREPARED': 'Preparado',
      'PAGADO': 'Pagado',
      'CANCELED': 'Cancelado'
    },
    en: {
      'TO_CONFIRM': 'To Confirm',
      'CONFIRMED': 'Confirmed',
      'PREPARED': 'Prepared',
      'PAGADO': 'Paid',
      'CANCELED': 'Canceled'
    }
  };
  return statusTexts[language as 'es' | 'en'][status as keyof typeof statusTexts.es] || status;
}