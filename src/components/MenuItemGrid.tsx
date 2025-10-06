'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MenuCategory, MenuItem } from '@/types';
import ItemCustomization from './ItemCustomization';
import apiService from '@/services/api';

interface MenuItemGridProps {
  category: MenuCategory;
}

export default function MenuItemGrid({ category }: MenuItemGridProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useAppStore();

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const { items: categoryItems } = await apiService.getMenuItems(category.id);
        setItems(categoryItems);
      } catch (error) {
        console.error('Failed to load menu items:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [category.id]);

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
      
      {loading ? (
        <div className="text-center py-8">
          <div className="text-gray-500">{language === 'es' ? 'Cargando...' : 'Loading...'}</div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">{language === 'es' ? 'No hay items disponibles' : 'No items available'}</div>
        </div>
      ) : (
        <div className="mobile-grid space-y-3">
          {items.map(item => (
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
                  {item.description && (
                    <div className="text-sm text-gray-600 mt-1">
                      {item.description[language]}
                    </div>
                  )}
                </div>
                <div className="text-mobile-xl font-bold text-right ml-2">
                  €{item.price.toFixed(2)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}