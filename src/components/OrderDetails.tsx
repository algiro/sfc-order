'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Order, ItemStatus, ITEM_STATUS_TRANSITIONS, ORDER_STATUS_TRANSITIONS } from '@/types';

interface OrderDetailsProps {
  order: Order;
  onBack: () => void;
  onUpdateItemStatus?: (orderId: string, itemId: string, status: ItemStatus) => void;
  readOnly?: boolean;
}

export default function OrderDetails({ order, onBack, onUpdateItemStatus, readOnly = false }: OrderDetailsProps) {
  const { markOrderAsPaid, orders } = useAppStore();
  const { t, language } = useTranslation();
  const [localOrder, setLocalOrder] = useState(order);
  
  // Update local order when the order in store changes
  useEffect(() => {
    const updatedOrder = orders.find(o => o.id === order.id);
    if (updatedOrder) {
      setLocalOrder(updatedOrder);
    }
  }, [orders, order.id]);
  
  const handleUpdateItemStatus = (itemId: string, newStatus: ItemStatus) => {
    if (onUpdateItemStatus && !readOnly) {
      onUpdateItemStatus(localOrder.id, itemId, newStatus);
    }
  };
  
  const getAvailableTransitions = (currentStatus: ItemStatus): ItemStatus[] => {
    return ITEM_STATUS_TRANSITIONS[currentStatus] || [];
  };
  
  const total = localOrder.items.reduce((sum, item) => sum + item.menuItem.price, 0);

  return (
    <div>
      <div className="bg-white rounded-lg p-4 mb-6 shadow-md">
        <h2 className="text-mobile-2xl font-bold mb-4">
          {t('orders.orderDetails')}
        </h2>
        
        <div className="grid grid-cols-2 gap-4 text-mobile-lg">
          <div>
            <strong>{t('common.table')}:</strong>
            <br />{localOrder.tableNumber}
          </div>
          <div>
            <strong>{t('common.waiter')}</strong>
            <br />{localOrder.waiterName}
          </div>
          <div>
            <strong>{t('common.status')}</strong>
            <br />
            <span className={`status-badge ${
              localOrder.status === 'TO_CONFIRM' ? 'status-to-confirm' :
              localOrder.status === 'CONFIRMED' ? 'status-confirmed' : 
              localOrder.status === 'PREPARED' ? 'status-prepared' :
              localOrder.status === 'PAGADO' ? 'status-pagado' : 'status-canceled'
            }`}>
              {getOrderStatusText(localOrder.status, language)}
            </span>
          </div>
          <div>
            <strong>{t('common.time')}</strong>
            <br />{new Date(localOrder.createdAt).toLocaleTimeString('es-ES')}
          </div>
        </div>
        
        {localOrder.todoJunto && (
          <div className="mt-4 p-3 bg-yellow-100 rounded-lg border-l-4 border-yellow-400">
            <p className="text-sm font-semibold text-yellow-800 flex items-center">
              <span className="mr-2">⚠️</span>
              {t('orders.allTogetherWarning')}
            </p>
          </div>
        )}
      </div>
      
      <div className="space-y-4 mb-6">
        <h3 className="text-mobile-xl font-bold">
          {t('orders.orderItems')}
        </h3>
        
        {localOrder.items.map((item, index) => {
          const availableTransitions = getAvailableTransitions(item.status);
          
          return (
            <div key={`${item.id}-${index}`} className="order-item">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-mobile-lg mb-1">
                    {item.menuItem.name[language]}
                  </h4>
                  <div className="text-mobile-lg font-semibold text-primary-600">
                    €{item.menuItem.price.toFixed(2)}
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className={`status-badge mb-2 ${
                    item.status === 'TO_PREPARE' ? 'status-to-confirm' :
                    item.status === 'PREPARED' ? 'status-prepared' : 'status-canceled'
                  }`}>
                    {getItemStatusText(item.status, language)}
                  </div>
                  
                  {!readOnly && availableTransitions.length > 0 && (
                    <div className="space-y-1">
                      {availableTransitions.map(transition => (
                        <button
                          key={transition}
                          onClick={() => handleUpdateItemStatus(item.id, transition)}
                          className={`w-full text-xs py-1 px-2 rounded font-medium ${
                            transition === 'PREPARED' ? 'bg-success-500 hover:bg-success-600 text-white' :
                            transition === 'CANCELED' ? 'bg-error-500 hover:bg-error-600 text-white' :
                            'bg-primary-500 hover:bg-primary-600 text-white'
                          }`}
                        >
                          {getItemStatusText(transition, language)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {item.customizations.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    {t('common.customizations')}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {item.customizations.map(customization => (
                      <span key={customization.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {customization.text}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {item.customText && (
                <div className="bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">
                    {t('orders.specialNote')}
                  </p>
                  <p className="text-sm text-yellow-700">{item.customText}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="bg-white rounded-lg p-4 shadow-md">
        <div className="flex justify-between items-center text-mobile-xl mb-4">
          <span className="font-bold">
            {t('common.total')}
          </span>
          <span className="font-bold text-primary-600">
            €{total.toFixed(2)}
          </span>
        </div>
        
        {!readOnly && localOrder.status === 'PREPARED' && (
          <button
            onClick={() => markOrderAsPaid(localOrder.id)}
            className="w-full mobile-button-success"
          >
            {t('orders.markAsPaid')}
          </button>
        )}
      </div>
    </div>
  );
}

function getOrderStatusText(status: string, language: string): string {
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

function getItemStatusText(status: string, language: string): string {
  const statusTexts = {
    es: {
      'TO_PREPARE': 'Por Preparar',
      'PREPARED': 'Preparado',
      'CANCELED': 'Cancelado'
    },
    en: {
      'TO_PREPARE': 'To Prepare',
      'PREPARED': 'Prepared',
      'CANCELED': 'Canceled'
    }
  };
  return statusTexts[language as 'es' | 'en'][status as keyof typeof statusTexts.es] || status;
}