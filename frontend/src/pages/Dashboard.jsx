import React, { useState } from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import ChartComponent from '../components/Charts/ChartComponent';
import './Dashboard.css';

const COVID_STATS = {
  totalCountries: 195,
  cases: 668_000_000,
  deaths: 6_800_000,
  averageRt: 1.12,
  mortalityRate: 1.02,
  riskCountries: 18,
  lastUpdate: new Date().toLocaleDateString('fr-FR'),
  topCountries: [
    { country: 'USA', cases: 103_500_000, deaths: 1_120_000, rt: 0.9 },
    { country: 'China', cases: 99_200_000, deaths: 120_000, rt: 1.1 },
    { country: 'India', cases: 44_700_000, deaths: 530_000, rt: 0.8 },
    { country: 'France', cases: 38_900_000, deaths: 174_000, rt: 0.85 },
    { country: 'Germany', cases: 38_000_000, deaths: 161_000, rt: 0.92 },
    { country: 'Brazil', cases: 37_100_000, deaths: 688_000, rt: 1.05 },
    { country: 'Japan', cases: 33_800_000, deaths: 74_000, rt: 0.88 },
    { country: 'South Korea', cases: 30_640_000, deaths: 33_000, rt: 0.76 }
  ],
  timeSeries: [
    { date: '2024-01-01', cases: 45000, deaths: 890, rt: 1.2 },
    { date: '2024-01-02', cases: 42000, deaths: 870, rt: 1.15 },
    { date: '2024-01-03', cases: 39000, deaths: 850, rt: 1.1 },
    { date: '2024-01-04', cases: 36000, deaths: 820, rt: 1.05 },
    { date: '2024-01-05', cases: 34000, deaths: 800, rt: 1.0 },
    { date: '2024-01-06', cases: 32000, deaths: 780, rt: 0.95 },
    { date: '2024-01-07', cases: 30000, deaths: 760, rt: 0.9 }
  ],
  riskMap: [
    { region: 'South America', risk: 'High' },
    { region: 'North America', risk: 'Medium' },
    { region: 'Europe', risk: 'Low' },
    { region: 'Oceania', risk: 'Very Low' }
  ],
  riskAnalysis: {
    highRisk: ['Brazil', 'India', 'Russia', 'Mexico'],
    mediumRisk: ['USA', 'China', 'Turkey', 'Iran'],
    lowRisk: ['France', 'Germany', 'Japan', 'South Korea'],
    veryLowRisk: ['New Zealand', 'Australia', 'Singapore', 'Taiwan']
  },
  recentPredictions: [
    { id: 1, type: 'Rt Prediction', country: 'France', value: 0.85, trend: 'decline', confidence: 68, date: '2024-01-15' },
    { id: 2, type: 'Mortality Rate', country: 'Italy', value: 1.1, trend: 'stable', confidence: 82, date: '2024-01-15' },
    { id: 3, type: 'Spread Prediction', country: 'Spain', value: 'High Risk', trend: 'increase', confidence: 74, date: '2024-01-15' }
  ],
  alerts: [
    { level: 'high', text: 'Rt élevé détecté au Brésil', time: 'Il y a 5 min' },
    { level: 'medium', text: 'Augmentation des cas en Inde', time: 'Il y a 12 min' },
    { level: 'low', text: 'Amélioration en France', time: 'Il y a 18 min' }
  ]
};

