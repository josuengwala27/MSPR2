import React, { useState } from 'react';
import './RtPrediction.css';
// Import pour future intégration API IA
// import { iaAPI, apiUtils } from '../services/api';

const RtPrediction = () => {
  const [formData, setFormData] = useState({
    country: '',
    horizon: 14,
    startDate: new Date().toISOString().split('T')[0]
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const countries = [
    'France', 'Germany', 'Italy', 'Spain', 'United Kingdom',
    'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Portugal',
    'Poland', 'Sweden', 'Norway', 'Denmark', 'Finland'
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

    // Simulation d'appel API - À remplacer par votre API IA
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Données simulées
      const mockPrediction = {
        country: formData.country,
        currentRt: 0.95,
        predictedRt: Array.from({ length: formData.horizon }, (_, i) => ({
          date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: 0.95 + (Math.random() - 0.5) * 0.3,
          confidence: 68 + Math.random() * 15
        })),
        interpretation: 0.95 < 1 ? 'Épidémie en déclin' : 'Épidémie en croissance',
        confidence: 68,
        factors: ['Données historiques', 'Tendance récente', 'Politique sanitaire']
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
                <label htmlFor="startDate" className="form-label">
                  Date de début
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="form-input"
                  aria-describedby="date-help"
                />
                <div id="date-help" className="form-help">
                  Date à partir de laquelle commencer la prédiction
                </div>
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
                Résultats de Prédiction - {prediction.country}
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
                  <h3 className="stat-value">{prediction.confidence}%</h3>
                  <p className="stat-label">Confiance</p>
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

            {/* Graphique */}
            <div className="chart-section">
              <h3 className="chart-title">Évolution Prédite du Rt</h3>
              <div className="chart-container">
                <div className="chart-placeholder">
                  <div className="chart-info">
                    <p>Graphique Rt sur {formData.horizon} jours</p>
                    <p className="chart-note">
                      Intégration Chart.js/D3.js à venir
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interprétation */}
            <div className="interpretation-section">
              <h3 className="interpretation-title">
                <span className="interpretation-icon">🧠</span>
                Analyse des Résultats
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
              <button className="action-btn secondary" onClick={() => setPrediction(null)}>
                <span className="btn-icon">🔄</span>
                Nouvelle Prédiction
              </button>
              <button className="action-btn primary">
                <span className="btn-icon">📥</span>
                Télécharger Rapport
              </button>
              <button className="action-btn info">
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