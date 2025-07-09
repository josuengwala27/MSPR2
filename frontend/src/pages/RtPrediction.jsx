import React, { useState } from 'react';
import ChartComponent from '../components/Charts/ChartComponent';
import './RtPrediction.css';
// Import pour future intégration API IA
// import { iaAPI, apiUtils } from '../services/api';

const RtPrediction = () => {
  const [formData, setFormData] = useState({
    country: '',
    disease: 'COVID-19', // NEW: default disease
    horizon: 14,
    startDate: new Date().toISOString().split('T')[0],
    date: new Date().toISOString().split('T')[0] // NEW: date field
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const diseases = [
    { label: 'COVID-19', value: 'COVID-19' },
    { label: 'MPOX', value: 'MPOX' }
  ];

  const countries = [
    'USA', 'China', 'India', 'France', 'Germany', 'Brazil', 'Japan', 'South Korea',
    'RDC', 'Nigeria', 'UK', 'Spain', 'South Africa', 'Portugal', 'Australia', 'Canada',
    'Cameroun', 'Ghana', 'Italie', 'Russie', 'Mexique', 'Turquie', 'Iran', 'Singapore', 'Taiwan'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulation d'appel API avec délai réaliste
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Disease-specific simulation logic
      let baseRt, seasonalEffect, variantEffect, adjustedBaseRt, factors, variantInfo, vaccinationImpact;
      const currentMonth = new Date().getMonth();
      const simDate = new Date(formData.date);
      const year = simDate.getFullYear();
      let pandemicFactor = 1;
      if (formData.disease === 'COVID-19') {
        if (year <= 2020) pandemicFactor = 2.0; // Early pandemic, high Rt
        else if (year === 2021) pandemicFactor = 1.3;
        else if (year === 2022) pandemicFactor = 1.1;
        else if (year >= 2023) pandemicFactor = 0.1; // Endemic, ultra-low Rt
      } else if (formData.disease === 'MPOX') {
        if (year <= 2022) pandemicFactor = 1.2;
        else pandemicFactor = 0.5; // Lower Rt for MPOX after 2022
      }

      if (formData.disease === 'COVID-19') {
        baseRt = (0.5 + Math.random() * 0.4) * pandemicFactor; // Adjusted by date
        seasonalEffect = Math.sin((currentMonth - 1) * Math.PI / 6) * 0.15 * pandemicFactor; // Reduced seasonal effect
        variantEffect = Math.random() > 0.8 ? 0.1 * pandemicFactor : 0; // Reduced variant effect (20% chance, smaller impact)
        adjustedBaseRt = Math.max(0.3, Math.min(1.2, baseRt + seasonalEffect + variantEffect));
        factors = [
          'Données de séquençage génomique',
          'Taux de vaccination et rappels',
          'Mesures de distanciation sociale',
          'Saisonnalité épidémiologique',
          'Présence de variants préoccupants',
          'Mobilité de la population',
          'Capacité de test et traçage'
        ];
        variantInfo = {
          dominantVariant: Math.random() > 0.6 ? 'Omicron BA.5' : 'Omicron XBB',
          transmissionAdvantage: Math.random() * 0.2 + 0.05, // Reduced advantage
          immuneEscape: Math.random() * 0.15 + 0.05 // Reduced escape
        };
        vaccinationImpact = {
          coverage: Math.floor(Math.random() * 30 + 60), // 60-90%
          effectiveness: Math.floor(Math.random() * 20 + 70), // 70-90%
          boosterRate: Math.floor(Math.random() * 40 + 30) // 30-70%
        };
      } else if (formData.disease === 'MPOX') {
        baseRt = (0.6 + Math.random() * 0.4) * pandemicFactor; // 0.6-1.0
        seasonalEffect = Math.sin((currentMonth + 2) * Math.PI / 6) * 0.15 * pandemicFactor; // MPOX: saisonnalité plus faible
        variantEffect = 0; // Pas de variant préoccupant majeur
        adjustedBaseRt = Math.max(0.2, Math.min(1.3, baseRt + seasonalEffect + variantEffect));
        factors = [
          'Contact étroit avec cas confirmés',
          'Transmission interhumaine limitée',
          'Présence de réservoir animal',
          'Mobilité régionale',
          'Capacité de surveillance',
          'Vaccination ciblée',
          'Historique d\'épidémies locales'
        ];
        variantInfo = {
          dominantVariant: 'Clade IIb',
          transmissionAdvantage: 0.0,
          immuneEscape: 0.0
        };
        vaccinationImpact = {
          coverage: Math.floor(Math.random() * 20 + 10), // 10-30%
          effectiveness: Math.floor(Math.random() * 20 + 60), // 60-80%
          boosterRate: Math.floor(Math.random() * 10 + 5) // 5-15%
        };
      }
      // Disease-specific interpretation with more realistic thresholds for 2025
      let interpretation;
      if (formData.disease === 'COVID-19') {
        interpretation = adjustedBaseRt < 0.7 ? 'COVID-19 sous contrôle (endémique)' :
                        adjustedBaseRt < 0.9 ? 'COVID-19 en déclin' :
                        adjustedBaseRt < 1.1 ? 'COVID-19 stable' : 'COVID-19 en légère progression';
      } else if (formData.disease === 'MPOX') {
        interpretation = adjustedBaseRt < 0.7 ? 'MPOX sous contrôle' :
                        adjustedBaseRt < 0.9 ? 'MPOX en déclin' :
                        adjustedBaseRt < 1.1 ? 'MPOX stable' : 'MPOX en progression';
      }
      const mockPrediction = {
        country: formData.country,
        disease: formData.disease,
        currentRt: adjustedBaseRt,
        predictedRt: Array.from({ length: formData.horizon }, (_, i) => {
          const dailyVariation = (Math.random() - 0.5) * (formData.disease === 'COVID-19' ? 0.2 : 0.1);
          const trendEffect = adjustedBaseRt > 1.0 ? -0.01 * i : 0.005 * i;
          const interventionEffect = -0.02 * Math.min(i, 7);
          const value = Math.max(0.1, Math.min(formData.disease === 'COVID-19' ? 3.0 : 1.5,
            adjustedBaseRt + dailyVariation + trendEffect + interventionEffect
          ));
          return {
            date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            value: parseFloat(value.toFixed(2)),
            confidence: Math.max(40, 90 - (i * (formData.disease === 'COVID-19' ? 3 : 4)))
          };
        }),
        interpretation,
        confidence: Math.round(85 - (formData.horizon * (formData.disease === 'COVID-19' ? 1.2 : 1.5))),
        factors,
        historicalData: Array.from({ length: 30 }, (_, i) => {
          const historicalDate = new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000);
          const historicalMonth = historicalDate.getMonth();
          const historicalSeasonalEffect = formData.disease === 'COVID-19'
            ? Math.sin((historicalMonth - 1) * Math.PI / 6) * 0.3
            : Math.sin((historicalMonth + 2) * Math.PI / 6) * 0.15;
          return {
            date: historicalDate.toISOString().split('T')[0],
            value: Math.max(0.1, Math.min(formData.disease === 'COVID-19' ? 3.0 : 1.5,
              adjustedBaseRt + (Math.random() - 0.5) * (formData.disease === 'COVID-19' ? 0.3 : 0.15) + historicalSeasonalEffect
            ))
          };
        }),
        variantInfo,
        vaccinationImpact
      };

      setPrediction(mockPrediction);
    } catch (err) {
      setError('Erreur lors de la prédiction. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const getRtStatus = (rt) => {
    if (rt < 0.8) return { status: 'Très favorable', color: '#27ae60', icon: '📉' };
    if (rt < 1.0) return { status: 'Favorable', color: '#2ecc71', icon: '📉' };
    if (rt < 1.2) return { status: 'Préoccupant', color: '#f39c12', icon: '📈' };
    return { status: 'Critique', color: '#e74c3c', icon: '📈' };
  };

  return (
    <div className="rt-prediction">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          <span className="title-icon">📈</span>
          Prédiction du Taux de Transmission (Rt)
        </h1>
        <p className="page-description">
          Utilisez notre modèle LSTM pour prédire l'évolution du taux de reproduction effectif
        </p>
      </div>

      <div className="prediction-container">
        {/* Formulaire */}
        <div className="prediction-form-section">
          <div className="form-card">
            <h2 className="form-title">
              Paramètres de Prédiction
            </h2>
            
            <form onSubmit={handleSubmit} className="prediction-form">
              <div className="form-group">
                <label htmlFor="disease" className="form-label">
                  Maladie <span className="required">*</span>
                </label>
                <select
                  id="disease"
                  name="disease"
                  value={formData.disease}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                  aria-describedby="disease-help"
                >
                  {diseases.map(d => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
                <div id="disease-help" className="form-help">
                  Choisissez la maladie pour la prédiction Rt
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="country" className="form-label">
                  Pays <span className="required">*</span>
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="form-select"
                  required
                  aria-describedby="country-help"
                >
                  <option value="">Sélectionnez un pays</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
                <div id="country-help" className="form-help">
                  Choisissez le pays pour lequel vous souhaitez une prédiction Rt
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="horizon" className="form-label">
                  Horizon de prédiction : {formData.horizon} jours
                </label>
                <input
                  type="range"
                  id="horizon"
                  name="horizon"
                  min="7"
                  max="30"
                  value={formData.horizon}
                  onChange={handleInputChange}
                  className="form-range"
                  aria-describedby="horizon-help"
                />
                <div className="range-labels">
                  <span>7 jours</span>
                  <span>30 jours</span>
                </div>
                <div id="horizon-help" className="form-help">
                  Plus l'horizon est court, plus la prédiction est précise
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="date">Date de simulation</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>

              <button
                type="submit"
                className="submit-button"
                disabled={loading || !formData.country}
                aria-describedby="submit-help"
              >
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Calcul en cours...
                  </>
                ) : (
                  <>
                    
                    Générer la Prédiction
                  </>
                )}
              </button>
              <div id="submit-help" className="form-help">
                Le calcul prend environ 2-3 secondes
              </div>
            </form>
          </div>

          {/* Info Box */}
          <div className="info-card">
            <h3 className="info-title">
              À propos du Rt
            </h3>
            <div className="info-content">
              <div className="info-item">
                <strong>Rt &lt; 1</strong>
                <span>Épidémie en déclin</span>
              </div>
              <div className="info-item">
                <strong>Rt = 1</strong>
                <span>Épidémie stable</span>
              </div>
              <div className="info-item">
                <strong>Rt &gt; 1</strong>
                <span>Épidémie en croissance</span>
              </div>
            </div>
            <div className="model-info">
              <h4>Modèle LSTM</h4>
              <ul>
                <li>Précision : 60-70%</li>
                <li>Basé sur 30 jours d'historique</li>
                <li>Mise à jour quotidienne</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Résultats */}
        {error && (
          <div className="error-message" role="alert">
            <span className="error-icon">❌</span>
            {error}
          </div>
        )}

        {prediction && (
          <div className="results-section">
            <div className="results-header">
              <h2 className="results-title">
                Résultats de Prédiction - {prediction.country} <span className="disease-badge">{prediction.disease}</span>
              </h2>
            </div>

            {/* KPIs actuels */}
            <div className="current-stats">
              <div className="stat-card primary">
                <div className="stat-content">
                  <h3 className="stat-value">{prediction.currentRt.toFixed(2)}</h3>
                  <p className="stat-label">Rt Actuel</p>
                </div>
                <div className="stat-status" style={{ color: getRtStatus(prediction.currentRt).color }}>
                  {getRtStatus(prediction.currentRt).icon} {getRtStatus(prediction.currentRt).status}
                </div>
              </div>

              <div className="stat-card info">
                <div className="stat-content">
                  <h3 className="stat-value">{formData.date}</h3>
                  <p className="stat-label">Date de simulation</p>
                </div>
              </div>

              <div className="stat-card success">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <h3 className="stat-value">{formData.horizon}</h3>
                  <p className="stat-label">Jours Prédits</p>
                </div>
              </div>
            </div>

            {/* Graphique d'évolution */}
            <div className="chart-section">
              <h3 className="chart-title">Évolution Prédite du Rt <span className="disease-badge">{prediction.disease}</span></h3>
              <div className="chart-container">
                <ChartComponent
                  type="line"
                  title="Prédiction Rt - 30 jours"
                  height={350}
                  data={{
                    labels: prediction.predictedRt.map(p => p.date),
                    datasets: [
                      {
                        label: 'Rt Prédit',
                        data: prediction.predictedRt.map(p => p.value),
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                      }
                    ]
                  }}
                  options={{
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `Rt: ${context.parsed.y.toFixed(2)}`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        min: 0,
                        max: Math.max(...prediction.predictedRt.map(p => p.value)) * 1.2,
                        ticks: {
                          callback: function(value) {
                            return value.toFixed(1);
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
              <p className="chart-note">
                * Les prédictions sont basées sur les données historiques et les tendances récentes
              </p>
            </div>

            {/* Graphique de confiance */}
            <div className="chart-section">
              <h3 className="chart-title">Niveau de Confiance par Jour</h3>
              <div className="chart-container">
                <ChartComponent
                  type="bar"
                  title="Confiance des Prédictions"
                  height={250}
                  data={{
                    labels: prediction.predictedRt.map(p => p.date),
                    datasets: [
                      {
                        label: 'Confiance (%)',
                        data: prediction.predictedRt.map(p => p.confidence),
                        backgroundColor: prediction.predictedRt.map(p => 
                          p.confidence > 80 ? '#27ae60' : 
                          p.confidence > 60 ? '#f39c12' : '#e74c3c'
                        ),
                        borderColor: '#2c3e50',
                        borderWidth: 1
                      }
                    ]
                  }}
                  options={{
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            return `Confiance: ${context.parsed.y}%`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        min: 0,
                        max: 100,
                        ticks: {
                          callback: function(value) {
                            return value + '%';
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Interprétation */}
            <div className="interpretation-section">
              <h3 className="interpretation-title">
                <span className="interpretation-icon">🧠</span>
                Analyse des Résultats <span className="disease-badge">{prediction.disease}</span>
              </h3>
              <div className="interpretation-content">
                <div className="interpretation-main">
                  <span className="interpretation-status" style={{ color: getRtStatus(prediction.currentRt).color }}>
                    {prediction.interpretation}
                  </span>
                </div>
                <div className="factors">
                  <h4>Facteurs pris en compte :</h4>
                  <ul className="factors-list">
                    {prediction.factors.map((factor, index) => (
                      <li key={index} className="factor-item">{factor}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="actions-section">
              <button className="action-btn secondary" onClick={() => {
                setPrediction(null);
                setFormData({ country: '', horizon: 14, startDate: new Date().toISOString().split('T')[0], date: new Date().toISOString().split('T')[0] });
              }}>
                <span className="btn-icon">🔄</span>
                Nouvelle Prédiction
              </button>
              <button className="action-btn primary" onClick={() => {
                const dataStr = JSON.stringify(prediction, null, 2);
                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `rt-prediction-${prediction.disease}-${prediction.country}-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
              }}>
                <span className="btn-icon">📥</span>
                Télécharger Données
              </button>
              <button className="action-btn info" onClick={() => {
                const shareText = `Prédiction Rt (${prediction.disease}) pour ${prediction.country}: ${prediction.currentRt.toFixed(2)} (${prediction.interpretation})`;
                if (navigator.share) {
                  navigator.share({
                    title: `Prédiction Rt - ${prediction.disease} - OMS`,
                    text: shareText,
                    url: window.location.href
                  });
                } else {
                  navigator.clipboard.writeText(shareText);
                  alert('Résultats copiés dans le presse-papiers !');
                }
              }}>
                <span className="btn-icon">📧</span>
                Partager Résultats
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RtPrediction; 