'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MenuCategory, MenuItem } from '@/types';
import ItemCustomization from './ItemCustomization';

interface MenuItemGridProps {
  category: MenuCategory;
}

export default function MenuItemGrid({ category }: MenuItemGridProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const { language } = useAppStore();

  if (selectedItem) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setSelectedItem(null)}
            className="mobile-button-secondary px-4 py-2 h-auto"
          >
            ← {language === 'es' ? 'Volver a Items' : 'Back to Items'}
          </button>
        </div>
        <ItemCustomization 
          item={selectedItem} 
          category={category}
          onBack={() => setSelectedItem(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-mobile-2xl font-bold mb-4 text-center">
        {category.name[language]}
      </h3>
      
      <div className="mobile-grid space-y-3">
        {category.items.map(item => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="mobile-button-primary text-left p-4 h-auto"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-semibold text-mobile-lg mb-1">
                  {item.name[language]}
                </div>
              </div>
              <div className="text-mobile-xl font-bold text-right ml-2">
                €{item.price.toFixed(2)}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}