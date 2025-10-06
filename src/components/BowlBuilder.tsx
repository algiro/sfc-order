'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MenuItem, Fruit } from '@/types';
import apiService from '@/services/api';

interface BowlBuilderProps {
  item: MenuItem;
  onBack: () => void;
}

export default function BowlBuilder({ item, onBack }: BowlBuilderProps) {
  const [selectedBase, setSelectedBase] = useState<string>('');
  const [selectedCereal, setSelectedCereal] = useState<string>('');
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);
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

  const baseIngredients = [
    { id: 'yogur_griego', name_es: 'Yogur Griego', name_en: 'Greek Yogurt' },
    { id: 'yogur_vegetal', name_es: 'Yogur Vegetal', name_en: 'Vegetarian Yogurt' },
    { id: 'acai', name_es: 'Acai', name_en: 'Acai' }
  ];

  const cereals = [
    { id: 'avena', name_es: 'Avena', name_en: 'Oat' },
    { id: 'espelta', name_es: 'Espelta', name_en: 'Spelt' },
    { id: 'muesli', name_es: 'Muesli', name_en: 'Muesli' },
    { id: 'cereales_pop', name_es: 'Cereales Pop', name_en: 'Pop Cereals' }
  ];

  const defaultCustomizations = [
    'extra granola', 'sin miel', 'con miel', 'extra fruta', 'sin frutos secos'
  ];

  const toggleFruit = (fruitId: string) => {
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
    if (!selectedBase || !selectedCereal || selectedFruits.length === 0) {
      alert(language === 'es' ? 'Por favor selecciona base, cereal y al menos una fruta' : 'Please select base, cereal and at least one fruit');
      return;
    }

    const bowlCustomizations = [
      `Base: ${baseIngredients.find(b => b.id === selectedBase)?.[language === 'es' ? 'name_es' : 'name_en']}`,
      `Cereal: ${cereals.find(c => c.id === selectedCereal)?.[language === 'es' ? 'name_es' : 'name_en']}`,
      `Frutas: ${selectedFruits.map(f => fruits.find(fruit => fruit.id === f)?.[language === 'es' ? 'name_es' : 'name_en']).join(', ')}`,
      ...selectedCustomizations
    ];

    addItemToOrder(item, bowlCustomizations);
    onBack();
  };

  const isComplete = selectedBase && selectedCereal && selectedFruits.length > 0;

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
        <p className="text-mobile-xl font-bold text-primary-600">€{item.price.toFixed(2)}</p>
        {item.description && (
          <p className="text-gray-600 mt-2">{item.description[language]}</p>
        )}
      </div>

      {/* Base Selection */}
      <div className="mb-6">
        <h3 className="text-mobile-lg font-semibold mb-3">
          {language === 'es' ? '1. Elige tu base:' : '1. Choose your base:'}
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {baseIngredients.map(base => (
            <button
              key={base.id}
              onClick={() => setSelectedBase(base.id)}
              className={`p-3 rounded-lg text-left transition-colors ${
                selectedBase === base.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {base[language === 'es' ? 'name_es' : 'name_en']}
            </button>
          ))}
        </div>
      </div>

      {/* Cereal Selection */}
      <div className="mb-6">
        <h3 className="text-mobile-lg font-semibold mb-3">
          {language === 'es' ? '2. Elige tu cereal:' : '2. Choose your cereal:'}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {cereals.map(cereal => (
            <button
              key={cereal.id}
              onClick={() => setSelectedCereal(cereal.id)}
              className={`p-3 rounded-lg text-center transition-colors ${
                selectedCereal === cereal.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {cereal[language === 'es' ? 'name_es' : 'name_en']}
            </button>
          ))}
        </div>
      </div>

      {/* Fruit Selection */}
      <div className="mb-6">
        <h3 className="text-mobile-lg font-semibold mb-3">
          {language === 'es' 
            ? `3. Elige hasta 3 frutas (${selectedFruits.length}/3):`
            : `3. Choose up to 3 fruits (${selectedFruits.length}/3):`
          }
        </h3>
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
      </div>

      {/* Additional Customizations */}
      <div className="mb-6">
        <h4 className="text-mobile-lg font-semibold mb-3">
          {language === 'es' ? 'Personalizaciones adicionales:' : 'Additional customizations:'}
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