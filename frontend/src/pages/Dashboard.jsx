import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [globalStats] = useState({
    totalCountries: 195,
    covidCases: '668M',
    mpoxCases: '98.2K',
    lastUpdate: new Date().toLocaleDateString('fr-FR'),
    averageRt: 1.2,
    mortalityRate: 2.3,
    riskCountries: 12
  });

  const [recentPredictions] = useState([
    {
      id: 1,
      type: 'Rt Prediction',
      country: 'France',
      value: 0.85,
      trend: 'decline',
      confidence: 68,
      date: '2024-01-15'
    },
    {
      id: 2,
      type: 'Mortality Rate',
      country: 'Italy',
      value: 3.2,
      trend: 'stable',
      confidence: 82,
      date: '2024-01-15'
    },
    {
      id: 3,
      type: 'Spread Prediction',
      country: 'Spain',
      value: 'High Risk',
      trend: 'increase',
      confidence: 74,
      date: '2024-01-15'
    }
  ]);

  // Données pour les graphiques
  const [worldData] = useState([
    { country: 'USA', cases: 103500000, deaths: 1120000, rt: 0.9 },
    { country: 'China', cases: 99230000, deaths: 120000, rt: 1.1 },
    { country: 'India', cases: 44690000, deaths: 530000, rt: 0.8 },
    { country: 'France', cases: 38890000, deaths: 174000, rt: 0.85 },
    { country: 'Germany', cases: 38000000, deaths: 161000, rt: 0.92 },
    { country: 'Brazil', cases: 37100000, deaths: 688000, rt: 1.05 },
    { country: 'Japan', cases: 33800000, deaths: 74000, rt: 0.88 },
    { country: 'South Korea', cases: 30640000, deaths: 33000, rt: 0.76 }
  ]);

  const [timeSeriesData] = useState([
    { date: '2024-01-01', cases: 45000, deaths: 890, rt: 1.2 },
    { date: '2024-01-02', cases: 42000, deaths: 870, rt: 1.15 },
    { date: '2024-01-03', cases: 39000, deaths: 850, rt: 1.1 },
    { date: '2024-01-04', cases: 36000, deaths: 820, rt: 1.05 },
    { date: '2024-01-05', cases: 34000, deaths: 800, rt: 1.0 },
    { date: '2024-01-06', cases: 32000, deaths: 780, rt: 0.95 },
    { date: '2024-01-07', cases: 30000, deaths: 760, rt: 0.9 }
  ]);

  const [riskAnalysis] = useState({
    highRisk: ['Brazil', 'India', 'Russia', 'Mexico'],
    mediumRisk: ['USA', 'China', 'Turkey', 'Iran'],
    lowRisk: ['France', 'Germany', 'Japan', 'South Korea'],
    veryLowRisk: ['New Zealand', 'Australia', 'Singapore', 'Taiwan']
  });

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increase': return '📈';
      case 'decline': return '📉';
      case 'stable': return '➡️';
      default: return '📊';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'increase': return '#e74c3c';
      case 'decline': return '#27ae60';
      case 'stable': return '#f39c12';
      default: return '#3498db';
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getRtColor = (rt) => {
    if (rt < 0.8) return '#27ae60';
    if (rt < 1.0) return '#2ecc71';
    if (rt < 1.2) return '#f39c12';
    return '#e74c3c';
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#3498db';
      case 'verylow': return '#27ae60';
      default: return '#6c757d';
    }
  };

  return (
    <div className="dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-icon">🦠</span>
            Tableau de Bord - COVID-19 & MPOX
          </h1>
          <p className="dashboard-subtitle">
            Surveillance et analyse en temps réel des données COVID-19 et MPOX
          </p>
          <div className="last-update">
            <span className="update-icon">🕐</span>
            Dernière mise à jour : {globalStats.lastUpdate}
          </div>
        </div>
      </div>

      {/* Global Statistics */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">🌍</div>
          <div className="stat-content">
            <h3 className="stat-value">{globalStats.totalCountries}</h3>
            <p className="stat-label">Pays Surveillés</p>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon">🦠</div>
          <div className="stat-content">
            <h3 className="stat-value">{globalStats.covidCases}</h3>
            <p className="stat-label">Cas COVID-19</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3 className="stat-value">{globalStats.averageRt}</h3>
            <p className="stat-label">Rt Moyen Mondial</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">⚕️</div>
          <div className="stat-content">
            <h3 className="stat-value">{globalStats.mortalityRate}%</h3>
            <p className="stat-label">Taux de Mortalité</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">🧬</div>
          <div className="stat-content">
            <h3 className="stat-value">{globalStats.mpoxCases}</h3>
            <p className="stat-label">Cas MPOX</p>
          </div>
        </div>

        <div className="stat-card alert">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3 className="stat-value">{globalStats.riskCountries}</h3>
            <p className="stat-label">Pays à Risque</p>
          </div>
        </div>
      </div>

      {/* Charts and Analytics Section */}
      <div className="analytics-section">
        <h2 className="section-title">
          <span className="section-icon">📈</span>
          Analyses et Tendances
        </h2>

        <div className="charts-grid">
          {/* World Map Visualization */}
          <div className="chart-card world-map">
            <h3 className="chart-title">
              <span className="chart-icon">🗺️</span>
              Carte Mondiale des Risques
            </h3>
            <div className="world-map-container">
              <div className="map-placeholder">
                <div className="map-regions">
                  <div className="region high-risk">
                    <span className="region-label">Amérique du Sud</span>
                    <span className="risk-level">Risque Élevé</span>
                  </div>
                  <div className="region medium-risk">
                    <span className="region-label">Amérique du Nord</span>
                    <span className="risk-level">Risque Modéré</span>
                  </div>
                  <div className="region low-risk">
                    <span className="region-label">Europe</span>
                    <span className="risk-level">Risque Faible</span>
                  </div>
                  <div className="region very-low-risk">
                    <span className="region-label">Océanie</span>
                    <span className="risk-level">Risque Très Faible</span>
                  </div>
                </div>
                <div className="map-legend">
                  <div className="legend-item">
                    <span className="legend-color high"></span>
                    <span>Risque Élevé</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color medium"></span>
                    <span>Risque Modéré</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color low"></span>
                    <span>Risque Faible</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color very-low"></span>
                    <span>Très Faible</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Time Series Chart */}
          <div className="chart-card time-series">
            <h3 className="chart-title">
              <span className="chart-icon">📊</span>
              Évolution Temporelle (7 derniers jours)
            </h3>
            <div className="time-series-chart">
              <div className="chart-controls">
                <button className="chart-toggle active">Cases</button>
                <button className="chart-toggle">Deaths</button>
                <button className="chart-toggle">Rt</button>
              </div>
              <div className="line-chart">
                {timeSeriesData.map((point, index) => (
                  <div key={index} className="chart-point">
                    <div 
                      className="point-bar" 
                      style={{ 
                        height: `${(point.cases / 50000) * 100}%`,
                        backgroundColor: getRtColor(point.rt)
                      }}
                    ></div>
                    <div className="point-label">{point.date.split('-')[2]}</div>
                    <div className="point-value">{formatNumber(point.cases)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Countries Chart */}
          <div className="chart-card countries-ranking">
            <h3 className="chart-title">
              <span className="chart-icon">🏆</span>
              Top 8 Pays - Données Actuelles
            </h3>
            <div className="countries-chart">
              {worldData.map((country, index) => (
                <div key={index} className="country-row">
                  <div className="country-info">
                    <span className="country-rank">#{index + 1}</span>
                    <span className="country-name">{country.country}</span>
                  </div>
                  <div className="country-stats">
                    <div className="stat">
                      <span className="stat-label">Cases</span>
                      <span className="stat-value">{formatNumber(country.cases)}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Deaths</span>
                      <span className="stat-value">{formatNumber(country.deaths)}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Rt</span>
                      <span 
                        className="stat-value rt-value" 
                        style={{ color: getRtColor(country.rt) }}
                      >
                        {country.rt}
                      </span>
                    </div>
                  </div>
                  <div 
                    className="country-bar"
                    style={{ 
                      width: `${(country.cases / Math.max(...worldData.map(d => d.cases))) * 100}%`,
                      backgroundColor: getRtColor(country.rt)
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Analysis Pie Chart */}
          <div className="chart-card risk-analysis">
            <h3 className="chart-title">
              <span className="chart-icon">⚠️</span>
              Analyse des Risques par Région
            </h3>
            <div className="risk-pie-chart">
              <div className="pie-container">
                <div className="pie-chart">
                  <div className="pie-slice high" style={{ '--percentage': '25%' }}>
                    <span className="slice-label">25%</span>
                  </div>
                  <div className="pie-slice medium" style={{ '--percentage': '30%' }}>
                    <span className="slice-label">30%</span>
                  </div>
                  <div className="pie-slice low" style={{ '--percentage': '30%' }}>
                    <span className="slice-label">30%</span>
                  </div>
                  <div className="pie-slice very-low" style={{ '--percentage': '15%' }}>
                    <span className="slice-label">15%</span>
                  </div>
                </div>
              </div>
              <div className="risk-legend">
                {Object.entries(riskAnalysis).map(([level, countries]) => (
                  <div key={level} className="risk-item">
                    <div className="risk-header">
                      <span 
                        className="risk-indicator"
                        style={{ backgroundColor: getRiskColor(level.replace('Risk', '').toLowerCase()) }}
                      ></span>
                      <span className="risk-title">
                        {level.replace('Risk', ' Risk').replace('very', 'Très').replace('high', 'Élevé').replace('medium', 'Modéré').replace('low', 'Faible')}
                      </span>
                    </div>
                    <div className="risk-countries">
                      {countries.slice(0, 2).map((country, idx) => (
                        <span key={idx} className="country-tag">{country}</span>
                      ))}
                      {countries.length > 2 && (
                        <span className="more-countries">+{countries.length - 2}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Model Performance Chart */}
          <div className="chart-card model-performance">
            <h3 className="chart-title">
              <span className="chart-icon">🤖</span>
              Performance des Modèles IA
            </h3>
            <div className="performance-chart">
              <div className="model-bars">
                <div className="model-bar">
                  <div className="model-name">LSTM (Rt)</div>
                  <div className="performance-bar">
                    <div className="bar-fill" style={{ width: '68%', backgroundColor: '#3498db' }}>
                      <span className="bar-label">68%</span>
                    </div>
                  </div>
                </div>
                <div className="model-bar">
                  <div className="model-name">Random Forest (Mortalité)</div>
                  <div className="performance-bar">
                    <div className="bar-fill" style={{ width: '82%', backgroundColor: '#27ae60' }}>
                      <span className="bar-label">82%</span>
                    </div>
                  </div>
                </div>
                <div className="model-bar">
                  <div className="model-name">Clustering (Propagation)</div>
                  <div className="performance-bar">
                    <div className="bar-fill" style={{ width: '74%', backgroundColor: '#f39c12' }}>
                      <span className="bar-label">74%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="performance-summary">
                <div className="summary-item">
                  <span className="summary-label">Précision Moyenne</span>
                  <span className="summary-value">74.7%</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Prédictions Effectuées</span>
                  <span className="summary-value">2,847</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Temps de Calcul Moyen</span>
                  <span className="summary-value">2.3s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Monitoring */}
          <div className="chart-card realtime-monitoring">
            <h3 className="chart-title">
              <span className="chart-icon">⚡</span>
              Surveillance Temps Réel
            </h3>
            <div className="monitoring-dashboard">
              <div className="monitoring-metrics">
                <div className="metric-item active">
                  <div className="metric-icon">🔴</div>
                  <div className="metric-content">
                    <span className="metric-label">Alertes Actives</span>
                    <span className="metric-value">3</span>
                  </div>
                  <div className="metric-pulse"></div>
                </div>
                <div className="metric-item">
                  <div className="metric-icon">⏰</div>
                  <div className="metric-content">
                    <span className="metric-label">Dernière Analyse</span>
                    <span className="metric-value">2 min</span>
                  </div>
                </div>
                <div className="metric-item">
                  <div className="metric-icon">📡</div>
                  <div className="metric-content">
                    <span className="metric-label">Sources Actives</span>
                    <span className="metric-value">195</span>
                  </div>
                </div>
              </div>
              <div className="monitoring-alerts">
                <div className="alert-item high">
                  <span className="alert-icon">🔴</span>
                  <span className="alert-text">Rt élevé détecté en Brésil</span>
                  <span className="alert-time">Il y a 5 min</span>
                </div>
                <div className="alert-item medium">
                  <span className="alert-icon">🟡</span>
                  <span className="alert-text">Augmentation des cas en Inde</span>
                  <span className="alert-time">Il y a 12 min</span>
                </div>
                <div className="alert-item low">
                  <span className="alert-icon">🟢</span>
                  <span className="alert-text">Amélioration en France</span>
                  <span className="alert-time">Il y a 18 min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Modules */}
      <div className="modules-grid">
        <div className="module-card">
          <div className="module-header">
            <h3 className="module-title">
              <span className="module-icon">📈</span>
              Prédiction Taux de Transmission (Rt)
            </h3>
            <p className="module-description">
              Modèle LSTM pour prédire l'évolution du taux de reproduction effectif
            </p>
          </div>
          <div className="module-stats">
            <div className="module-stat">
              <span className="stat-number">60-70%</span>
              <span className="stat-text">Précision</span>
            </div>
            <div className="module-stat">
              <span className="stat-number">30 jours</span>
              <span className="stat-text">Horizon</span>
            </div>
          </div>
          <a href="/predictions/rt" className="module-button">
            Accéder aux Prédictions Rt
          </a>
        </div>

        <div className="module-card">
          <div className="module-header">
            <h3 className="module-title">
              <span className="module-icon">⚕️</span>
              Prédiction Taux de Mortalité
            </h3>
            <p className="module-description">
              Random Forest pour analyser les facteurs de mortalité
            </p>
          </div>
          <div className="module-stats">
            <div className="module-stat">
              <span className="stat-number">80-85%</span>
              <span className="stat-text">Précision</span>
            </div>
            <div className="module-stat">
              <span className="stat-number">30 jours</span>
              <span className="stat-text">Horizon</span>
            </div>
          </div>
          <a href="/predictions/mortality" className="module-button">
            Analyser la Mortalité
          </a>
        </div>

        <div className="module-card">
          <div className="module-header">
            <h3 className="module-title">
              <span className="module-icon">🌍</span>
              Propagation Géographique
            </h3>
            <p className="module-description">
              Clustering pour identifier les patterns de propagation
            </p>
          </div>
          <div className="module-stats">
            <div className="module-stat">
              <span className="stat-number">70-75%</span>
              <span className="stat-text">Précision</span>
            </div>
            <div className="module-stat">
              <span className="stat-number">Temps réel</span>
              <span className="stat-text">Analyse</span>
            </div>
          </div>
          <a href="/predictions/spread" className="module-button">
            Voir la Propagation
          </a>
        </div>
      </div>

      {/* Recent Predictions */}
      <div className="recent-predictions">
        <h2 className="section-title">
          <span className="section-icon">🔮</span>
          Prédictions Récentes
        </h2>
        <div className="predictions-grid">
          {recentPredictions.map((prediction) => (
            <div key={prediction.id} className="prediction-card">
              <div className="prediction-header">
                <h4 className="prediction-type">{prediction.type}</h4>
                <span className="prediction-country">{prediction.country}</span>
              </div>
              <div className="prediction-content">
                <div className="prediction-value">
                  {typeof prediction.value === 'number' 
                    ? prediction.value.toFixed(2) 
                    : prediction.value}
                </div>
                <div className="prediction-trend">
                  <span 
                    className="trend-icon"
                    style={{ color: getTrendColor(prediction.trend) }}
                  >
                    {getTrendIcon(prediction.trend)}
                  </span>
                  <span className="trend-text">{prediction.trend}</span>
                </div>
              </div>
              <div className="prediction-footer">
                <div className="confidence-bar">
                  <div className="confidence-label">Confiance : {prediction.confidence}%</div>
                  <div className="confidence-progress">
                    <div 
                      className="confidence-fill"
                      style={{ width: `${prediction.confidence}%` }}
                    ></div>
                  </div>
                </div>
                <div className="prediction-date">{prediction.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="section-title">
          <span className="section-icon">⚡</span>
          Actions Rapides
        </h2>
        <div className="actions-grid">
          <button className="action-button primary">
            <span className="action-icon">📊</span>
            <span className="action-text">Nouvelle Prédiction</span>
          </button>
          <button className="action-button secondary">
            <span className="action-icon">📈</span>
            <span className="action-text">Analyser Tendances</span>
          </button>
          <button className="action-button info">
            <span className="action-icon">🌍</span>
            <span className="action-text">Carte Mondiale</span>
          </button>
          <button className="action-button success">
            <span className="action-icon">📋</span>
            <span className="action-text">Rapport Complet</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 