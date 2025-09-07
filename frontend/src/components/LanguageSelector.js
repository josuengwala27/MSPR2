import React from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import './LanguageSelector.css';

const LanguageSelector = () => {
  const { language, supportedLanguages, changeLanguage, t } = useTranslation();

  const languageNames = {
    fr: t('language.french', 'Français'),
    de: t('language.german', 'Deutsch'),
    it: t('language.italian', 'Italiano')
  };

  const handleLanguageChange = (e) => {
    changeLanguage(e.target.value);
  };

  return (
    <div className="language-selector">
      <label htmlFor="language-select" className="language-label">
        {t('language.switch', 'Langue')}:
      </label>
      <select
        id="language-select"
        value={language}
        onChange={handleLanguageChange}
        className="language-select"
      >
        {supportedLanguages.map(lang => (
          <option key={lang} value={lang}>
            {languageNames[lang]}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
