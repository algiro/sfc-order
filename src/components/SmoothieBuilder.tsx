'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MenuItem, Fruit } from '@/types';
import apiService from '@/services/api';

interface SmoothieBuilderProps {
  item: MenuItem;
  onBack: () => void;
}

export default function SmoothieBuilder({ item, onBack }: SmoothieBuilderProps) {
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('small');
  const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([]);
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { language, addItemToOrder } = useAppStore();

  useEffect(() => {
    const loadFruits = async () => {
      try {
        const { fruits: availableFruits } = await apiService.getFruits();
        setFruits(availableFruits);
      } catch (error) {
        console.error('Failed to load fruits:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFruits();
  }, []);

  const sizes = [
    { id: 'small', name_es: 'Pequeño (0.38L)', name_en: 'Small (0.38L)', price: 4.90 },
    { id: 'large', name_es: 'Grande (0.50L)', name_en: 'Large (0.50L)', price: 5.90 }
  ];

  const defaultCustomizations = [
    'sin hielo', 'con hielo extra', 'más espeso', 'más líquido', 'sin azúcar', 'con miel'
  ];

  // Handle predefined recipes
  useEffect(() => {
    if (item.predefined_recipe && item.predefined_recipe.length > 0) {
      setSelectedFruits(item.predefined_recipe);
    }
  }, [item.predefined_recipe]);

  const toggleFruit = (fruitId: string) => {
    // Only allow fruit selection for custom smoothies
    if (item.predefined_recipe && item.predefined_recipe.length > 0) return;
    
    setSelectedFruits(prev => {
      if (prev.includes(fruitId)) {
        return prev.filter(id => id !== fruitId);
      } else if (prev.length < 3) {
        return [...prev, fruitId];
      }
      return prev;
    });
  };

  const toggleCustomization = (customization: string) => {
    setSelectedCustomizations(prev =>
      prev.includes(customization)
        ? prev.filter(c => c !== customization)
        : [...prev, customization]
    );
  };

  const handleConfirm = () => {
    if (selectedFruits.length === 0) {
      alert(language === 'es' ? 'Por favor selecciona al menos una fruta' : 'Please select at least one fruit');
      return;
    }

    const selectedSizeInfo = sizes.find(s => s.id === selectedSize);
    const smoothieCustomizations = [
      `Tamaño: ${selectedSizeInfo?.[language === 'es' ? 'name_es' : 'name_en']}`,
      `Frutas: ${selectedFruits.map(f => fruits.find(fruit => fruit.id === f)?.[language === 'es' ? 'name_es' : 'name_en']).join(', ')}`,
      ...selectedCustomizations
    ];

    // Use size-specific price
    const itemWithPrice = {
      ...item,
      price: selectedSizeInfo?.price || item.price
    };

    addItemToOrder(itemWithPrice, smoothieCustomizations);
    onBack();
  };

  const isCustomSmoothie = !item.predefined_recipe || item.predefined_recipe.length === 0;
  const isComplete = selectedFruits.length > 0;

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">{language === 'es' ? 'Cargando...' : 'Loading...'}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <button
          onClick={onBack}
          className="mobile-button-secondary px-4 py-2 h-auto"
        >
          ← {language === 'es' ? 'Volver' : 'Back'}
        </button>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-mobile-2xl font-bold mb-2">{item.name[language]}</h2>
        <p className="text-mobile-xl font-bold text-primary-600">
          €{sizes.find(s => s.id === selectedSize)?.price.toFixed(2)}
        </p>
        {item.description && (
          <p className="text-gray-600 mt-2">{item.description[language]}</p>
        )}
      </div>

      {/* Size Selection */}
      <div className="mb-6">
        <h3 className="text-mobile-lg font-semibold mb-3">
          {language === 'es' ? '1. Elige el tamaño:' : '1. Choose size:'}
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {sizes.map(size => (
            <button
              key={size.id}
              onClick={() => setSelectedSize(size.id)}
              className={`p-3 rounded-lg text-left transition-colors ${
                selectedSize === size.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{size[language === 'es' ? 'name_es' : 'name_en']}</span>
                <span className="font-bold">€{size.price.toFixed(2)}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Fruit Selection */}
      <div className="mb-6">
        <h3 className="text-mobile-lg font-semibold mb-3">
          {isCustomSmoothie ? (
            language === 'es' 
              ? `2. Elige hasta 3 frutas (${selectedFruits.length}/3):`
              : `2. Choose up to 3 fruits (${selectedFruits.length}/3):`
          ) : (
            language === 'es' ? '2. Ingredientes:' : '2. Ingredients:'
          )}
        </h3>
        
        {!isCustomSmoothie ? (
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-gray-700">
              {selectedFruits.map(f => fruits.find(fruit => fruit.id === f)?.[language === 'es' ? 'name_es' : 'name_en']).join(', ')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {fruits.map(fruit => (
              <button
                key={fruit.id}
                onClick={() => toggleFruit(fruit.id)}
                disabled={!selectedFruits.includes(fruit.id) && selectedFruits.length >= 3}
                className={`p-3 rounded-lg text-center transition-colors ${
                  selectedFruits.includes(fruit.id)
                    ? 'bg-primary-500 text-white'
                    : selectedFruits.length >= 3
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {fruit[language === 'es' ? 'name_es' : 'name_en']}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Additional Customizations */}
      <div className="mb-6">
        <h4 className="text-mobile-lg font-semibold mb-3">
          {language === 'es' ? '3. Personalizaciones:' : '3. Customizations:'}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {defaultCustomizations.map(customization => (
            <button
              key={customization}
              onClick={() => toggleCustomization(customization)}
              className={`p-3 rounded-lg text-sm transition-colors ${
                selectedCustomizations.includes(customization)
                  ? 'bg-secondary-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {customization}
            </button>
          ))}
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        disabled={!isComplete}
        className={`w-full py-4 rounded-lg font-semibold text-mobile-lg ${
          isComplete
            ? 'bg-success-500 text-white hover:bg-success-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {language === 'es' ? 'Añadir al Pedido' : 'Add to Order'}
      </button>
    </div>
  );
}