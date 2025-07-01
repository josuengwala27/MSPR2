import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-content">
          {/* Section OMS */}
          <div className="footer-section">
            <h3 className="footer-title">
              <span className="footer-icon">🦠</span>
              OMS - Division IA
            </h3>
            <p className="footer-description">
              Plateforme de prédiction d'épidémies utilisant l'Intelligence Artificielle 
              pour la prévention et la sécurité internationale.
            </p>
            <div className="footer-badges">
              <span className="badge">COVID-19</span>
              <span className="badge">MPOX</span>
              <span className="badge">IA Prédictive</span>
            </div>
          </div>

          {/* Section Navigation */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Navigation</h4>
            <ul className="footer-links">
              <li><a href="/" className="footer-link">Dashboard</a></li>
              <li><a href="/predictions/rt" className="footer-link">Prédiction Rt</a></li>
              <li><a href="/predictions/mortality" className="footer-link">Mortalité</a></li>
              <li><a href="/predictions/spread" className="footer-link">Propagation</a></li>
              <li><a href="/about" className="footer-link">À Propos</a></li>
            </ul>
          </div>

          {/* Section Modèles IA */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Modèles IA</h4>
            <ul className="footer-links">
              <li><span className="model-info">LSTM - Taux de transmission</span></li>
              <li><span className="model-info">Random Forest - Mortalité</span></li>
              <li><span className="model-info">Clustering - Propagation géographique</span></li>
              <li><span className="performance">Précision : 60-85%</span></li>
            </ul>
          </div>

          {/* Section Contact */}
          <div className="footer-section">
            <h4 className="footer-subtitle">Support & Contact</h4>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                            <a href="mailto:support@oms-pandemies.org" className="footer-link">
              support@oms-pandemies.org
                </a>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📚</span>
                <a href="/documentation" className="footer-link">
                  Documentation API
                </a>
              </div>
              <div className="contact-item">
                <span className="contact-icon">🔍</span>
                <a href="/accessibility" className="footer-link">
                  Accessibilité WCAG
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Section Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="copyright">
              <p>
                © {currentYear} Organisation Mondiale de la Santé (OMS) - Division Intelligence Artificielle. 
                Tous droits réservés.
              </p>
            </div>
            
            <div className="footer-meta">
              <div className="tech-stack">
                <span className="tech-item">React</span>
                <span className="tech-item">Python</span>
                <span className="tech-item">FastAPI</span>
                <span className="tech-item">PostgreSQL</span>
              </div>
              
              <div className="footer-version">
                <span className="version-badge">v2.0.0 - MSPR2024</span>
              </div>
            </div>
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