const MPOX_STATS = {
  totalCountries: 110,
  cases: 98_200,
  deaths: 1_200,
  averageRt: 1.05,
  mortalityRate: 1.22,
  riskCountries: 12,
  lastUpdate: new Date().toLocaleDateString('fr-FR'),
  topCountries: [
    { country: 'RDC', cases: 32_000, deaths: 800, rt: 1.2 },
    { country: 'Nigeria', cases: 18_000, deaths: 200, rt: 1.1 },
    { country: 'USA', cases: 12_000, deaths: 50, rt: 0.95 },
    { country: 'UK', cases: 7_500, deaths: 20, rt: 0.9 },
    { country: 'Spain', cases: 6_800, deaths: 15, rt: 0.88 },
    { country: 'Brazil', cases: 5_900, deaths: 30, rt: 1.05 },
    { country: 'France', cases: 5_200, deaths: 10, rt: 0.92 },
    { country: 'Germany', cases: 4_800, deaths: 8, rt: 0.91 }
  ],
  timeSeries: [
    { date: '2024-01-01', cases: 120, deaths: 2, rt: 1.1 },
    { date: '2024-01-02', cases: 110, deaths: 1, rt: 1.08 },
    { date: '2024-01-03', cases: 105, deaths: 1, rt: 1.06 },
    { date: '2024-01-04', cases: 98, deaths: 1, rt: 1.04 },
    { date: '2024-01-05', cases: 90, deaths: 0, rt: 1.01 },
    { date: '2024-01-06', cases: 85, deaths: 0, rt: 0.98 },
    { date: '2024-01-07', cases: 80, deaths: 0, rt: 0.95 }
  ],
  riskMap: [
    { region: 'Central Africa', risk: 'High' },
    { region: 'West Africa', risk: 'Medium' },
    { region: 'Europe', risk: 'Low' },
    { region: 'North America', risk: 'Very Low' }
  ],
  riskAnalysis: {
    highRisk: ['RDC', 'Nigeria', 'Cameroun', 'Ghana'],
    mediumRisk: ['USA', 'UK', 'Brésil', 'Espagne'],
    lowRisk: ['France', 'Allemagne', 'Italie', 'Portugal'],
    veryLowRisk: ['Canada', 'Australie', 'Japon', 'Corée du Sud']
  },
  recentPredictions: [
    { id: 1, type: 'Rt Prediction', country: 'RDC', value: 1.2, trend: 'increase', confidence: 62, date: '2024-01-15' },
    { id: 2, type: 'Mortality Rate', country: 'Nigeria', value: 2.1, trend: 'stable', confidence: 78, date: '2024-01-15' },
    { id: 3, type: 'Spread Prediction', country: 'USA', value: 'Medium Risk', trend: 'decline', confidence: 70, date: '2024-01-15' }
  ],
  alerts: [
    { level: 'high', text: 'Propagation rapide détectée en RDC', time: 'Il y a 3 min' },
    { level: 'medium', text: 'Nouveaux cas au Nigeria', time: 'Il y a 10 min' },
    { level: 'low', text: 'Situation stable en France', time: 'Il y a 20 min' }
  ]
};

const DISEASES = [
  { key: 'covid', label: 'COVID-19', color: '#3498db', icon: '🦠' },
  { key: 'mpox', label: 'MPOX', color: '#27ae60', icon: '🧬' }
];

const countryFlags = {
  USA: '🇺🇸', China: '🇨🇳', India: '🇮🇳', France: '🇫🇷', Germany: '🇩🇪', Brazil: '🇧🇷', Japan: '🇯🇵', 'South Korea': '🇰🇷',
  RDC: '🇨🇩', Nigeria: '🇳🇬', UK: '🇬🇧', Spain: '🇪🇸', 'South Africa': '🇿🇦', Portugal: '🇵🇹', Australia: '🇦🇺', Canada: '🇨🇦',
  Cameroun: '🇨🇲', Ghana: '🇬🇭', Italie: '🇮🇹', Russie: '🇷🇺', Mexique: '🇲🇽', Turquie: '🇹🇷', Iran: '🇮🇷', Singapore: '🇸🇬', Taiwan: '🇹🇼', Australie: '🇦🇺', Japon: '🇯🇵', Corée: '🇰🇷'
};

const diseasePeriods = {
  covid: { label: 'Période : 2020–2024 (pandémie COVID-19)' },
  mpox: { label: 'Période : 2022–2024 (épidémie MPOX)' }
};

