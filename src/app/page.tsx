'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MainSection } from '@/types';
import TomarSection from '@/components/TomarSection';
import ListaSection from '@/components/ListaSection';
import MesasSection from '@/components/MesasSection';
import ArchivoSection from '@/components/ArchivoSection';
import MENU_CATEGORIES from '@/data/menuAdapter';

export default function Home() {
  const [currentSection, setCurrentSection] = useState<MainSection | null>(null);
  const { setMenuCategories, language, setLanguage } = useAppStore();

  useEffect(() => {
    // Initialize menu categories
    setMenuCategories(MENU_CATEGORIES);
  }, [setMenuCategories]);

  if (currentSection) {
    return (
      <div className="mobile-container">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setCurrentSection(null)}
            className="mobile-button-secondary px-4 py-2 h-auto"
          >
            ← {language === 'es' ? 'Volver' : 'Back'}
          </button>
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="mobile-button-secondary px-4 py-2 h-auto text-sm"
          >
            {language === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
          </button>
        </div>
        
        {currentSection === 'TOMAR' && <TomarSection />}
        {currentSection === 'LISTA' && <ListaSection />}
        {currentSection === 'MESAS' && <MesasSection />}
        {currentSection === 'ARCHIVO' && <ArchivoSection />}
      </div>
    );
  }

  return (
    <div className="mobile-container">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-mobile-3xl font-bold text-primary-600">
          SFC Order
        </h1>
        
        <button
          onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
        >
          {language === 'es' ? '🇺🇸 EN' : '🇪🇸 ES'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setCurrentSection('TOMAR')}
          className="mobile-button-primary aspect-square flex flex-col items-center justify-center"
        >
          <div className="text-4xl mb-2">📝</div>
          <div className="text-mobile-lg font-bold text-center">
            {language === 'es' ? 'Tomar Pedidos' : 'Take Orders'}
          </div>
        </button>
        
        <button
          onClick={() => setCurrentSection('LISTA')}
          className="mobile-button-warning aspect-square flex flex-col items-center justify-center"
        >
          <div className="text-4xl mb-2">�‍🍳</div>
          <div className="text-mobile-lg font-bold text-center">
            {language === 'es' ? 'Lista Cocina' : 'Kitchen List'}
          </div>
        </button>
        
        <button
          onClick={() => setCurrentSection('MESAS')}
          className="mobile-button-success aspect-square flex flex-col items-center justify-center"
        >
          <div className="text-4xl mb-2">🍽️</div>
          <div className="text-mobile-lg font-bold text-center">
            {language === 'es' ? 'Mesas' : 'Tables'}
          </div>
        </button>
        
        <button
          onClick={() => setCurrentSection('ARCHIVO')}
          className="mobile-button-secondary aspect-square flex flex-col items-center justify-center"
        >
          <div className="text-4xl mb-2">📋</div>
          <div className="text-mobile-lg font-bold text-center">
            {language === 'es' ? 'Archivo' : 'Archive'}
          </div>
        </button>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>{language === 'es' ? 'Sistema de Gestión de Pedidos' : 'Order Management System'}</p>
        <p className="mt-1">v1.0.0</p>
      </div>
    </div>
  );
}