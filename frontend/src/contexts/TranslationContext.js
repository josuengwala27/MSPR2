import React, { createContext, useContext, useState, useEffect } from 'react';

const TranslationContext = createContext();

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};

export const TranslationProvider = ({ children }) => {
  const [language, setLanguage] = useState('fr');
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(false);

  const supportedLanguages = ['fr', 'de', 'it'];
  const defaultLanguage = 'fr';

  // Fonction pour charger les traductions
  const loadTranslations = async (lang) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/translate/language/${lang}`);
      if (response.ok) {
        const data = await response.json();
        setTranslations(data.translations || {});
        console.log(`✅ Traductions chargées pour ${lang}:`, data.translations);
      } else {
        console.warn(`Failed to load translations for ${lang}`);
        // Fallback vers la langue par défaut
        if (lang !== defaultLanguage) {
          await loadTranslations(defaultLanguage);
        }
      }
    } catch (error) {
      console.error('Error loading translations:', error);
      // Fallback vers la langue par défaut
      if (lang !== defaultLanguage) {
        await loadTranslations(defaultLanguage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour changer de langue
  const changeLanguage = async (newLang) => {
    if (supportedLanguages.includes(newLang) && newLang !== language) {
      setLanguage(newLang);
      await loadTranslations(newLang);
      // Sauvegarder la langue dans localStorage
      localStorage.setItem('preferred-language', newLang);
    }
  };

  // Fonction pour obtenir une traduction
  const t = (key, fallback = key) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback;
      }
    }
    
    return typeof value === 'string' ? value : fallback;
  };

  // Charger la langue sauvegardée au démarrage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    const initialLanguage = supportedLanguages.includes(savedLanguage) ? savedLanguage : defaultLanguage;
    setLanguage(initialLanguage);
    loadTranslations(initialLanguage);
  }, []);

  const value = {
    language,
    supportedLanguages,
    changeLanguage,
    t,
    loading
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};
