import { MenuCategory, MenuItem } from '@/types';

// Import the original menu data
const menuData = require('./menuData.cjs');

// Default customizations for each category
const DEFAULT_CUSTOMIZATIONS = {
  cafes: [
    "descafeinado", "con avena", "con soja", "con almendra", "sin lactosa", 
    "oscuro", "muy caliente", "clarito", "no tan caliente", "sin espuma", "mucha espuma"
  ],
  te: [
    "con miel", "con limón", "muy caliente", "tibio", "sin azúcar", "con stevia"
  ],
  bebidas: [
    "con hielo", "sin hielo", "con limón", "muy frío", "temperatura ambiente"
  ],
  tostas: [
    "sin gluten", "más tostada", "menos tostada", "sin tomate", "extra aguacate", "sin cebolla"
  ],
  arepas: [
    "sin queso", "extra queso", "sin cebolla", "más relleno", "menos sal", "bien caliente"
  ]
};

// Convert menu data to TypeScript format
function convertMenuData(): MenuCategory[] {
  const categories: MenuCategory[] = [];
  
  Object.entries(menuData).forEach(([categoryKey, items]: [string, any[]]) => {
    const category: MenuCategory = {
      id: categoryKey,
      name: {
        es: getCategoryNameEs(categoryKey),
        en: getCategoryNameEn(categoryKey),
      },
      items: items.map((item: any) => convertMenuItem(item, categoryKey)),
      defaultCustomizations: DEFAULT_CUSTOMIZATIONS[categoryKey as keyof typeof DEFAULT_CUSTOMIZATIONS] || []
    };
    categories.push(category);
  });
  
  return categories;
}

function getCategoryNameEs(key: string): string {
  const names = {
    cafes: 'Cafés',
    te: 'Té e Infusiones',
    bebidas: 'Bebidas',
    tostas: 'Tostas',
    arepas: 'Arepas'
  };
  return names[key as keyof typeof names] || key;
}

function getCategoryNameEn(key: string): string {
  const names = {
    cafes: 'Coffee',
    te: 'Tea & Infusions',
    bebidas: 'Drinks',
    tostas: 'Toast',
    arepas: 'Arepas'
  };
  return names[key as keyof typeof names] || key;
}

function convertMenuItem(item: any, category: string): MenuItem {
  // Handle different item structures
  let name = { es: '', en: '' };
  let price = 0;
  
  if (category === 'tostas' || category === 'arepas') {
    // Special handling for tostas and arepas
    name = {
      es: `${item.name} - ${item.ingredients?.es || ''}`,
      en: `${item.name} - ${item.ingredients?.en || ''}`
    };
    price = parseFloat((item.tostaPrice || item.price || '0').replace(',', '.'));
  } else {
    // Handle cafes, te, bebidas
    name = item.name || { es: 'Sin nombre', en: 'No name' };
    price = parseFloat((item.price || '0').replace(',', '.'));
  }
  
  return {
    id: `${category}_${item.id}`,
    name,
    price,
    category,
    customizations: DEFAULT_CUSTOMIZATIONS[category as keyof typeof DEFAULT_CUSTOMIZATIONS] || []
  };
}

export const MENU_CATEGORIES = convertMenuData();
export default MENU_CATEGORIES;