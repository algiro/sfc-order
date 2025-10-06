'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MenuCategory } from '@/types';
import MenuItemGrid from './MenuItemGrid';

export default function MenuCategoryGrid() {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);
  const { menuCategories, language } = useAppStore();

  if (selectedCategory) {
    return (
      <div>
        <div className="mb-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className="mobile-button-secondary px-4 py-2 h-auto"
          >
            ← {language === 'es' ? 'Volver a Categorías' : 'Back to Categories'}
          </button>
        </div>
        <MenuItemGrid category={selectedCategory} />
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-mobile-2xl font-bold mb-4 text-center">
        {language === 'es' ? 'Seleccionar Categoría' : 'Select Category'}
      </h3>
      
      <div className="mobile-grid space-y-4">
        {menuCategories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category)}
            className="mobile-button-primary"
          >
            {getCategoryIcon(category.id)} {category.name[language]}
          </button>
        ))}
      </div>
    </div>
  );
}

function getCategoryIcon(categoryId: string): string {
  const icons: Record<string, string> = {
    cafes: '☕',
    te: '🍵',
    bebidas: '🥤',
    tostas: '🍞',
    arepas: '🫓',
    cuencos: '🥣',
    smoothies: '🥤'
  };
  return icons[categoryId] || '🍽️';
}