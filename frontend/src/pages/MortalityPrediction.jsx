import React, { useState } from 'react';
import './MortalityPrediction.css';

const MortalityPrediction = () => {
  const [predictionParams, setPredictionParams] = useState({
    country: 'France',
    disease: 'COVID-19',
    ageGroup: 'all',
    riskFactors: [],
    healthcareCapacity: 'medium',
    vaccinationRate: 70,
    timeHorizon: 30
  });

  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [mortalityData] = useState({
    byAgeGroup: {
      'COVID-19': [
        { ageGroup: '0-9', mortalityRate: 0.001, cases: 45000, deaths: 45, deaths_per_100k: 0.1 },
        { ageGroup: '10-19', mortalityRate: 0.002, cases: 52000, deaths: 104, deaths_per_100k: 0.2 },
        { ageGroup: '20-29', mortalityRate: 0.005, cases: 78000, deaths: 390, deaths_per_100k: 0.5 },
        { ageGroup: '30-39', mortalityRate: 0.02, cases: 89000, deaths: 1780, deaths_per_100k: 2.0 },
        { ageGroup: '40-49', mortalityRate: 0.04, cases: 95000, deaths: 3800, deaths_per_100k: 4.0 },
        { ageGroup: '50-59', mortalityRate: 0.13, cases: 82000, deaths: 10660, deaths_per_100k: 13.0 },
        { ageGroup: '60-69', mortalityRate: 0.36, cases: 67000, deaths: 24120, deaths_per_100k: 36.0 },
        { ageGroup: '70-79', mortalityRate: 0.8, cases: 45000, deaths: 36000, deaths_per_100k: 80.0 },
        { ageGroup: '80+', mortalityRate: 1.48, cases: 32000, deaths: 47360, deaths_per_100k: 148.0 }
      ],
      'MPOX': [
        { ageGroup: '0-9', mortalityRate: 0.8, cases: 1200, deaths: 96, deaths_per_100k: 8.0 },
        { ageGroup: '10-19', mortalityRate: 0.5, cases: 2800, deaths: 140, deaths_per_100k: 5.0 },
        { ageGroup: '20-29', mortalityRate: 0.3, cases: 15600, deaths: 468, deaths_per_100k: 3.0 },
        { ageGroup: '30-39', mortalityRate: 0.4, cases: 12400, deaths: 496, deaths_per_100k: 4.0 },
        { ageGroup: '40-49', mortalityRate: 0.6, cases: 8900, deaths: 534, deaths_per_100k: 6.0 },
        { ageGroup: '50-59', mortalityRate: 1.2, cases: 5200, deaths: 624, deaths_per_100k: 12.0 },
        { ageGroup: '60-69', mortalityRate: 2.1, cases: 3100, deaths: 651, deaths_per_100k: 21.0 },
        { ageGroup: '70-79', mortalityRate: 3.5, cases: 1800, deaths: 630, deaths_per_100k: 35.0 },
        { ageGroup: '80+', mortalityRate: 5.2, cases: 900, deaths: 468, deaths_per_100k: 52.0 }
      ]
    },
    byRiskFactor: {
      'COVID-19': [
        { factor: 'Maladies cardiovasculaires', riskMultiplier: 2.8, prevalence: 8.9, mortality: 6.1 },
        { factor: 'Diabète', riskMultiplier: 2.3, prevalence: 15.2, mortality: 4.8 },
        { factor: 'Maladies respiratoires chroniques', riskMultiplier: 2.2, prevalence: 7.5, mortality: 4.1 },
        { factor: 'Hypertension', riskMultiplier: 1.8, prevalence: 28.7, mortality: 3.2 },
        { factor: 'Immunodéficience', riskMultiplier: 3.1, prevalence: 2.1, mortality: 7.2 },
        { factor: 'Maladie rénale chronique', riskMultiplier: 2.5, prevalence: 4.2, mortality: 5.8 }
      ],
      'MPOX': [
        { factor: 'Immunodéficience/VIH', riskMultiplier: 4.2, prevalence: 1.8, mortality: 12.1 },
        { factor: 'Eczéma atopique', riskMultiplier: 2.1, prevalence: 8.4, mortality: 3.8 },
        { factor: 'Grossesse', riskMultiplier: 3.5, prevalence: 1.2, mortality: 8.5 },
        { factor: 'Âge < 8 ans', riskMultiplier: 2.8, prevalence: 12.1, mortality: 6.2 },
        { factor: 'Malnutrition sévère', riskMultiplier: 2.4, prevalence: 0.8, mortality: 4.9 },
        { factor: 'Maladies dermatologiques', riskMultiplier: 1.9, prevalence: 3.2, mortality: 2.7 }
      ]
    },
    byCountry: [
      { country: 'France', iso_code: 'FRA', covid_mortality: 2.1, mpox_mortality: 0.8, healthcare_index: 85, vaccination_rate: 78 },
      { country: 'Allemagne', iso_code: 'DEU', covid_mortality: 1.9, mpox_mortality: 0.6, healthcare_index: 88, vaccination_rate: 76 },
      { country: 'Italie', iso_code: 'ITA', covid_mortality: 2.8, mpox_mortality: 1.1, healthcare_index: 79, vaccination_rate: 73 },
      { country: 'Espagne', iso_code: 'ESP', covid_mortality: 2.3, mpox_mortality: 0.9, healthcare_index: 82, vaccination_rate: 81 },
      { country: 'Royaume-Uni', iso_code: 'GBR', covid_mortality: 2.5, mpox_mortality: 0.7, healthcare_index: 84, vaccination_rate: 75 },
      { country: 'USA', iso_code: 'USA', covid_mortality: 3.1, mpox_mortality: 1.4, healthcare_index: 72, vaccination_rate: 68 },
      { country: 'Brésil', iso_code: 'BRA', covid_mortality: 4.2, mpox_mortality: 2.1, healthcare_index: 65, vaccination_rate: 62 },
      { country: 'Inde', iso_code: 'IND', covid_mortality: 1.8, mpox_mortality: 1.8, healthcare_index: 58, vaccination_rate: 71 }
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
    'France', 'Allemagne', 'Italie', 'Espagne', 'Royaume-Uni', 
    'USA', 'Brésil', 'Inde', 'Chine', 'Japon'
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
      const baseRate = predictionParams.disease === 'COVID-19' 
        ? Math.random() * 2 + 1 // 1-3% pour COVID
        : Math.random() * 1.5 + 0.5; // 0.5-2% pour MPOX
        
      const ageMultiplier = predictionParams.ageGroup === '80+' ? 3 : 
                           predictionParams.ageGroup === '60-79' ? 2 : 
                           predictionParams.ageGroup === '40-59' ? 1.5 : 1;
                           
      const riskMultiplier = 1 + (predictionParams.riskFactors.length * 0.4);
      const healthcareMultiplier = predictionParams.healthcareCapacity === 'low' ? 1.5 :
                                   predictionParams.healthcareCapacity === 'medium' ? 1 : 0.7;
      const vaccinationMultiplier = predictionParams.disease === 'COVID-19' 
        ? 1 - (predictionParams.vaccinationRate / 200)
        : 1 - (predictionParams.vaccinationRate / 300); // MPOX vaccination moins répandue

      const predictedRate = baseRate * ageMultiplier * riskMultiplier * 
                           healthcareMultiplier * vaccinationMultiplier;

      setPredictionResult({
        mortalityRate: Math.max(0.1, predictedRate).toFixed(2),
        confidence: Math.floor(Math.random() * 20 + 75), // 75-95%
        riskLevel: predictedRate > 3 ? 'Élevé' : predictedRate > 2 ? 'Modéré' : 'Faible',
        estimatedDeaths: Math.floor(predictedRate * 10000),
        diseaseSpecific: {
          incidence_7j: Math.floor(Math.random() * 50 + 10),
          cases_per_100k: Math.floor(Math.random() * 200 + 50),
          growth_rate: (Math.random() * 0.4 - 0.2).toFixed(3)
        },
        factors: {
          age: ageMultiplier > 1 ? 'Facteur aggravant' : 'Facteur neutre',
          riskFactors: predictionParams.riskFactors.length > 0 ? 'Facteur aggravant' : 'Aucun',
          healthcare: predictionParams.healthcareCapacity === 'high' ? 'Facteur protecteur' : 
                     predictionParams.healthcareCapacity === 'low' ? 'Facteur aggravant' : 'Neutre',
          vaccination: predictionParams.vaccinationRate > 70 ? 'Facteur protecteur' : 'Facteur aggravant'
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
              </div>

              <div className="factors-analysis">
                <h4>Analyse des Facteurs</h4>
                <div className="factors-grid">
                  {Object.entries(predictionResult.factors).map(([factor, impact]) => (
                    <div key={factor} className="factor-item">
                      <span className="factor-name">
                        {factor === 'age' ? 'Âge' : 
                         factor === 'riskFactors' ? 'Facteurs de risque' :
                         factor === 'healthcare' ? 'Système de santé' : 'Vaccination'}
                      </span>
                      <span className={`factor-impact ${impact.includes('aggravant') ? 'negative' : 
                                                        impact.includes('protecteur') ? 'positive' : 'neutral'}`}>
                        {impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Analytics Section */}
        <div className="analytics-section">
          <h2 className="section-title">
            
            Analyses de Mortalité - {predictionParams.disease}
          </h2>

          <div className="charts-grid">
            {/* Age Group Analysis */}
            <div className="chart-card">
              <h3 className="chart-title">
                
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