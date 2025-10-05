'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { User } from '@/types';
import MenuCategoryGrid from './MenuCategoryGrid';
import OrderSummary from './OrderSummary';

export default function TomarSection() {
  const [step, setStep] = useState<'table' | 'waiter' | 'menu' | 'summary'>('table');
  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [selectedWaiter, setSelectedWaiter] = useState<User | null>(null);
  const [todoJunto, setTodoJunto] = useState<boolean>(false);
  
  const { 
    language, 
    users, 
    currentOrder, 
    createOrder, 
    resetCurrentOrder,
    setOrderTodoJunto
  } = useAppStore();

  const waiters = users.filter(user => user.role === 'WAITER');

  const handleTableSelection = (table: number) => {
    setTableNumber(table);
    setStep('waiter');
  };

  const handleWaiterSelection = (waiter: User) => {
    setSelectedWaiter(waiter);
    if (tableNumber) {
      createOrder(tableNumber, waiter.id, waiter.name, todoJunto);
      setStep('menu');
    }
  };

  const handleBackToTable = () => {
    setStep('table');
    setTableNumber(null);
    setSelectedWaiter(null);
    setTodoJunto(false);
    resetCurrentOrder();
  };

  const handleViewSummary = () => {
    setStep('summary');
  };

  if (step === 'table') {
    return (
      <div>
        <h2 className="section-header">
          {language === 'es' ? 'Seleccionar Mesa' : 'Select Table'}
        </h2>
        
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 20 }, (_, i) => i + 1).map(table => (
            <button
              key={table}
              onClick={() => handleTableSelection(table)}
              className="mobile-button-primary aspect-square"
            >
              <div className="text-center">
                <div className="text-2xl mb-1">🍽️</div>
                <div className="text-lg font-bold">{table}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'waiter') {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setStep('table')}
            className="mobile-button-secondary px-4 py-2 h-auto"
          >
            ← {language === 'es' ? 'Cambiar Mesa' : 'Change Table'}
          </button>
        </div>
        
        <h2 className="section-header">
          {language === 'es' ? 'Mesa' : 'Table'} {tableNumber} - {language === 'es' ? 'Seleccionar Camarero' : 'Select Waiter'}
        </h2>
        
        <div className="bg-white rounded-lg p-4 mb-6 shadow-md">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={todoJunto}
              onChange={(e) => setTodoJunto(e.target.checked)}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-mobile-lg font-medium">
              {language === 'es' ? 'Todo junto (servir al mismo tiempo)' : 'All together (serve at the same time)'}
            </span>
          </label>
        </div>
        
        <div className="mobile-grid">
          {waiters.map(waiter => (
            <button
              key={waiter.id}
              onClick={() => handleWaiterSelection(waiter)}
              className="mobile-button-primary"
            >
              👤 {waiter.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'summary') {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setStep('menu')}
            className="mobile-button-secondary px-4 py-2 h-auto"
          >
            ← {language === 'es' ? 'Seguir Añadiendo' : 'Continue Adding'}
          </button>
        </div>
        <OrderSummary onBackToMenu={() => setStep('menu')} />
      </div>
    );
  }

  // Menu step
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleBackToTable}
          className="mobile-button-secondary px-4 py-2 h-auto"
        >
          ← {language === 'es' ? 'Nueva Mesa' : 'New Table'}
        </button>
        
        {currentOrder && currentOrder.items.length > 0 && (
          <button
            onClick={handleViewSummary}
            className="mobile-button-success px-4 py-2 h-auto"
          >
            📋 {language === 'es' ? 'Ver Pedido' : 'View Order'} ({currentOrder.items.length})
          </button>
        )}
      </div>
      
      <h2 className="section-header">
        {language === 'es' ? 'Mesa' : 'Table'} {tableNumber} - {selectedWaiter?.name}
      </h2>
      
      <MenuCategoryGrid />
    </div>
  );
}