'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MenuItem, MenuCategory } from '@/types';

interface ItemCustomizationProps {
  item: MenuItem;
  category: MenuCategory;
  onBack: () => void;
}

export default function ItemCustomization({ item, category, onBack }: ItemCustomizationProps) {
  const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([]);
  const [customText, setCustomText] = useState('');
  const { language, addItemToOrder } = useAppStore();

  const toggleCustomization = (customization: string) => {
    setSelectedCustomizations(prev => 
      prev.includes(customization)
        ? prev.filter(c => c !== customization)
        : [...prev, customization]
    );
  };

  const handleConfirm = () => {
    addItemToOrder(item, selectedCustomizations, customText || undefined);
    onBack();
  };

  return (
    <div>
      <div className="bg-white rounded-lg p-4 mb-6 shadow-md">
        <h3 className="text-mobile-2xl font-bold mb-2">
          {item.name[language]}
        </h3>
        <div className="text-mobile-xl font-bold text-primary-600">
          €{item.price.toFixed(2)}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-mobile-lg font-semibold mb-3">
          {language === 'es' ? 'Personalizaciones:' : 'Customizations:'}
        </h4>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {category.defaultCustomizations.map(customization => (
            <button
              key={customization}
              onClick={() => toggleCustomization(customization)}
              className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                selectedCustomizations.includes(customization)
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {customization}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-mobile-lg font-semibold mb-2">
            {language === 'es' ? 'Personalización especial:' : 'Special customization:'}
          </label>
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg text-mobile-lg"
            rows={3}
            placeholder={language === 'es' ? 'Escriba aquí...' : 'Write here...'}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onBack}
          className="mobile-button-secondary flex-1"
        >
          {language === 'es' ? 'Cancelar' : 'Cancel'}
        </button>
        
        <button
          onClick={handleConfirm}
          className="mobile-button-success flex-1"
        >
          {language === 'es' ? 'Confirmar' : 'Confirm'}
        </button>
      </div>
    </div>
  );
}