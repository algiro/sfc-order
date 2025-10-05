'use client';

import { useAppStore } from '@/store/useAppStore';

interface OrderSummaryProps {
  onBackToMenu: () => void;
}

export default function OrderSummary({ onBackToMenu }: OrderSummaryProps) {
  const { currentOrder, language, confirmOrder, setOrderTodoJunto } = useAppStore();

  if (!currentOrder) {
    return (
      <div className="text-center py-8">
        <p className="text-mobile-lg text-gray-500">
          {language === 'es' ? 'No hay pedido actual' : 'No current order'}
        </p>
      </div>
    );
  }

  const total = currentOrder.items.reduce((sum, item) => sum + item.menuItem.price, 0);

  const handleConfirmOrder = () => {
    confirmOrder();
    // Navigate back to main or show success message
  };

  return (
    <div>
      <div className="bg-white rounded-lg p-4 mb-6 shadow-md">
        <h3 className="text-mobile-2xl font-bold mb-4">
          {language === 'es' ? 'Resumen del Pedido' : 'Order Summary'}
        </h3>
        
        <div className="mb-4">
          <p className="text-mobile-lg">
            <strong>{language === 'es' ? 'Mesa:' : 'Table:'}</strong> {currentOrder.tableNumber}
          </p>
          <p className="text-mobile-lg">
            <strong>{language === 'es' ? 'Camarero:' : 'Waiter:'}</strong> {currentOrder.waiterName}
          </p>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={currentOrder.todoJunto}
                onChange={(e) => setOrderTodoJunto(e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-mobile-lg font-medium">
                {language === 'es' ? 'Todo junto (servir al mismo tiempo)' : 'All together (serve at the same time)'}
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {currentOrder.items.map((item, index) => (
          <div key={`${item.id}-${index}`} className="order-item">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-mobile-lg flex-1">
                {item.menuItem.name[language]}
              </h4>
              <span className="text-mobile-lg font-bold ml-2">
                €{item.menuItem.price.toFixed(2)}
              </span>
            </div>
            
            {item.customizations.length > 0 && (
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {language === 'es' ? 'Personalizaciones:' : 'Customizations:'}
                </p>
                <div className="flex flex-wrap gap-1">
                  {item.customizations.map(customization => (
                    <span key={customization.id} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {customization.text}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {item.customText && (
              <div className="bg-yellow-50 p-2 rounded text-sm">
                <strong>{language === 'es' ? 'Nota:' : 'Note:'}</strong> {item.customText}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg p-4 mb-6 shadow-md">
        <div className="flex justify-between items-center">
          <span className="text-mobile-xl font-bold">
            {language === 'es' ? 'Total:' : 'Total:'}
          </span>
          <span className="text-mobile-2xl font-bold text-primary-600">
            €{total.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBackToMenu}
          className="mobile-button-secondary flex-1"
        >
          {language === 'es' ? 'Seguir Añadiendo' : 'Continue Adding'}
        </button>
        
        {currentOrder.items.length > 0 && (
          <button
            onClick={handleConfirmOrder}
            className="mobile-button-success flex-1"
          >
            {language === 'es' ? 'Enviar Pedido' : 'Send Order'}
          </button>
        )}
      </div>
    </div>
  );
}