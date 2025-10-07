'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MenuItem, MenuCategory, Fruit } from '@/types';
import apiService from '@/services/api';

interface ItemCustomizationProps {
  item: MenuItem;
  category: MenuCategory;
  onBack: () => void;
}

export default function ItemCustomization({ item, category, onBack }: ItemCustomizationProps) {
  const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([]);
  const [customText, setCustomText] = useState('');
  const { language, addItemToOrder } = useAppStore();

  console.log('ItemCustomization - Item:', item);
  console.log('ItemCustomization - customization_type:', item.customization_type);

  // Handle special customization types
  if (item.customization_type === 'bowl_builder') {
    return <BowlBuilderInline item={item} onBack={onBack} language={language} addItemToOrder={addItemToOrder} />;
  }

  if (item.customization_type === 'smoothie_builder' || item.id.includes('personalizado')) {
    return <SmoothieBuilderInline item={item} onBack={onBack} language={language} addItemToOrder={addItemToOrder} isCustom={true} />;
  }

  // Handle predefined smoothies
  if (item.predefined_recipe && item.predefined_recipe.length > 0) {
    return <SmoothieBuilderInline item={item} onBack={onBack} language={language} addItemToOrder={addItemToOrder} isCustom={false} />;
  }

  console.log('Using default ItemCustomization');

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

// Inline Bowl Builder Component
function BowlBuilderInline({ item, onBack, language, addItemToOrder }: {
  item: MenuItem;
  onBack: () => void;
  language: string;
  addItemToOrder: (item: MenuItem, customizations: string[]) => void;
}) {
  const [selectedBase, setSelectedBase] = useState<string>('');
  const [selectedCereal, setSelectedCereal] = useState<string>('');
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);
  const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([]);
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [loading, setLoading] = useState(true);

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
        <button onClick={onBack} className="mobile-button-secondary px-4 py-2 h-auto">
          ← {language === 'es' ? 'Volver' : 'Back'}
        </button>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-mobile-2xl font-bold mb-2">{item.name[language as 'es' | 'en']}</h2>
        <p className="text-mobile-xl font-bold text-primary-600">€{item.price.toFixed(2)}</p>
        {item.description && (
          <p className="text-gray-600 mt-2">{item.description[language as 'es' | 'en']}</p>
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
                  ? 'bg-primary-500 text-white'
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

// Inline Smoothie Builder Component
function SmoothieBuilderInline({ item, onBack, language, addItemToOrder, isCustom }: {
  item: MenuItem;
  onBack: () => void;
  language: string;
  addItemToOrder: (item: MenuItem, customizations: string[]) => void;
  isCustom: boolean;
}) {
  const [selectedFruits, setSelectedFruits] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>('small');
  const [selectedCustomizations, setSelectedCustomizations] = useState<string[]>([]);
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (item.predefined_recipe && item.predefined_recipe.length > 0) {
      setSelectedFruits(item.predefined_recipe);
    }
  }, [item.predefined_recipe]);

  const sizes = [
    { id: 'small', name_es: 'Pequeño (0.38L)', name_en: 'Small (0.38L)', price: 4.90 },
    { id: 'large', name_es: 'Grande (0.50L)', name_en: 'Large (0.50L)', price: 5.90 }
  ];

  const defaultCustomizations = [
    'sin hielo', 'con hielo extra', 'más espeso', 'más líquido', 'sin azúcar', 'con miel'
  ];

  const toggleFruit = (fruitId: string) => {
    if (!isCustom) return;
    
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

    const itemWithPrice = {
      ...item,
      price: selectedSizeInfo?.price || item.price
    };

    addItemToOrder(itemWithPrice, smoothieCustomizations);
    onBack();
  };

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
        <button onClick={onBack} className="mobile-button-secondary px-4 py-2 h-auto">
          ← {language === 'es' ? 'Volver' : 'Back'}
        </button>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-mobile-2xl font-bold mb-2">{item.name[language as 'es' | 'en']}</h2>
        <p className="text-mobile-xl font-bold text-primary-600">
          €{sizes.find(s => s.id === selectedSize)?.price.toFixed(2)}
        </p>
        {item.description && (
          <p className="text-gray-600 mt-2">{item.description[language as 'es' | 'en']}</p>
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
          {isCustom ? (
            language === 'es' 
              ? `2. Elige hasta 3 frutas (${selectedFruits.length}/3):`
              : `2. Choose up to 3 fruits (${selectedFruits.length}/3):`
          ) : (
            language === 'es' ? '2. Ingredientes:' : '2. Ingredients:'
          )}
        </h3>
        
        {!isCustom ? (
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
                  ? 'bg-primary-500 text-white'
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