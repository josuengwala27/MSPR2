import React from 'react';
import { useTranslation } from '../../contexts/TranslationContext';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-content">
          {/* Section OMS */}
          <div className="footer-section">
            <h3 className="footer-title">
              <span className="footer-icon">🦠</span>
              {t('footer.title', 'OMS - Division IA')}
            </h3>
            <p className="footer-description">
              {t('footer.description', 'Plateforme de prédiction d\'épidémies utilisant l\'Intelligence Artificielle pour la prévention et la sécurité internationale.')}
            </p>
            <div className="footer-badges">
              <span className="badge">COVID-19</span>
              <span className="badge">MPOX</span>
              <span className="badge">IA Prédictive</span>
            </div>
          </div>

          {/* Section Navigation */}
          <div className="footer-section">
            <h4 className="footer-subtitle">{t('footer.navigation', 'Navigation')}</h4>
            <ul className="footer-links">
              <li><a href="/" className="footer-link">{t('footer.dashboard', 'Dashboard')}</a></li>
              <li><a href="/predictions/rt" className="footer-link">{t('footer.rt_prediction', 'Prédiction Rt')}</a></li>
              <li><a href="/predictions/mortality" className="footer-link">{t('footer.mortality', 'Mortalité')}</a></li>
              <li><a href="/predictions/spread" className="footer-link">{t('footer.spread', 'Propagation')}</a></li>
              <li><a href="/about" className="footer-link">{t('footer.about', 'À Propos')}</a></li>
            </ul>
          </div>
        </div>

        {/* Section Bottom */}
        <div className="footer-bottom">
          <div className="copyright">
            <p>
              {t('footer.copyright', `© ${currentYear} Organisation Mondiale de la Santé (OMS) - Division Intelligence Artificielle. Tous droits réservés.`).replace('{year}', currentYear)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="disclaimer">
        <p>
          <strong>Avertissement :</strong> Les prédictions fournies par cette plateforme sont basées sur des modèles d'IA 
          avec une précision de 60-85%. Elles ne constituent pas un avis médical et doivent être utilisées 
          uniquement à des fins de recherche et de prévention.
        </p>
      </div>
    </footer>
  );
};

export default Footer; 