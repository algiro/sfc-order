import { useAppStore } from '@/store/useAppStore';
import translations from '@/data/translations.json';

export type TranslationKey = string;
export type Language = 'es' | 'en';

export function useTranslation() {
  const { language } = useAppStore();

  const t = (key: TranslationKey): string => {
    try {
      // Defensive check for translations object
      if (!translations) {
        console.warn('Translations not loaded, returning key:', key);
        return key;
      }

      // Split the key by dots to navigate nested objects
      const keys = key.split('.');
      let value: any = translations;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          console.warn(`Translation key not found: ${key}`);
          return key; // Return the key itself if translation not found
        }
      }
      
      // Check if we have the language-specific translation
      if (value && typeof value === 'object' && language in value) {
        return value[language as Language];
      }
      
      console.warn(`Translation not found for key: ${key}, language: ${language}`);
      return key; // Return the key itself if translation not found
    } catch (error) {
      console.error('Translation error:', error);
      return key;
    }
  };

  return { t, language };
}

// Helper function to get translation without hook (for use outside components)
export function getTranslation(key: TranslationKey, language: Language): string {
  try {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    if (value && typeof value === 'object' && language in value) {
      return value[language];
    }
    
    console.warn(`Translation not found for key: ${key}, language: ${language}`);
    return key;
  } catch (error) {
    console.error('Translation error:', error);
    return key;
  }
}