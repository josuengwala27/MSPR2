import React, { useState } from 'react';
import ChartComponent from '../components/Charts/ChartComponent';
import './MortalityPrediction.css';

const MortalityPrediction = () => {
  const [predictionParams, setPredictionParams] = useState({
    country: 'France',
    disease: 'COVID-19',
    ageGroup: 'all',
    riskFactors: [],
    healthcareCapacity: 'medium',
    vaccinationRate: 70,
    timeHorizon: 30,
    date: new Date().toISOString().split('T')[0] // NEW: date field
  });

  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [mortalityData] = useState({
    byAgeGroup: {
      'COVID-19': [
        { ageGroup: '0-9', mortalityRate: 0.0001, cases: 45000, deaths: 5, deaths_per_100k: 0.01 },
        { ageGroup: '10-19', mortalityRate: 0.0002, cases: 52000, deaths: 10, deaths_per_100k: 0.02 },
        { ageGroup: '20-29', mortalityRate: 0.0005, cases: 78000, deaths: 39, deaths_per_100k: 0.05 },
        { ageGroup: '30-39', mortalityRate: 0.001, cases: 89000, deaths: 89, deaths_per_100k: 0.1 },
        { ageGroup: '40-49', mortalityRate: 0.003, cases: 95000, deaths: 285, deaths_per_100k: 0.3 },
        { ageGroup: '50-59', mortalityRate: 0.008, cases: 82000, deaths: 656, deaths_per_100k: 0.8 },
        { ageGroup: '60-69', mortalityRate: 0.025, cases: 67000, deaths: 1675, deaths_per_100k: 2.5 },
        { ageGroup: '70-79', mortalityRate: 0.08, cases: 45000, deaths: 3600, deaths_per_100k: 8.0 },
        { ageGroup: '80+', mortalityRate: 0.15, cases: 32000, deaths: 4800, deaths_per_100k: 15.0 }
      ],
      'MPOX': [
        { ageGroup: '0-9', mortalityRate: 0.02, cases: 1200, deaths: 24, deaths_per_100k: 2.0 },
        { ageGroup: '10-19', mortalityRate: 0.01, cases: 2800, deaths: 28, deaths_per_100k: 1.0 },
        { ageGroup: '20-29', mortalityRate: 0.008, cases: 15600, deaths: 125, deaths_per_100k: 0.8 },
        { ageGroup: '30-39', mortalityRate: 0.012, cases: 12400, deaths: 149, deaths_per_100k: 1.2 },
        { ageGroup: '40-49', mortalityRate: 0.018, cases: 8900, deaths: 160, deaths_per_100k: 1.8 },
        { ageGroup: '50-59', mortalityRate: 0.025, cases: 5200, deaths: 130, deaths_per_100k: 2.5 },
        { ageGroup: '60-69', mortalityRate: 0.035, cases: 3100, deaths: 109, deaths_per_100k: 3.5 },
        { ageGroup: '70-79', mortalityRate: 0.045, cases: 1800, deaths: 81, deaths_per_100k: 4.5 },
        { ageGroup: '80+', mortalityRate: 0.06, cases: 900, deaths: 54, deaths_per_100k: 6.0 }
      ]
    },
    byRiskFactor: {
      'COVID-19': [
        { factor: 'Maladies cardiovasculaires', riskMultiplier: 3.2, prevalence: 8.9, mortality: 8.5 },
        { factor: 'Diabète', riskMultiplier: 2.8, prevalence: 15.2, mortality: 6.2 },
        { factor: 'Maladies respiratoires chroniques', riskMultiplier: 2.5, prevalence: 7.5, mortality: 5.8 },
        { factor: 'Hypertension', riskMultiplier: 2.1, prevalence: 28.7, mortality: 4.9 },
        { factor: 'Immunodéficience', riskMultiplier: 4.5, prevalence: 2.1, mortality: 12.8 },
        { factor: 'Maladie rénale chronique', riskMultiplier: 3.8, prevalence: 4.2, mortality: 8.9 },
        { factor: 'Obésité (IMC > 30)', riskMultiplier: 2.3, prevalence: 18.5, mortality: 5.4 },
        { factor: 'Cancer actif', riskMultiplier: 3.5, prevalence: 1.8, mortality: 9.2 }
      ],
      'MPOX': [
        { factor: 'Immunodéficience/VIH', riskMultiplier: 8.5, prevalence: 1.8, mortality: 25.4 },
        { factor: 'Eczéma atopique', riskMultiplier: 3.2, prevalence: 8.4, mortality: 8.9 },
        { factor: 'Grossesse', riskMultiplier: 4.8, prevalence: 1.2, mortality: 15.2 },
        { factor: 'Âge < 8 ans', riskMultiplier: 2.5, prevalence: 12.1, mortality: 7.8 },
        { factor: 'Malnutrition sévère', riskMultiplier: 3.8, prevalence: 0.8, mortality: 12.1 },
        { factor: 'Maladies dermatologiques', riskMultiplier: 2.8, prevalence: 3.2, mortality: 6.4 },
        { factor: 'Brûlures étendues', riskMultiplier: 5.2, prevalence: 0.3, mortality: 18.9 },
        { factor: 'Traitement immunosuppresseur', riskMultiplier: 6.1, prevalence: 1.5, mortality: 22.3 }
      ]
    },
    byCountry: [
      { country: 'France', iso_code: 'FRA', covid_mortality: 0.18, mpox_mortality: 0.008, healthcare_index: 85, vaccination_rate: 78 },
      { country: 'Allemagne', iso_code: 'DEU', covid_mortality: 0.16, mpox_mortality: 0.006, healthcare_index: 88, vaccination_rate: 76 },
      { country: 'Italie', iso_code: 'ITA', covid_mortality: 0.22, mpox_mortality: 0.011, healthcare_index: 79, vaccination_rate: 73 },
      { country: 'Espagne', iso_code: 'ESP', covid_mortality: 0.19, mpox_mortality: 0.009, healthcare_index: 82, vaccination_rate: 81 },
      { country: 'Royaume-Uni', iso_code: 'GBR', covid_mortality: 0.21, mpox_mortality: 0.007, healthcare_index: 84, vaccination_rate: 75 },
      { country: 'USA', iso_code: 'USA', covid_mortality: 0.28, mpox_mortality: 0.014, healthcare_index: 72, vaccination_rate: 68 },
      { country: 'Brésil', iso_code: 'BRA', covid_mortality: 0.35, mpox_mortality: 0.021, healthcare_index: 65, vaccination_rate: 62 },
      { country: 'Inde', iso_code: 'IND', covid_mortality: 0.12, mpox_mortality: 0.018, healthcare_index: 58, vaccination_rate: 71 },
      { country: 'Afrique du Sud', iso_code: 'ZAF', covid_mortality: 0.42, mpox_mortality: 0.025, healthcare_index: 52, vaccination_rate: 45 },
      { country: 'RDC', iso_code: 'COD', covid_mortality: 0.38, mpox_mortality: 0.085, healthcare_index: 35, vaccination_rate: 28 }
    ]
  });

  const [riskFactorsAnalysis] = useState({
    'COVID-19': {
      demographics: {
        age: { weight: 45, impact: 'Very High' },
        gender: { weight: 8, impact: 'Low' },
        ethnicity: { weight: 12, impact: 'Medium' }
      },
      medical: {
        comorbidities: { weight: 35, impact: 'Very High' },
        immuneStatus: { weight: 25, impact: 'High' },
        previousInfection: { weight: 15, impact: 'Medium' }
      },
      environmental: {
        healthcareAccess: { weight: 20, impact: 'High' },
        socioeconomic: { weight: 18, impact: 'High' },
        airQuality: { weight: 12, impact: 'Medium' }
      }
    },
    'MPOX': {
      demographics: {
        age: { weight: 30, impact: 'High' },
        gender: { weight: 15, impact: 'Medium' },
        population: { weight: 10, impact: 'Medium' }
      },
      medical: {
        immuneStatus: { weight: 40, impact: 'Very High' },
        skinConditions: { weight: 25, impact: 'High' },
        vaccination: { weight: 20, impact: 'High' }
      },
      environmental: {
        contactTracing: { weight: 25, impact: 'High' },
        healthcareAccess: { weight: 20, impact: 'High' },
        socialFactors: { weight: 15, impact: 'Medium' }
      }
    }
  });

  const countries = [
    'USA', 'China', 'India', 'France', 'Germany', 'Brazil', 'Japan', 'South Korea',
    'RDC', 'Nigeria', 'UK', 'Spain', 'South Africa', 'Portugal', 'Australia', 'Canada',
    'Cameroun', 'Ghana', 'Italie', 'Russie', 'Mexique', 'Turquie', 'Iran', 'Singapore', 'Taiwan'
  ];

  const diseases = [
    { value: 'COVID-19', label: 'COVID-19' },
    { value: 'MPOX', label: 'MPOX (Variole du singe)' }
  ];

  const ageGroups = [
    { value: 'all', label: 'Tous les âges' },
    { value: '0-19', label: '0-19 ans' },
    { value: '20-39', label: '20-39 ans' },
    { value: '40-59', label: '40-59 ans' },
    { value: '60-79', label: '60-79 ans' },
    { value: '80+', label: '80+ ans' }
  ];

  const riskFactorOptions = {
    'COVID-19': [
      'Maladies cardiovasculaires', 'Diabète', 'Maladies respiratoires chroniques', 
      'Hypertension', 'Immunodéficience', 'Maladie rénale chronique'
    ],
    'MPOX': [
      'Immunodéficience/VIH', 'Eczéma atopique', 'Grossesse', 
      'Âge < 8 ans', 'Malnutrition sévère', 'Maladies dermatologiques'
    ]
  };

  const healthcareCapacityOptions = [
    { value: 'low', label: 'Faible' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Élevée' }
  ];

  const handleInputChange = (field, value) => {
    setPredictionParams(prev => {
      const newParams = { ...prev, [field]: value };
      // Reset risk factors when disease changes
      if (field === 'disease') {
        newParams.riskFactors = [];
      }
      return newParams;
    });
  };

  const handleRiskFactorsChange = (factor) => {
    setPredictionParams(prev => ({
      ...prev,
      riskFactors: prev.riskFactors.includes(factor)
        ? prev.riskFactors.filter(f => f !== factor)
        : [...prev.riskFactors, factor]
    }));
  };

  const handlePrediction = async () => {
    setIsLoading(true);
    
    // Simulation d'un appel API avec données réalistes COVID/MPOX
    setTimeout(() => {
      const simDate = new Date(predictionParams.date);
      const year = simDate.getFullYear();
      let pandemicFactor = 1;
      if (predictionParams.disease === 'COVID-19') {
        if (year <= 2020) pandemicFactor = 2.5; // Early pandemic, high mortality
        else if (year === 2021) pandemicFactor = 1.5;
        else if (year === 2022) pandemicFactor = 1.1;
        else if (year >= 2023) pandemicFactor = 0.1; // Endemic, ultra-low mortality
      } else if (predictionParams.disease === 'MPOX') {
        if (year <= 2022) pandemicFactor = 1.5;
        else pandemicFactor = 0.3; // Lower mortality for MPOX after 2022
      }

      // Taux de mortalité de base plus réalistes
      const baseRate = predictionParams.disease === 'COVID-19' 
        ? (Math.random() * 0.15 + 0.05) * pandemicFactor // Adjusted by date
        : (Math.random() * 0.08 + 0.02) * pandemicFactor;
        
      // Multiplicateur d'âge basé sur les vraies données
      const ageMultiplier = predictionParams.ageGroup === '80+' ? 15.0 : 
                           predictionParams.ageGroup === '60-79' ? 8.0 : 
                           predictionParams.ageGroup === '40-59' ? 3.0 : 
                           predictionParams.ageGroup === '20-39' ? 1.0 : 0.1;
                           
      // Multiplicateur de facteurs de risque (plus réaliste)
      const riskMultiplier = 1 + (predictionParams.riskFactors.length * 0.8);
      
      // Multiplicateur de capacité sanitaire
      const healthcareMultiplier = predictionParams.healthcareCapacity === 'low' ? 2.5 :
                                   predictionParams.healthcareCapacity === 'medium' ? 1.2 : 0.8;
      
      // Multiplicateur de vaccination (plus réaliste)
      const vaccinationMultiplier = predictionParams.disease === 'COVID-19' 
        ? 1 - (predictionParams.vaccinationRate / 150) // Réduction de 0-67%
        : 1 - (predictionParams.vaccinationRate / 200); // MPOX vaccination moins efficace

      const predictedRate = baseRate * ageMultiplier * riskMultiplier * 
                           healthcareMultiplier * vaccinationMultiplier;

      setPredictionResult({
        mortalityRate: Math.max(0.001, predictedRate).toFixed(4),
        confidence: Math.floor(Math.random() * 15 + 80), // 80-95%
        riskLevel: predictedRate > 0.1 ? 'Très élevé' : 
                   predictedRate > 0.05 ? 'Élevé' : 
                   predictedRate > 0.02 ? 'Modéré' : 'Faible',
        estimatedDeaths: Math.floor(predictedRate * 100000),
        diseaseSpecific: {
          incidence_7j: Math.floor(Math.random() * 200 + 50),
          cases_per_100k: Math.floor(Math.random() * 500 + 100),
          growth_rate: (Math.random() * 0.3 - 0.15).toFixed(3),
          hospitalization_rate: predictionParams.disease === 'COVID-19' ? 
            (Math.random() * 0.05 + 0.02).toFixed(3) : 
            (Math.random() * 0.02 + 0.005).toFixed(3)
        },
        factors: {
          ageImpact: ageMultiplier.toFixed(1),
          riskImpact: riskMultiplier.toFixed(1),
          healthcareImpact: healthcareMultiplier.toFixed(1),
          vaccinationImpact: vaccinationMultiplier.toFixed(2)
        },
        recommendations: [
          predictionParams.ageGroup === '80+' ? 'Vaccination prioritaire et isolement strict recommandé' : '',
          predictionParams.riskFactors.length > 0 ? 'Surveillance médicale renforcée nécessaire' : '',
          predictionParams.healthcareCapacity === 'low' ? 'Amélioration de l\'accès aux soins critique' : '',
          predictionParams.vaccinationRate < 50 ? 'Campagne de vaccination urgente recommandée' : ''
        ].filter(rec => rec !== ''),
        historicalComparison: {
          previousWave: (predictedRate * 0.8).toFixed(4),
          seasonalVariation: (predictedRate * (0.8 + Math.random() * 0.4)).toFixed(4),
          variantImpact: predictionParams.disease === 'COVID-19' ? 
            (predictedRate * (1.2 + Math.random() * 0.3)).toFixed(4) : 
            (predictedRate * (1.1 + Math.random() * 0.2)).toFixed(4)
        }
      });
      
      setIsLoading(false);
    }, 2000);
  };

  const getMortalityColor = (rate) => {
    if (rate < 1) return '#27ae60';
    if (rate < 2) return '#f39c12';
    if (rate < 3) return '#e67e22';
    return '#e74c3c';
  };

  const getRiskColor = (risk) => {
    if (risk < 1.5) return '#27ae60';
    if (risk < 2.5) return '#f39c12';
    return '#e74c3c';
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'Very High': return '#e74c3c';
      case 'High': return '#e67e22';
      case 'Medium': return '#f39c12';
      case 'Low': return '#27ae60';
      default: return '#6c757d';
    }
  };

  const currentAgeData = mortalityData.byAgeGroup[predictionParams.disease] || [];
  const currentRiskData = mortalityData.byRiskFactor[predictionParams.disease] || [];
  const currentFactorsAnalysis = riskFactorsAnalysis[predictionParams.disease] || {};

  return (
    <div className="mortality-prediction">
      {/* Header */}
      <div className="mortality-header">
        <div className="header-content">
          <h1 className="page-title">
            Prédiction Taux de Mortalité
          </h1>
          <p className="page-subtitle">
            Analyse prédictive des facteurs de mortalité COVID-19 & MPOX 
          </p>

        </div>
      </div>

      <div className="mortality-content">
        {/* Prediction Form */}
        <div className="prediction-section">
          <div className="form-card">
            <h2 className="section-title">
              Paramètres de Prédiction
            </h2>

            <div className="form-grid">
              {/* Disease Selection */}
              <div className="form-group">
                <label htmlFor="disease">Maladie</label>
                <select
                  id="disease"
                  value={predictionParams.disease}
                  onChange={(e) => handleInputChange('disease', e.target.value)}
                  className="form-select"
                >
                  {diseases.map(disease => (
                    <option key={disease.value} value={disease.value}>{disease.label}</option>
                  ))}
                </select>
              </div>

              {/* Country Selection */}
              <div className="form-group">
                <label htmlFor="country">Pays</label>
                <select
                  id="country"
                  value={predictionParams.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="form-select"
                >
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* Age Group */}
              <div className="form-group">
                <label htmlFor="ageGroup">Groupe d'âge</label>
                <select
                  id="ageGroup"
                  value={predictionParams.ageGroup}
                  onChange={(e) => handleInputChange('ageGroup', e.target.value)}
                  className="form-select"
                >
                  {ageGroups.map(group => (
                    <option key={group.value} value={group.value}>{group.label}</option>
                  ))}
                </select>
              </div>

              {/* Healthcare Capacity */}
              <div className="form-group">
                <label htmlFor="healthcare">Capacité du système de santé</label>
                <select
                  id="healthcare"
                  value={predictionParams.healthcareCapacity}
                  onChange={(e) => handleInputChange('healthcareCapacity', e.target.value)}
                  className="form-select"
                >
                  {healthcareCapacityOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Vaccination Rate */}
              <div className="form-group">
                <label htmlFor="vaccination">
                  Taux de vaccination: {predictionParams.vaccinationRate}%
                </label>
                <input
                  type="range"
                  id="vaccination"
                  min="0"
                  max="100"
                  value={predictionParams.vaccinationRate}
                  onChange={(e) => handleInputChange('vaccinationRate', parseInt(e.target.value))}
                  className="form-range"
                />
                <div className="range-labels">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Time Horizon */}
              <div className="form-group">
                <label htmlFor="timeHorizon">
                  Horizon temporel: {predictionParams.timeHorizon} jours
                </label>
                <input
                  type="range"
                  id="timeHorizon"
                  min="7"
                  max="90"
                  value={predictionParams.timeHorizon}
                  onChange={(e) => handleInputChange('timeHorizon', parseInt(e.target.value))}
                  className="form-range"
                />
                <div className="range-labels">
                  <span>7j</span>
                  <span>45j</span>
                  <span>90j</span>
                </div>
              </div>

              {/* Date Selection */}
              <div className="form-group">
                <label htmlFor="date">Date de simulation</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={predictionParams.date}
                  onChange={e => handleInputChange('date', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            {/* Risk Factors */}
            <div className="form-group full-width">
              <label>Facteurs de risque pour {predictionParams.disease} (sélection multiple)</label>
              <div className="checkbox-grid">
                {riskFactorOptions[predictionParams.disease]?.map(factor => (
                  <label key={factor} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={predictionParams.riskFactors.includes(factor)}
                      onChange={() => handleRiskFactorsChange(factor)}
                      className="checkbox-input"
                    />
                    <span className="checkbox-text">{factor}</span>
                  </label>
                ))}
              </div>
            </div>

            <button 
              onClick={handlePrediction}
              disabled={isLoading}
              className="predict-button"
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Analyse en cours...
                </>
              ) : (
                <>
                  
                  Prédire la Mortalité {predictionParams.disease}
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {predictionResult && (
            <div className="results-card">
              <h3 className="results-title">
                <span className="disease-badge">{predictionParams.disease}</span>
                Résultats de Prédiction - {predictionParams.disease}
              </h3>

              <div className="results-grid">
                <div className="result-item primary">
                  <div className="result-label">Taux de Mortalité Prédit</div>
                  <div className="result-value">{predictionResult.mortalityRate}%</div>
                </div>

                <div className="result-item info">
                  <div className="result-label">Niveau de Risque</div>
                  <div className="result-value">{predictionResult.riskLevel}</div>
                </div>

                <div className="result-item success">
                  <div className="result-label">Confiance du Modèle</div>
                  <div className="result-value">{predictionResult.confidence}%</div>
                </div>

                <div className="result-item warning">
                  <div className="result-label">Incidence 7j (pour 100k)</div>
                  <div className="result-value">{predictionResult.diseaseSpecific.incidence_7j}</div>
                </div>

                <div className="result-item secondary">
                  <div className="result-label">Cas pour 100k hab.</div>
                  <div className="result-value">{predictionResult.diseaseSpecific.cases_per_100k}</div>
                </div>

                <div className="result-item info">
                  <div className="result-label">Taux de Croissance</div>
                  <div className="result-value">{predictionResult.diseaseSpecific.growth_rate}</div>
                </div>

                <div className="result-item info">
                  <div className="result-label">Date de simulation</div>
                  <div className="result-value">{predictionParams.date}</div>
                </div>
              </div>

              <div className="factors-analysis">
                <h4>Analyse des Facteurs</h4>
                <div className="factors-grid">
                  {Object.entries(predictionResult.factors).map(([factor, impact]) => (
                    <div key={factor} className="factor-item">
                      <span className="factor-name">
                        {factor === 'ageImpact' ? 'Âge' : 
                         factor === 'riskImpact' ? 'Facteurs de risque' :
                         factor === 'healthcareImpact' ? 'Système de santé' : 'Vaccination'}
                      </span>
                      <span className={`factor-impact ${impact.includes('aggravant') ? 'negative' : 
                                                        impact.includes('protecteur') ? 'positive' : 'neutral'}`}>
                        {impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graphiques de prédiction */}
              <div className="charts-section">
                <h4>Visualisation des Prédictions <span className="disease-badge">{predictionParams.disease}</span></h4>
                
                {/* Graphique de mortalité par âge */}
                <div className="chart-container">
                  <ChartComponent
                    type="bar"
                    title={`Mortalité Prédite par Groupe d'Âge - ${predictionParams.disease}`}
                    height={300}
                    data={{
                      labels: ['0-19', '20-39', '40-59', '60-79', '80+'],
                      datasets: [{
                        label: 'Taux de mortalité (%)',
                        data: [
                          parseFloat(predictionResult.mortalityRate) * 0.05,
                          parseFloat(predictionResult.mortalityRate) * 0.2,
                          parseFloat(predictionResult.mortalityRate) * 0.8,
                          parseFloat(predictionResult.mortalityRate) * 2.5,
                          parseFloat(predictionResult.mortalityRate) * 6.0
                        ],
                        backgroundColor: [
                          '#27ae60',
                          '#2ecc71',
                          '#f39c12',
                          '#e67e22',
                          '#e74c3c'
                        ],
                        borderColor: '#2c3e50',
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `Mortalité: ${context.parsed.y.toFixed(2)}%`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return value.toFixed(2) + '%';
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>

                {/* Graphique de facteurs de risque */}
                <div className="chart-container">
                  <ChartComponent
                    type="doughnut"
                    title={`Impact des Facteurs de Risque - ${predictionParams.disease}`}
                    height={300}
                    data={{
                      labels: Object.keys(predictionResult.factors).map(factor => 
                        factor === 'ageImpact' ? 'Âge' : 
                        factor === 'riskImpact' ? 'Facteurs de risque' :
                        factor === 'healthcareImpact' ? 'Système de santé' : 'Vaccination'
                      ),
                      datasets: [{
                        data: [25, 30, 25, 20],
                        backgroundColor: [
                          '#e74c3c',
                          '#f39c12',
                          '#3498db',
                          '#27ae60'
                        ],
                        borderColor: '#ffffff',
                        borderWidth: 2
                      }]
                    }}
                    options={{
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `${context.label}: ${context.parsed}% d'impact`;
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analytics Section */}
        <div className="analytics-section">
          <h2 className="section-title">
            <span className="disease-badge">{predictionParams.disease}</span>
            Analyses de Mortalité - {predictionParams.disease}
          </h2>

          <div className="charts-grid">
            {/* Age Group Analysis */}
            <div className="chart-card">
              <h3 className="chart-title">
                <span className="disease-badge">{predictionParams.disease}</span>
                Mortalité par Groupe d'Âge - {predictionParams.disease}
              </h3>
              <div className="age-mortality-chart">
                {currentAgeData.map((group, index) => (
                  <div key={index} className="age-group-row">
                    <div className="age-group-info">
                      <span className="age-label">{group.ageGroup}</span>
                      <span className="age-cases">{group.cases.toLocaleString()} cas</span>
                    </div>
                    <div className="mortality-bar-container">
                      <div 
                        className="mortality-bar"
                        style={{ 
                          width: `${Math.min(100, (group.mortalityRate / (predictionParams.disease === 'COVID-19' ? 1.5 : 0.06)) * 100)}%`,
                          backgroundColor: getMortalityColor(group.mortalityRate * 100)
                        }}
                      ></div>
                      <span className="mortality-rate">{(group.mortalityRate * 100).toFixed(2)}%</span>
                    </div>
                    <div className="deaths-count">{group.deaths_per_100k} décès/100k</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors Analysis */}
            <div className="chart-card">
              <h3 className="chart-title">
                <span className="disease-badge">{predictionParams.disease}</span>
                Facteurs de Risque - {predictionParams.disease}
              </h3>
              <div className="comorbidity-chart">
                {currentRiskData.map((condition, index) => (
                  <div key={index} className="comorbidity-row">
                    <div className="condition-info">
                      <span className="condition-name">{condition.factor}</span>
                      <span className="condition-prevalence">Prévalence: {condition.prevalence}%</span>
                    </div>
                    <div className="risk-indicator">
                      <div className="risk-multiplier">
                        <span className="multiplier-value">x{condition.riskMultiplier}</span>
                        <span className="multiplier-label">Risque</span>
                      </div>
                      <div 
                        className="risk-bar"
                        style={{ 
                          width: `${(condition.riskMultiplier / 5) * 100}%`,
                          backgroundColor: getRiskColor(condition.riskMultiplier)
                        }}
                      ></div>
                    </div>
                    <div className="mortality-impact">{condition.mortality}% mortalité</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Country Comparison */}
            <div className="chart-card">
              <h3 className="chart-title">
                
                Comparaison Internationale
              </h3>
              <div className="country-comparison-chart">
                {mortalityData.byCountry.map((country, index) => (
                  <div key={index} className="country-mortality-row">
                    <div className="country-info">
                      <span className="country-name">{country.country}</span>
                      <div className="country-metrics">
                        <span className="metric">ISO: {country.iso_code}</span>
                        <span className="metric">Santé: {country.healthcare_index}</span>
                      </div>
                    </div>
                    <div className="mortality-visualization">
                      <div className="disease-mortality">
                        <div 
                          className="mortality-indicator"
                          style={{ backgroundColor: getMortalityColor(country.covid_mortality) }}
                        >
                          COVID: {country.covid_mortality}%
                        </div>
                        <div 
                          className="mortality-indicator"
                          style={{ backgroundColor: getMortalityColor(country.mpox_mortality) }}
                        >
                          MPOX: {country.mpox_mortality}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors Weight Analysis */}
            <div className="chart-card risk-factors-analysis">
              <h3 className="chart-title">
                <span className="disease-badge">{predictionParams.disease}</span>
                Poids des Facteurs de Risque - {predictionParams.disease}
              </h3>
              <div className="risk-categories">
                {Object.entries(currentFactorsAnalysis).map(([category, factors]) => (
                  <div key={category} className="risk-category">
                    <h4 className="category-title">
                      {category === 'demographics' ? 'Démographiques' :
                       category === 'medical' ? 'Médicaux' : 'Environnementaux'}
                    </h4>
                    <div className="factors-list">
                      {Object.entries(factors).map(([factor, data]) => (
                        <div key={factor} className="factor-weight-item">
                          <div className="factor-info">
                            <span className="factor-label">
                              {factor === 'age' ? 'Âge' :
                               factor === 'gender' ? 'Genre' :
                               factor === 'ethnicity' ? 'Origine ethnique' :
                               factor === 'population' ? 'Densité population' :
                               factor === 'comorbidities' ? 'Comorbidités' :
                               factor === 'immuneStatus' ? 'Statut immunitaire' :
                               factor === 'previousInfection' ? 'Infection antérieure' :
                               factor === 'skinConditions' ? 'Conditions dermatologiques' :
                               factor === 'vaccination' ? 'Vaccination' :
                               factor === 'healthcareAccess' ? 'Accès aux soins' :
                               factor === 'socioeconomic' ? 'Statut socio-économique' :
                               factor === 'airQuality' ? 'Qualité de l\'air' :
                               factor === 'contactTracing' ? 'Traçage des contacts' :
                               factor === 'socialFactors' ? 'Facteurs sociaux' : factor}
                            </span>
                            <span 
                              className="impact-badge"
                              style={{ backgroundColor: getImpactColor(data.impact) }}
                            >
                              {data.impact}
                            </span>
                          </div>
                          <div className="weight-bar-container">
                            <div 
                              className="weight-bar"
                              style={{ 
                                width: `${data.weight}%`,
                                backgroundColor: getImpactColor(data.impact)
                              }}
                            ></div>
                            <span className="weight-value">{data.weight}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MortalityPrediction; 