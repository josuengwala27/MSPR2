import React from 'react';
import './About.css';

const About = () => {
  // eslint-disable-next-line no-unused-vars
  const models = [
    {
      name: 'LSTM (Long Short-Term Memory)',
      purpose: 'Prédiction du taux de transmission (Rt)',
      accuracy: '60-70%',
      description: 'Réseau de neurones récurrent spécialisé dans l\'analyse de séries temporelles pour prédire l\'évolution du taux de reproduction effectif des épidémies.',
      features: ['Analyse de 30 jours d\'historique', 'Prédiction sur 7-30 jours', 'Gestion des tendances complexes'],
      icon: '🧠'
    },
    {
      name: 'Random Forest',
      purpose: 'Prédiction du taux de mortalité',
      accuracy: '80-85%',
      description: 'Ensemble d\'arbres de décision pour analyser les facteurs multiples influençant la mortalité pandémique.',
      features: ['Données démographiques', 'Historique de mortalité', 'Facteurs de risque'],
      icon: '🌳'
    },
    {
      name: 'Clustering + Time Series',
      purpose: 'Analyse de propagation géographique',
      accuracy: '70-75%',
      description: 'Combinaison de clustering et d\'analyse temporelle pour identifier les patterns de propagation entre pays.',
      features: ['Groupement de pays similaires', 'Corrélations temporelles', 'Prédiction ordre de propagation'],
      icon: '🌍'
    }
  ];

  const dataSources = [
    {
      name: 'COVID-19',
      period: '2020-2024',
      countries: '195+ pays',
      indicators: 'Cases, Deaths, Vaccinations',
      icon: '🦠'
    },
    {
      name: 'MPOX (Monkeypox)',
      period: '2022-2024',
      countries: '100+ pays',
      indicators: 'Cases, Deaths, Transmission',
      icon: '🐒'
    }
  ];

  // eslint-disable-next-line no-unused-vars
  const limitations = [
    {
      type: 'Précision Variable',
      description: 'Les prédictions ont une précision de 60-85% selon le modèle et les données disponibles.',
      impact: 'Utiliser comme aide à la décision, pas comme vérité absolue',
      icon: '⚠️'
    },
    {
      type: 'Données Manquantes',
      description: 'Absence de données sur les contacts, variants, et politiques sanitaires locales.',
      impact: 'Peut affecter la précision des prédictions dans certains contextes',
      icon: '📊'
    },
    {
      type: 'Horizon Temporel',
      description: 'Fiabilité décroissante au-delà de 30 jours de prédiction.',
      impact: 'Recommandation de mise à jour fréquente des prédictions',
      icon: '⏰'
    },
    {
      type: 'Contexte Local',
      description: 'Les modèles ne prennent pas en compte les spécificités culturelles et socio-économiques.',
      impact: 'Nécessité d\'adaptation locale des recommandations',
      icon: '🏘️'
    }
  ];

  return (
    <div className="about">
      {/* Header */}
      <div className="about-header">
        <div className="header-content">
          <h1 className="about-title">
            <span className="title-icon">🦠</span>
            À Propos de la Plateforme OMS
          </h1>
          <p className="about-subtitle">
            Plateforme d'analyse des épidémies COVID-19 & MPOX 
            pour la prévention et la sécurité internationale
          </p>
        </div>
      </div>

      {/* Mission OMS */}
      <section className="mission-section">
        <div className="section-header">
          <h2 className="section-title">
            Mission & Contexte OMS
          </h2>
        </div>
        <div className="mission-content">
          <div className="mission-card">
            <h3 className="mission-title">Objectif Principal</h3>
            <p className="mission-text">
              Suite au succès de la première phase de collecte et visualisation des données historiques 
              sur les pandémies, l'OMS souhaite étendre les fonctionnalités de la plateforme en intégrant 
              des capacités d'analyse avancées pour les épidémies COVID-19 et MPOX.
            </p>
          </div>
          <div className="mission-card">
            <h3 className="mission-title">Innovation pour la Santé Publique</h3>
            <p className="mission-text">
              Cette innovation représente un enjeu majeur permettant aux chercheurs, décideurs et 
              au grand public d'apporter leur contribution dans un contexte de prévention et de 
              sécurité internationale.
            </p>
          </div>
          <div className="mission-card">
            <h3 className="mission-title">Accessibilité Universelle</h3>
            <p className="mission-text">
              Conçue pour des utilisateurs sans connaissances informatiques, l'interface privilégie 
              l'accessibilité moderne selon les standards WCAG 2.1, incluant la navigation au clavier 
              et la compatibilité avec les lecteurs d'écran.
            </p>
          </div>
        </div>
      </section>



      {/* Sources de Données */}
      <section className="data-sources-section">
        <div className="section-header">
          <h2 className="section-title">
            Sources de Données
          </h2>
          <p className="section-description">
            Données historiques complètes pour l'analyse épidémiologique
          </p>
        </div>
        <div className="data-sources-grid">
          {dataSources.map((source, index) => (
            <div key={index} className="data-source-card">
              <div className="source-header">
                <span className="source-icon">{source.icon}</span>
                <h3 className="source-name">{source.name}</h3>
              </div>
              <div className="source-details">
                <div className="source-detail">
                  <span className="detail-label">Période :</span>
                  <span className="detail-value">{source.period}</span>
                </div>
                <div className="source-detail">
                  <span className="detail-label">Pays :</span>
                  <span className="detail-value">{source.countries}</span>
                </div>
                <div className="source-detail">
                  <span className="detail-label">Indicateurs :</span>
                  <span className="detail-value">{source.indicators}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>







      {/* Disclaimer */}
      <div className="disclaimer-section">
        <div className="disclaimer-content">
          <h3 className="disclaimer-title">
            Avertissement Important
          </h3>
          <p className="disclaimer-text">
            Les prédictions fournies par cette plateforme sont basées sur des modèles d'IA 
            avec une précision de 60-85%. Elles ne constituent pas un avis médical et doivent 
            être utilisées uniquement à des fins de recherche et de prévention. Les décisions 
            de santé publique doivent toujours être prises en consultation avec des experts 
            médicaux et épidémiologiques qualifiés.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About; 