const Dashboard = () => {
  const { t } = useTranslation();
  const [selectedDisease, setSelectedDisease] = useState('covid');
  const stats = selectedDisease === 'covid' ? COVID_STATS : MPOX_STATS;
  const diseaseMeta = DISEASES.find(d => d.key === selectedDisease);
  const [timeSeriesType, setTimeSeriesType] = useState('cases');

  // Fonctions utilitaires (inchangées)
  const formatNumber = (num) => {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
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

  // Générer les données annuelles pour le graphique
  const getYearlyData = (disease, type) => {
    if (disease === 'covid') {
      // 5 années distinctes pour COVID-19
      return {
        labels: ['2020', '2021', '2022', '2023', '2024'],
        datasets: [{
          label: type === 'cases' ? 'Cas COVID-19' : 'Décès COVID-19',
          data: type === 'cases'
            ? [85000000, 220000000, 250000000, 70000000, 43000000]
            : [1800000, 3400000, 1200000, 350000, 50000],
          backgroundColor: '#3498db99',
          borderColor: '#3498db',
          borderWidth: 2,
          borderRadius: 8,
        }]
      };
    } else {
      // MPOX : 2 années
      return {
        labels: ['2022', '2023/2024'],
        datasets: [{
          label: type === 'cases' ? 'Cas MPOX' : 'Décès MPOX',
          data: type === 'cases' ? [65000, 33200] : [800, 400],
          backgroundColor: '#27ae6099',
          borderColor: '#27ae60',
          borderWidth: 2,
          borderRadius: 8,
        }]
      };
    }
  };

  // Préparation des données pour ChartComponent
  const chartLabels = stats.timeSeries.map(d => d.date.slice(5));

  const riskClassMap = {
    'High': 'high-risk',
    'Medium': 'medium-risk',
    'Low': 'low-risk',
    'Very Low': 'very-low-risk'
  };

  return (
    <div className="dashboard">
      {/* Sélecteur de maladie global */}
      <div className="disease-selector" role="radiogroup" aria-label="Sélection de la maladie">
        {DISEASES.map(d => (
          <button
            key={d.key}
            className={`disease-btn${selectedDisease === d.key ? ' selected' : ''}`}
            style={{ borderColor: d.color, color: d.color }}
            data-disease={d.key}
            aria-pressed={selectedDisease === d.key}
            aria-label={d.label}
            onClick={() => setSelectedDisease(d.key)}
          >
            <span className="disease-icon" aria-hidden="true">{d.icon}</span> {d.label}
          </button>
        ))}
      </div>

      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <span className="title-icon">{diseaseMeta.icon}</span>
            {t('navigation.dashboard', 'Tableau de Bord')} – {diseaseMeta.label}
          </h1>
          <p className="dashboard-subtitle">
            {t('common.welcome', 'Surveillance et analyse en temps réel des données')} {diseaseMeta.label}
          </p>
          <div className="last-update">
            <span className="update-icon">🕐</span>
            {t('common.last_update', 'Dernière mise à jour')} : {stats.lastUpdate}
          </div>
        </div>
      </div>

      {/* Global Statistics */}
      <div className="stats-grid">
        <div className="stat-card primary" title={t('health.countries_monitored', 'Nombre total de pays surveillés OMS')}>
          <div className="stat-content">
            <h3 className="stat-value">{stats.totalCountries}</h3>
            <p className="stat-label">{t('health.countries_monitored', 'Pays Surveillés')}</p>
          </div>
        </div>
        <div className="stat-card danger" title={t('health.cases_total', `Nombre cumulé de cas ${diseaseMeta.label}`)}>
          <div className="stat-icon">{diseaseMeta.icon}</div>
          <div className="stat-content">
            <h3 className="stat-value">{formatNumber(stats.cases)}</h3>
            <p className="stat-label">{t('health.cases', 'Cas')} {diseaseMeta.label}</p>
          </div>
        </div>
        <div className="stat-card warning" title={t('health.rt_average', 'Rt moyen mondial (OMS)')}>
          <div className="stat-content">
            <h3 className="stat-value">{stats.averageRt.toFixed(2)}</h3>
            <p className="stat-label">{t('health.rt_average', 'Rt Moyen Mondial')}</p>
          </div>
        </div>
        <div className="stat-card info" title={t('health.mortality_rate', 'Taux de mortalité cumulé OMS')}>
          <div className="stat-content">
            <h3 className="stat-value">{stats.mortalityRate.toFixed(1)}%</h3>
            <p className="stat-label">{t('health.mortality_rate', 'Taux de Mortalité')}</p>
          </div>
        </div>
        <div className="stat-card alert" title={t('health.risk_countries', 'Nombre de pays à risque élevé OMS')}>
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3 className="stat-value">{stats.riskCountries}</h3>
            <p className="stat-label">{t('health.risk_countries', 'Pays à Risque')}</p>
          </div>
        </div>
      </div>

      {/* Charts and Analytics Section */}
      <div className="analytics-section">
        <h2 className="section-title">
          {t('analytics.title', 'Analyses et Tendances')}
        </h2>
        <div className="charts-grid">
          {/* World Map Visualization */}
          <div className="chart-card world-map">
            <h3 className="chart-title">
              {t('analytics.risk_map', 'Carte des Risques')} {diseaseMeta.label}
            </h3>
            <div className="world-map-container">
              <div className="map-placeholder">
                <div className="map-regions">
                  {stats.riskMap.map((item, index) => (
                    <div key={index} className={`region ${riskClassMap[item.risk]}`}>
                      <span className="region-label">{t(`regions.${item.region.toLowerCase().replace(' ', '_')}`, item.region)}</span>
                      <span className="risk-level">{t(`risk.${item.risk.toLowerCase()}_risk`, item.risk)}</span>
                    </div>
                  ))}
                </div>
                <div className="map-legend">
                  <div className="legend-item"><span className="legend-color high"></span>{t('risk.high', 'Risque Élevé')}</div>
                  <div className="legend-item"><span className="legend-color medium"></span>{t('risk.medium', 'Risque Modéré')}</div>
                  <div className="legend-item"><span className="legend-color low"></span>{t('risk.low', 'Risque Faible')}</div>
                  <div className="legend-item"><span className="legend-color very-low"></span>{t('risk.very_low', 'Très Faible')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Time Series Chart */}
          <div className="chart-card time-series">
            <h3 className="chart-title">{t('analytics.temporal_evolution', 'Évolution Temporelle')}</h3>
            <div className="chart-period-subtitle">{diseasePeriods[selectedDisease].label}</div>
            <div className="time-series-chart">
              <div className="chart-controls" role="tablist" aria-label="Type de série temporelle">
                <button
                  className={`chart-toggle${timeSeriesType === 'cases' ? ' active' : ''}`}
                  onClick={() => setTimeSeriesType('cases')}
                  role="tab"
                  aria-selected={timeSeriesType === 'cases'}
                  aria-label="Cas"
                >{t('analytics.cases', 'Cases')}</button>
                <button
                  className={`chart-toggle${timeSeriesType === 'deaths' ? ' active' : ''}`}
                  onClick={() => setTimeSeriesType('deaths')}
                  role="tab"
                  aria-selected={timeSeriesType === 'deaths'}
                  aria-label={t('analytics.deaths', 'Décès')}
                >{t('analytics.deaths', 'Deaths')}</button>
              </div>
              <ChartComponent
                type="bar"
                data={getYearlyData(selectedDisease, timeSeriesType)}
                title={
                  timeSeriesType === 'cases'
                    ? (selectedDisease === 'covid' ? 'Cas COVID-19 par année' : 'Cas MPOX par année')
                    : (selectedDisease === 'covid' ? 'Décès COVID-19 par année' : 'Décès MPOX par année')
                }
                height={260}
                options={{
                  plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: timeSeriesType === 'cases' ? 'Cas' : 'Décès' }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Top Countries Chart */}
          <div className="chart-card countries-ranking">
            <h3 className="chart-title">
              {t('analytics.countries_ranking', 'Top 8 Pays')} – {diseaseMeta.label}
            </h3>
            <div className="countries-chart">
              {stats.topCountries.map((country, index) => (
                <div key={index} className="country-row" title={`Statistiques ${diseaseMeta.label} pour ${country.country}`}>
                  <div className="country-info">
                    <span className="country-rank">#{index + 1}</span>
                    <span className="country-flag" aria-label={`Drapeau ${country.country}`}>{countryFlags[country.country] || '🌍'}</span>
                    <span className="country-name">{country.country}</span>
                    <span className="disease-badge" style={{ background: diseaseMeta.color }}>{diseaseMeta.label}</span>
                  </div>
                  <div className="country-stats">
                    <div className="stat">
                      <span className="stat-label">{t('analytics.cases', 'Cases')}</span>
                      <span className="stat-value">{formatNumber(country.cases)}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">{t('analytics.deaths', 'Deaths')}</span>
                      <span className="stat-value">{formatNumber(country.deaths)}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">{t('health.rt', 'Rt')}</span>
                      <span className="stat-value rt-value" style={{ color: getRtColor(country.rt) }}>{country.rt}</span>
                    </div>
                  </div>
                  <div className="country-bar" style={{ width: `${(country.cases / Math.max(...stats.topCountries.map(d => d.cases))) * 100}%`, backgroundColor: getRtColor(country.rt) }}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Analysis Pie Chart */}
          <div className="chart-card risk-analysis">
            <h3 className="chart-title">{t('analytics.risk_analysis', 'Analyse des Risques par Région')}</h3>
            <div className="risk-pie-chart">
              <ChartComponent
                type="doughnut"
                data={{
                  labels: [t('risk.high', 'Élevé'), t('risk.medium', 'Modéré'), t('risk.low', 'Faible'), t('risk.very_low', 'Très Faible')],
                  datasets: [{
                    data: [
                      stats.riskAnalysis.highRisk.length,
                      stats.riskAnalysis.mediumRisk.length,
                      stats.riskAnalysis.lowRisk.length,
                      stats.riskAnalysis.veryLowRisk.length
                    ],
                    backgroundColor: ['#e74c3c', '#f39c12', '#3498db', '#27ae60'],
                    borderWidth: 2
                  }]
                }}
                title={`Répartition des risques ${diseaseMeta.label}`}
                height={220}
                options={{ plugins: { legend: { position: 'bottom' } } }}
              />
              <div className="risk-legend">
                {Object.entries(stats.riskAnalysis).map(([level, countries]) => (
                  <div key={level} className="risk-item">
                    <div className="risk-header">
                      <span className="risk-indicator" style={{ backgroundColor: getRiskColor(level.replace('Risk', '').toLowerCase()) }}></span>
                      <span className="risk-title">
                        {t(`risk.${level.replace('Risk', '').toLowerCase()}_risk`, level.replace('Risk', ' Risk'))}
                      </span>
                    </div>
                    <div className="risk-countries">
                      {countries.slice(0, 2).map((country, idx) => (
                        <span key={idx} className="country-tag">{countryFlags[country] || '🌍'} {country}</span>
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
            <h3 className="chart-title">{t('analytics.model_performance', 'Performance des Modèles IA')}</h3>
            <div className="performance-chart">
              <div className="model-bars">
                <div className="model-bar">
                  <div className="model-name">{t('models.lstm', 'LSTM (Rt)')}</div>
                  <div className="performance-bar">
                    <div className="bar-fill" style={{ width: '68%', backgroundColor: '#3498db' }}><span className="bar-label">68%</span></div>
                  </div>
                </div>
                <div className="model-bar">
                  <div className="model-name">{t('models.random_forest', 'Random Forest (Mortalité)')}</div>
                  <div className="performance-bar">
                    <div className="bar-fill" style={{ width: '82%', backgroundColor: '#27ae60' }}><span className="bar-label">82%</span></div>
                  </div>
                </div>
                <div className="model-bar">
                  <div className="model-name">{t('models.clustering', 'Clustering (Propagation)')}</div>
                  <div className="performance-bar">
                    <div className="bar-fill" style={{ width: '74%', backgroundColor: '#f39c12' }}><span className="bar-label">74%</span></div>
                  </div>
                </div>
              </div>
              <div className="performance-summary">
                <div className="summary-item"><span className="summary-label">{t('models.average_accuracy', 'Précision Moyenne')}</span><span className="summary-value">74.7%</span></div>
                <div className="summary-item"><span className="summary-label">{t('models.predictions_made', 'Prédictions Effectuées')}</span><span className="summary-value">2,847</span></div>
                <div className="summary-item"><span className="summary-label">{t('models.average_computation_time', 'Temps de Calcul Moyen')}</span><span className="summary-value">2.3s</span></div>
              </div>
              <div className="model-explanation" aria-live="polite">
                <ul>
                  <li><b>{t('models.lstm', 'LSTM (Rt)')}</b> : {t('models.lstm_description', 'Prédiction du taux de transmission (Rt) à partir de séries temporelles.')}</li>
                  <li><b>{t('models.random_forest', 'Random Forest (Mortalité)')}</b> : {t('models.random_forest_description', 'Analyse des facteurs de risque et estimation de la mortalité.')}</li>
                  <li><b>{t('models.clustering', 'Clustering (Propagation)')}</b> : {t('models.clustering_description', 'Identification des clusters géographiques à risque.')}</li>
                </ul>
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
              {t('prediction.rt', 'Prédiction Taux de Transmission (Rt)')}
            </h3>
            <p className="module-description">
              {t('models.lstm_description', 'Modèle LSTM pour prédire l\'évolution du taux de reproduction effectif')}
            </p>
          </div>
          <div className="module-stats">
            <div className="module-stat">
              <span className="stat-number">60-70%</span>
              <span className="stat-text">{t('common.accuracy', 'Précision')}</span>
            </div>
            <div className="module-stat">
              <span className="stat-number">30 jours</span>
              <span className="stat-text">{t('common.horizon', 'Horizon')}</span>
            </div>
          </div>
          <a href="/predictions/rt" className="module-button">
{t('prediction.predict_rt', 'Accéder aux Prédictions Rt')}
          </a>
        </div>

        <div className="module-card">
          <div className="module-header">
            <h3 className="module-title">
              {t('prediction.mortality', 'Prédiction Taux de Mortalité')}
            </h3>
            <p className="module-description">
              {t('models.random_forest_description', 'Random Forest pour analyser les facteurs de mortalité')}
            </p>
          </div>
          <div className="module-stats">
            <div className="module-stat">
              <span className="stat-number">80-85%</span>
              <span className="stat-text">{t('common.accuracy', 'Précision')}</span>
            </div>
            <div className="module-stat">
              <span className="stat-number">30 jours</span>
              <span className="stat-text">{t('common.horizon', 'Horizon')}</span>
            </div>
          </div>
          <a href="/predictions/mortality" className="module-button">
{t('prediction.predict_mortality', 'Analyser la Mortalité')}
          </a>
        </div>

        <div className="module-card">
          <div className="module-header">
            <h3 className="module-title">
              {t('prediction.spread', 'Propagation Géographique')}
            </h3>
            <p className="module-description">
              {t('models.clustering_description', 'Clustering pour identifier les patterns de propagation')}
            </p>
          </div>
          <div className="module-stats">
            <div className="module-stat">
              <span className="stat-number">70-75%</span>
              <span className="stat-text">{t('common.accuracy', 'Précision')}</span>
            </div>
            <div className="module-stat">
              <span className="stat-number">{t('common.real_time', 'Temps réel')}</span>
              <span className="stat-text">{t('common.analysis', 'Analyse')}</span>
            </div>
          </div>
          <a href="/predictions/spread" className="module-button">
{t('prediction.predict_spread', 'Voir la Propagation')}
          </a>
        </div>
      </div>

      {/* Recent Predictions */}
      <div className="recent-predictions">
        <h2 className="section-title">{t('common.recent_predictions', 'Prédictions Récentes')}</h2>
        <div className="predictions-grid">
          {stats.recentPredictions.map((prediction) => (
            <div key={prediction.id} className="prediction-card" title={`Prédiction ${prediction.type} pour ${prediction.country}`} aria-label={`Prédiction ${diseaseMeta.label} ${prediction.type} ${prediction.country}`}>
              <div className="prediction-header">
                <span className="disease-badge" style={{ background: diseaseMeta.color }}>{diseaseMeta.label}</span>
                <h4 className="prediction-type">{prediction.type}</h4>
                <span className="prediction-country">{countryFlags[prediction.country] || '🌍'} {prediction.country}</span>
              </div>
              <div className="prediction-content">
                <div className="prediction-value">{typeof prediction.value === 'number' ? prediction.value.toFixed(2) : prediction.value}</div>
                <div className="prediction-trend"><span className="trend-icon" style={{ color: getTrendColor(prediction.trend) }}>{getTrendIcon(prediction.trend)}</span> <span className="trend-text">{prediction.trend}</span></div>
                <div className="confidence-bar" title={`Confiance : ${prediction.confidence}%`}>
                  <div className="confidence-fill" style={{ width: `${prediction.confidence}%` }}></div>
                  <span className="confidence-label">{prediction.confidence}%</span>
                </div>
                <div className="prediction-date">{prediction.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
  );
};

export default Dashboard; 