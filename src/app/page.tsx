'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useOrderSync } from '@/hooks/useOrderSync';
import { MainSection } from '@/types';
import TomarSection from '@/components/TomarSection';
import ListaSection from '@/components/ListaSection';
import MesasSection from '@/components/MesasSection';
import ArchivoSection from '@/components/ArchivoSection';
import MENU_CATEGORIES from '@/data/menuAdapter';
import apiService from '@/services/api';

export default function Home() {
  const [currentSection, setCurrentSection] = useState<MainSection | null>(null);
  const [debugMode, setDebugMode] = useState(false);
  const { setMenuCategories, setLanguage, loadUsersFromAPI, loadTablesFromAPI, loadMenuCategoriesFromAPI, users, tables, menuCategories, orders, loadOrdersFromAPI } = useAppStore();
  const { t, language } = useTranslation();
  const { lastOrderSync, manualSync } = useOrderSync();

  useEffect(() => {
    // Load data from backend API
    console.log('Loading data from API...');
    loadUsersFromAPI();
    loadTablesFromAPI();
    loadMenuCategoriesFromAPI().then(() => {
      console.log('Menu categories loaded from API');
    });
  }, [loadUsersFromAPI, loadTablesFromAPI, loadMenuCategoriesFromAPI]);

  const clearStorageAndReload = () => {
    localStorage.clear();
    window.location.reload();
  };

  if (currentSection) {
    return (
      <div className="mobile-container">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setCurrentSection(null)}
            className="mobile-button-secondary px-4 py-2 h-auto"
          >
            ← {t('common.back')}
          </button>
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="mobile-button-secondary px-4 py-2 h-auto text-sm"
          >
            {t('navigation.languageToggle')}
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
          {t('navigation.languageToggle')}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setCurrentSection('TOMAR')}
          className="mobile-button-primary aspect-square flex flex-col items-center justify-center"
        >
          <div className="text-4xl mb-2">📝</div>
          <div className="text-mobile-lg font-bold text-center">
            {t('home.takeOrders')}
          </div>
        </button>
        
        <button
          onClick={() => setCurrentSection('LISTA')}
          className="mobile-button-warning aspect-square flex flex-col items-center justify-center"
        >
          <div className="text-4xl mb-2">�‍🍳</div>
          <div className="text-mobile-lg font-bold text-center">
            {t('home.kitchenList')}
          </div>
        </button>
        
        <button
          onClick={() => setCurrentSection('MESAS')}
          className="mobile-button-success aspect-square flex flex-col items-center justify-center"
        >
          <div className="text-4xl mb-2">🍽️</div>
          <div className="text-mobile-lg font-bold text-center">
            {t('home.tables')}
          </div>
        </button>
        
        <button
          onClick={() => setCurrentSection('ARCHIVO')}
          className="mobile-button-secondary aspect-square flex flex-col items-center justify-center"
        >
          <div className="text-4xl mb-2">📋</div>
          <div className="text-mobile-lg font-bold text-center">
            {t('home.archive')}
          </div>
        </button>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>{t('home.systemTitle')}</p>
        <p className="mt-1">v1.0.0</p>
        
        {/* Debug section */}
        <div className="mt-4">
          <button
            onClick={() => setDebugMode(!debugMode)}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Debug {debugMode ? '▼' : '▶'}
          </button>
          
          {debugMode && (
            <div className="mt-2 p-3 bg-gray-100 rounded text-left text-xs">
              <div className="mb-2">
                <strong>Users ({users.length}):</strong>
                {users.map(u => (
                  <div key={u.id} className="ml-2">• {u.name} ({u.role})</div>
                ))}
              </div>
              
              <div className="mb-2">
                <strong>Tables ({tables.length}):</strong>
                {tables.map(t => (
                  <div key={t.id} className="ml-2">• {t.id}: {t.name}</div>
                ))}
              </div>
              
              <div className="mb-2">
                <strong>Menu Categories ({menuCategories.length}):</strong>
                {menuCategories.map(c => (
                  <div key={c.id} className="ml-2">• {c.id}: {c.name.es}</div>
                ))}
              </div>
              
              <div className="mb-2">
                <strong>Orders ({orders.length}):</strong>
                {orders.slice(0, 3).map(o => (
                  <div key={o.id} className="ml-2">• Table {o.tableNumber}: {o.status} ({o.items.length} items)</div>
                ))}
                {orders.length > 3 && <div className="ml-2">... and {orders.length - 3} more</div>}
                <div className="ml-2 text-gray-400">
                  Last sync: {lastOrderSync ? new Date(lastOrderSync).toLocaleTimeString() : 'Never'}
                </div>
              </div>
              
              <div className="flex gap-2 mt-3">
                <button
                  onClick={loadUsersFromAPI}
                  className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                >
                  Reload Users
                </button>
                <button
                  onClick={loadTablesFromAPI}
                  className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                >
                  Reload Tables
                </button>
                <button
                  onClick={loadMenuCategoriesFromAPI}
                  className="px-2 py-1 bg-purple-500 text-white rounded text-xs"
                >
                  Reload Menu
                </button>
                <button
                  onClick={loadOrdersFromAPI}
                  className="px-2 py-1 bg-orange-500 text-white rounded text-xs"
                >
                  Reload Orders
                </button>
                <button
                  onClick={manualSync}
                  className="px-2 py-1 bg-yellow-500 text-white rounded text-xs"
                >
                  Sync Orders
                </button>
                <button
                  onClick={clearStorageAndReload}
                  className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                >
                  Clear Cache & Reload
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}