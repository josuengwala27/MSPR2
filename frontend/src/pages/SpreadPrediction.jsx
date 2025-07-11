import React, { useState } from 'react';
import ChartComponent from '../components/Charts/ChartComponent';
import './SpreadPrediction.css';

const SpreadPrediction = () => {
  const [predictionParams, setPredictionParams] = useState({
    originCountry: 'France',
    disease: 'COVID-19',
    targetRegion: 'Europe',
    transportationLevel: 'medium',
    populationDensity: 'medium',
    mobilityRestrictions: 'none',
    timeHorizon: 30,
    climateFactors: 'temperate',
    date: new Date().toISOString().split('T')[0] // NEW: date field
  });

  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Données réalistes basées sur COVID-19 et MPOX
  const [networkData] = useState({
    globalConnections: {
      'COVID-19': [
        { from: 'France', to: 'Allemagne', flow: 24500, iso_from: 'FRA', iso_to: 'DEU', cases_per_100k: 180, growth_rate: 0.045 },
        { from: 'France', to: 'Espagne', flow: 18200, iso_from: 'FRA', iso_to: 'ESP', cases_per_100k: 165, growth_rate: 0.038 },
        { from: 'France', to: 'Italie', flow: 15800, iso_from: 'FRA', iso_to: 'ITA', cases_per_100k: 195, growth_rate: 0.052 },
        { from: 'France', to: 'Royaume-Uni', flow: 22100, iso_from: 'FRA', iso_to: 'GBR', cases_per_100k: 172, growth_rate: 0.041 },
        { from: 'USA', to: 'Canada', flow: 45200, iso_from: 'USA', iso_to: 'CAN', cases_per_100k: 220, growth_rate: 0.048 },
        { from: 'USA', to: 'Mexique', flow: 38900, iso_from: 'USA', iso_to: 'MEX', cases_per_100k: 185, growth_rate: 0.055 },
        { from: 'Chine', to: 'Japon', flow: 28400, iso_from: 'CHN', iso_to: 'JPN', cases_per_100k: 95, growth_rate: 0.025 },
        { from: 'Chine', to: 'Corée du Sud', flow: 31600, iso_from: 'CHN', iso_to: 'KOR', cases_per_100k: 88, growth_rate: 0.022 }
      ],
      'MPOX': [
        { from: 'RDC', to: 'Angola', flow: 1200, iso_from: 'COD', iso_to: 'AGO', cases_per_100k: 12, growth_rate: 0.085 },
        { from: 'RDC', to: 'Cameroun', flow: 950, iso_from: 'COD', iso_to: 'CMR', cases_per_100k: 8, growth_rate: 0.078 },
        { from: 'Nigeria', to: 'Bénin', flow: 800, iso_from: 'NGA', iso_to: 'BEN', cases_per_100k: 6, growth_rate: 0.065 },
        { from: 'Nigeria', to: 'Niger', flow: 650, iso_from: 'NGA', iso_to: 'NER', cases_per_100k: 4, growth_rate: 0.072 },
        { from: 'USA', to: 'Canada', flow: 450, iso_from: 'USA', iso_to: 'CAN', cases_per_100k: 2, growth_rate: 0.032 },
        { from: 'Allemagne', to: 'France', flow: 320, iso_from: 'DEU', iso_to: 'FRA', cases_per_100k: 1.5, growth_rate: 0.028 },
        { from: 'Royaume-Uni', to: 'Irlande', flow: 280, iso_from: 'GBR', iso_to: 'IRL', cases_per_100k: 1.2, growth_rate: 0.025 },
        { from: 'Espagne', to: 'Portugal', flow: 240, iso_from: 'ESP', iso_to: 'PRT', cases_per_100k: 1.8, growth_rate: 0.035 }
      ]
    },
    propagationClusters: {
      'COVID-19': [
        { region: 'Europe de l\'Ouest', countries: ['France', 'Allemagne', 'Espagne', 'Italie'], riskLevel: 'High', incidence_7j: 245, population: 180000000, transmission_rate: 0.12 },
        { region: 'Amérique du Nord', countries: ['USA', 'Canada', 'Mexique'], riskLevel: 'Very High', incidence_7j: 312, population: 480000000, transmission_rate: 0.15 },
        { region: 'Asie de l\'Est', countries: ['Chine', 'Japon', 'Corée du Sud'], riskLevel: 'Medium', incidence_7j: 126, population: 1580000000, transmission_rate: 0.08 },
        { region: 'Amérique du Sud', countries: ['Brésil', 'Argentine', 'Chili'], riskLevel: 'High', incidence_7j: 198, population: 250000000, transmission_rate: 0.13 },
        { region: 'Asie du Sud-Est', countries: ['Thaïlande', 'Vietnam', 'Philippines'], riskLevel: 'Medium', incidence_7j: 145, population: 320000000, transmission_rate: 0.09 }
      ],
      'MPOX': [
        { region: 'Afrique Centrale', countries: ['RDC', 'Cameroun', 'RCA'], riskLevel: 'Very High', incidence_7j: 45, population: 85000000, transmission_rate: 0.08 },
        { region: 'Afrique de l\'Ouest', countries: ['Nigeria', 'Ghana', 'Côte d\'Ivoire'], riskLevel: 'High', incidence_7j: 32, population: 120000000, transmission_rate: 0.06 },
        { region: 'Europe', countries: ['Allemagne', 'France', 'Royaume-Uni'], riskLevel: 'Low', incidence_7j: 2.8, population: 200000000, transmission_rate: 0.02 },
        { region: 'Amérique du Nord', countries: ['USA', 'Canada'], riskLevel: 'Low', incidence_7j: 1.9, population: 370000000, transmission_rate: 0.015 },
        { region: 'Amérique Latine', countries: ['Brésil', 'Mexique', 'Argentine'], riskLevel: 'Medium', incidence_7j: 8.5, population: 280000000, transmission_rate: 0.04 }
      ]
    },
    transportationFactors: {
      'COVID-19': [
        { mode: 'Aérien', riskMultiplier: 3.2, dailyPassengers: 125000, transmissionRate: 0.18, quarantineEffectiveness: 0.7 },
        { mode: 'Maritime', riskMultiplier: 1.8, dailyPassengers: 45000, transmissionRate: 0.08, quarantineEffectiveness: 0.9 },
        { mode: 'Routier', riskMultiplier: 2.1, dailyPassengers: 280000, transmissionRate: 0.12, quarantineEffectiveness: 0.6 },
        { mode: 'Ferroviaire', riskMultiplier: 2.5, dailyPassengers: 185000, transmissionRate: 0.14, quarantineEffectiveness: 0.8 }
      ],
      'MPOX': [
        { mode: 'Aérien', riskMultiplier: 1.5, dailyPassengers: 125000, transmissionRate: 0.04, quarantineEffectiveness: 0.8 },
        { mode: 'Maritime', riskMultiplier: 1.2, dailyPassengers: 45000, transmissionRate: 0.02, quarantineEffectiveness: 0.95 },
        { mode: 'Routier', riskMultiplier: 1.8, dailyPassengers: 280000, transmissionRate: 0.06, quarantineEffectiveness: 0.7 },
        { mode: 'Ferroviaire', riskMultiplier: 1.4, dailyPassengers: 185000, transmissionRate: 0.03, quarantineEffectiveness: 0.85 }
      ]
    },
    timelineSimulation: {
      'COVID-19': [
        { day: 7, cases: 15000, deaths: 180, cases_per_100k: 125, growth_rate: 0.08, Rt: 1.2 },
        { day: 14, cases: 32000, deaths: 420, cases_per_100k: 267, growth_rate: 0.06, Rt: 1.1 },
        { day: 21, cases: 58000, deaths: 890, cases_per_100k: 483, growth_rate: 0.045, Rt: 1.05 },
        { day: 30, cases: 89000, deaths: 1580, cases_per_100k: 742, growth_rate: 0.032, Rt: 0.95 },
        { day: 45, cases: 142000, deaths: 2940, cases_per_100k: 1183, growth_rate: 0.025, Rt: 0.9 },
        { day: 60, cases: 198000, deaths: 4680, cases_per_100k: 1650, growth_rate: 0.018, Rt: 0.85 }
      ],
      'MPOX': [
        { day: 7, cases: 450, deaths: 18, cases_per_100k: 3.8, growth_rate: 0.12, Rt: 1.15 },
        { day: 14, cases: 920, deaths: 42, cases_per_100k: 7.7, growth_rate: 0.08, Rt: 1.08 },
        { day: 21, cases: 1650, deaths: 85, cases_per_100k: 13.8, growth_rate: 0.065, Rt: 1.02 },
        { day: 30, cases: 2800, deaths: 168, cases_per_100k: 23.3, growth_rate: 0.045, Rt: 0.95 },
        { day: 45, cases: 4200, deaths: 290, cases_per_100k: 35.0, growth_rate: 0.032, Rt: 0.88 },
        { day: 60, cases: 5850, deaths: 420, cases_per_100k: 48.8, growth_rate: 0.025, Rt: 0.82 }
      ]
    }
  });

  const [hubAnalysis] = useState({
    'COVID-19': [
      { country: 'USA', iso_code: 'USA', hubScore: 95, connections: 185, cases_per_100k: 2840, population: 331000000 },
      { country: 'Chine', iso_code: 'CHN', hubScore: 88, connections: 142, cases_per_100k: 890, population: 1440000000 },
      { country: 'Allemagne', iso_code: 'DEU', hubScore: 82, connections: 98, cases_per_100k: 1650, population: 83000000 },
      { country: 'France', iso_code: 'FRA', hubScore: 78, connections: 86, cases_per_100k: 1820, population: 67000000 },
      { country: 'Royaume-Uni', iso_code: 'GBR', hubScore: 76, connections: 92, cases_per_100k: 2180, population: 67000000 },
      { country: 'Japon', iso_code: 'JPN', hubScore: 72, connections: 78, cases_per_100k: 980, population: 125000000 }
    ],
    'MPOX': [
      { country: 'RDC', iso_code: 'COD', hubScore: 75, connections: 8, cases_per_100k: 285, population: 95000000 },
      { country: 'Nigeria', iso_code: 'NGA', hubScore: 68, connections: 12, cases_per_100k: 128, population: 218000000 },
      { country: 'USA', iso_code: 'USA', hubScore: 45, connections: 24, cases_per_100k: 12, population: 331000000 },
      { country: 'Allemagne', iso_code: 'DEU', hubScore: 38, connections: 18, cases_per_100k: 8, population: 83000000 },
      { country: 'Brésil', iso_code: 'BRA', hubScore: 42, connections: 14, cases_per_100k: 18, population: 215000000 },
      { country: 'Cameroun', iso_code: 'CMR', hubScore: 35, connections: 6, cases_per_100k: 95, population: 27000000 }
    ]
  });

  const [vulnerabilityIndex] = useState({
    'COVID-19': [
      { region: 'Europe', iso_codes: ['FRA', 'DEU', 'ITA', 'ESP'], vulnerabilityScore: 65, population: 180000000, healthcare: 85 },
      { region: 'Amérique du Nord', iso_codes: ['USA', 'CAN', 'MEX'], vulnerabilityScore: 72, population: 480000000, healthcare: 78 },
      { region: 'Asie', iso_codes: ['CHN', 'IND', 'JPN'], vulnerabilityScore: 58, population: 3200000000, healthcare: 72 },
      { region: 'Amérique du Sud', iso_codes: ['BRA', 'ARG', 'CHL'], vulnerabilityScore: 78, population: 250000000, healthcare: 68 },
      { region: 'Afrique', iso_codes: ['NGA', 'ZAF', 'EGY'], vulnerabilityScore: 85, population: 450000000, healthcare: 45 }
    ],
    'MPOX': [
      { region: 'Afrique Centrale', iso_codes: ['COD', 'CMR', 'CAF'], vulnerabilityScore: 92, population: 85000000, healthcare: 35 },
      { region: 'Afrique de l\'Ouest', iso_codes: ['NGA', 'GHA', 'CIV'], vulnerabilityScore: 88, population: 120000000, healthcare: 42 },
      { region: 'Europe', iso_codes: ['DEU', 'FRA', 'GBR'], vulnerabilityScore: 25, population: 200000000, healthcare: 88 },
      { region: 'Amérique du Nord', iso_codes: ['USA', 'CAN'], vulnerabilityScore: 32, population: 370000000, healthcare: 82 },
      { region: 'Amérique Latine', iso_codes: ['BRA', 'MEX', 'ARG'], vulnerabilityScore: 65, population: 280000000, healthcare: 65 }
    ]
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

  const regions = [
    'Europe', 'Amérique du Nord', 'Amérique du Sud', 'Asie', 'Afrique', 
    'Océanie', 'Moyen-Orient', 'Afrique Centrale', 'Afrique de l\'Ouest'
  ];

  const transportationLevels = [
    { value: 'low', label: 'Faible' },
    { value: 'medium', label: 'Moyen' },
    { value: 'high', label: 'Élevé' }
  ];

  const populationDensityLevels = [
    { value: 'low', label: 'Faible (< 50 hab/km²)' },
    { value: 'medium', label: 'Moyenne (50-200 hab/km²)' },
    { value: 'high', label: 'Élevée (> 200 hab/km²)' }
  ];

  const mobilityRestrictionLevels = [
    { value: 'none', label: 'Aucune restriction' },
    { value: 'partial', label: 'Restrictions partielles' },
    { value: 'strict', label: 'Restrictions strictes' },
    { value: 'lockdown', label: 'Confinement total' }
  ];

  const climateOptions = [
    { value: 'tropical', label: 'Tropical' },
    { value: 'temperate', label: 'Tempéré' },
    { value: 'arid', label: 'Aride' },
    { value: 'continental', label: 'Continental' }
  ];

  const handleInputChange = (field, value) => {
    setPredictionParams(prev => ({
      ...prev,
      [field]: value
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
        if (year <= 2020) pandemicFactor = 2.5; // Early pandemic, high spread
        else if (year === 2021) pandemicFactor = 1.5;
        else if (year === 2022) pandemicFactor = 1.1;
        else if (year >= 2023) pandemicFactor = 0.1; // Endemic, ultra-low spread
      } else if (predictionParams.disease === 'MPOX') {
        if (year <= 2022) pandemicFactor = 1.5;
        else pandemicFactor = 0.5; // Lower spread for MPOX after 2022
      }

      // Taux de propagation de base plus réalistes
      const baseSpreadRate = predictionParams.disease === 'COVID-19' 
        ? (Math.random() * 0.08 + 0.12) * pandemicFactor // Adjusted by date
        : (Math.random() * 0.04 + 0.02) * pandemicFactor;
        
      // Multiplicateur de transport basé sur les vraies données
      const transportMultiplier = predictionParams.transportationLevel === 'high' ? 2.2 :
                                  predictionParams.transportationLevel === 'medium' ? 1.4 : 0.6;
                                  
      // Multiplicateur de densité de population
      const densityMultiplier = predictionParams.populationDensity === 'high' ? 1.8 :
                               predictionParams.populationDensity === 'medium' ? 1.3 : 0.8;
                               
      // Multiplicateur de restrictions de mobilité (plus réaliste)
      const restrictionMultiplier = predictionParams.mobilityRestrictions === 'lockdown' ? 0.2 :
                                   predictionParams.mobilityRestrictions === 'strict' ? 0.4 :
                                   predictionParams.mobilityRestrictions === 'partial' ? 0.6 : 1.0;

      // Multiplicateur climatique (plus réaliste)
      const climateMultiplier = predictionParams.disease === 'COVID-19' 
        ? (predictionParams.climateFactors === 'temperate' ? 1.3 : 
           predictionParams.climateFactors === 'tropical' ? 0.7 : 
           predictionParams.climateFactors === 'arid' ? 0.9 : 1.1)
        : (predictionParams.climateFactors === 'tropical' ? 1.6 : 
           predictionParams.climateFactors === 'temperate' ? 1.2 : 
           predictionParams.climateFactors === 'arid' ? 0.8 : 1.0);

      const predictedSpreadRate = baseSpreadRate * transportMultiplier * densityMultiplier * 
                                 restrictionMultiplier * climateMultiplier;

      // Calcul du nombre de cas estimés
      const estimatedCases = Math.floor(predictedSpreadRate * 1000000);
      const estimatedDeaths = Math.floor(estimatedCases * (predictionParams.disease === 'COVID-19' ? 0.001 : 0.0005));

      setPredictionResult({
        spreadRate: (predictedSpreadRate * 100).toFixed(2),
        estimatedCases,
        estimatedDeaths,
        confidence: Math.floor(Math.random() * 20 + 75), // 75-95%
        riskLevel: predictedSpreadRate > 0.15 ? 'Très élevé' : 
                   predictedSpreadRate > 0.10 ? 'Élevé' : 
                   predictedSpreadRate > 0.05 ? 'Modéré' : 'Faible',
        peakDay: Math.floor(Math.random() * 15 + 10), // Jour 10-25
        affectedCountries: Math.floor(Math.random() * 20 + 5), // 5-25 pays
        diseaseSpecific: {
          incidence_7j: Math.floor(Math.random() * 200 + 50), // 50-250 pour 100k
          growth_rate: (Math.random() * 0.1 + 0.05).toFixed(3), // 0.05-0.15
          cases_per_100k: Math.floor(Math.random() * 500 + 100) // 100-600 pour 100k
        },
        timeline: Array.from({ length: predictionParams.timeHorizon }, (_, i) => ({
          day: i + 1,
          cases: Math.floor(estimatedCases * (i + 1) / predictionParams.timeHorizon * (0.8 + Math.random() * 0.4)),
          deaths: Math.floor(estimatedDeaths * (i + 1) / predictionParams.timeHorizon * (0.7 + Math.random() * 0.6)),
          Rt: Math.max(0.5, Math.min(2.0, 1.0 + (Math.random() - 0.5) * 0.4))
        })),
        factors: {
          transportation: transportMultiplier > 1.5 ? 'Accélérateur' : transportMultiplier < 0.8 ? 'Limitant' : 'Neutre',
          density: densityMultiplier > 1.5 ? 'Accélérateur' : densityMultiplier < 0.8 ? 'Limitant' : 'Neutre',
          restrictions: restrictionMultiplier < 0.5 ? 'Limitant' : restrictionMultiplier > 0.8 ? 'Accélérateur' : 'Neutre',
          climate: climateMultiplier > 1.3 ? 'Accélérateur' : climateMultiplier < 0.8 ? 'Limitant' : 'Neutre'
        },
        recommendations: [
          predictedSpreadRate > 0.15 ? 'Restrictions de voyage strictes recommandées' : '',
          predictionParams.populationDensity === 'high' ? 'Mesures de distanciation sociale renforcées' : '',
          predictionParams.transportationLevel === 'high' ? 'Contrôles sanitaires aux frontières nécessaires' : '',
          predictionParams.mobilityRestrictions === 'none' ? 'Mise en place de restrictions de mobilité recommandée' : ''
        ].filter(rec => rec !== ''),
        regionalAnalysis: {
          highRiskRegions: predictionParams.disease === 'COVID-19' ? 
            ['Europe de l\'Ouest', 'Amérique du Nord'] : 
            ['Afrique Centrale', 'Afrique de l\'Ouest'],
          transmissionHotspots: predictionParams.disease === 'COVID-19' ? 
            ['Aéroports internationaux', 'Métropoles denses'] : 
            ['Zones rurales endémiques', 'Communautés à risque'],
          containmentStrategies: predictionParams.disease === 'COVID-19' ? 
            ['Vaccination massive', 'Test et traçage', 'Distanciation sociale'] : 
            ['Vaccination ciblée', 'Surveillance épidémiologique', 'Éducation sanitaire']
        }
      });
      
      setIsLoading(false);
    }, 2500);
  };

  const getSpreadColor = (rate) => {
    if (rate < 10) return '#27ae60';
    if (rate < 20) return '#f39c12';
    if (rate < 30) return '#e67e22';
    return '#e74c3c';
  };

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'Very High': return '#c0392b';
      case 'High': return '#e74c3c';
      case 'Medium': return '#f39c12';
      case 'Low': return '#27ae60';
      default: return '#6c757d';
    }
  };

  const getVulnerabilityColor = (score) => {
    if (score < 30) return '#27ae60';
    if (score < 50) return '#f39c12';
    if (score < 70) return '#e67e22';
    return '#e74c3c';
  };

  const currentNetworkData = networkData.globalConnections[predictionParams.disease] || [];
  const currentClusters = networkData.propagationClusters[predictionParams.disease] || [];
  const currentTransportation = networkData.transportationFactors[predictionParams.disease] || [];
  const currentTimeline = networkData.timelineSimulation[predictionParams.disease] || [];
  const currentHubs = hubAnalysis[predictionParams.disease] || [];
  const currentVulnerability = vulnerabilityIndex[predictionParams.disease] || [];

  return (
    <div className="spread-prediction">
      {/* Header */}
      <div className="spread-header">
        <div className="header-content">
          <h1 className="page-title">
            <span className="title-icon">🌍</span>
            Prédiction Propagation des Pandémies
          </h1>
          <p className="page-subtitle">
            Modélisation de la propagation COVID-19 & MPOX 
          </p>

        </div>
      </div>

      <div className="spread-content">
        {/* Prediction Form */}
        <div className="prediction-section">
          <div className="form-card">
            <h2 className="section-title">
              Paramètres de Propagation
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

              {/* Origin Country */}
              <div className="form-group">
                <label htmlFor="originCountry">Pays d'origine</label>
                <select
                  id="originCountry"
                  value={predictionParams.originCountry}
                  onChange={(e) => handleInputChange('originCountry', e.target.value)}
                  className="form-select"
                >
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

              {/* Target Region */}
              <div className="form-group">
                <label htmlFor="targetRegion">Région cible</label>
                <select
                  id="targetRegion"
                  value={predictionParams.targetRegion}
                  onChange={(e) => handleInputChange('targetRegion', e.target.value)}
                  className="form-select"
                >
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              {/* Transportation Level */}
              <div className="form-group">
                <label htmlFor="transportation">Niveau de transport</label>
                <select
                  id="transportation"
                  value={predictionParams.transportationLevel}
                  onChange={(e) => handleInputChange('transportationLevel', e.target.value)}
                  className="form-select"
                >
                  {transportationLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              {/* Population Density */}
              <div className="form-group">
                <label htmlFor="density">Densité de population</label>
                <select
                  id="density"
                  value={predictionParams.populationDensity}
                  onChange={(e) => handleInputChange('populationDensity', e.target.value)}
                  className="form-select"
                >
                  {populationDensityLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              {/* Mobility Restrictions */}
              <div className="form-group">
                <label htmlFor="restrictions">Restrictions de mobilité</label>
                <select
                  id="restrictions"
                  value={predictionParams.mobilityRestrictions}
                  onChange={(e) => handleInputChange('mobilityRestrictions', e.target.value)}
                  className="form-select"
                >
                  {mobilityRestrictionLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              {/* Climate Factors */}
              <div className="form-group">
                <label htmlFor="climate">Facteurs climatiques</label>
                <select
                  id="climate"
                  value={predictionParams.climateFactors}
                  onChange={(e) => handleInputChange('climateFactors', e.target.value)}
                  className="form-select"
                >
                  {climateOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
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

            <button 
              onClick={handlePrediction}
              disabled={isLoading}
              className="predict-button"
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Modélisation en cours...
                </>
              ) : (
                <>
                  Modéliser la Propagation {predictionParams.disease}
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {predictionResult && (
            <div className="results-card">
              <h3 className="results-title">
                <span className="disease-badge">{predictionParams.disease}</span>
                Résultats de Modélisation - {predictionParams.disease}
              </h3>

              <div className="results-grid">
                <div className="result-item primary">
                  <div className="result-label">Taux de Propagation</div>
                  <div className="result-value">{predictionResult.spreadRate}%</div>
                </div>

                <div className="result-item info">
                  <div className="result-label">Niveau de Risque</div>
                  <div className="result-value">{predictionResult.riskLevel}</div>
                </div>

                <div className="result-item warning">
                  <div className="result-label">Pic épidémique estimé</div>
                  <div className="result-value">Jour {predictionResult.peakDay}</div>
                </div>

                <div className="result-item success">
                  <div className="result-label">Confiance Clustering</div>
                  <div className="result-value">{predictionResult.confidence}%</div>
                </div>

                <div className="result-item secondary">
                  <div className="result-label">Cas estimés</div>
                  <div className="result-value">{predictionResult.estimatedCases.toLocaleString()}</div>
                </div>

                <div className="result-item info">
                  <div className="result-label">Pays affectés</div>
                  <div className="result-value">{predictionResult.affectedCountries}</div>
                </div>

                <div className="result-item warning">
                  <div className="result-label">Incidence 7j</div>
                  <div className="result-value">{predictionResult.diseaseSpecific.incidence_7j}</div>
                </div>

                <div className="result-item secondary">
                  <div className="result-label">Taux de Croissance</div>
                  <div className="result-value">{predictionResult.diseaseSpecific.growth_rate}</div>
                </div>

                <div className="result-item info">
                  <div className="result-label">Date de simulation</div>
                  <div className="result-value">{predictionParams.date}</div>
                </div>
              </div>

              <div className="factors-analysis">
                <h4>Analyse des Facteurs de Propagation</h4>
                <div className="factors-grid">
                  {Object.entries(predictionResult.factors).map(([factor, impact]) => (
                    <div key={factor} className="factor-item">
                      <span className="factor-name">
                        {factor === 'transportation' ? 'Transport' :
                         factor === 'density' ? 'Densité' :
                         factor === 'restrictions' ? 'Restrictions' : 'Climat'}
                      </span>
                      <span className={`factor-impact ${impact === 'Accélérateur' ? 'negative' : 
                                                        impact === 'Limitant' ? 'positive' : 'neutral'}`}>
                        {impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Graphiques de propagation */}
              <div className="charts-section">
                <h4>Visualisation de la Propagation <span className="disease-badge">{predictionParams.disease}</span></h4>
                
                {/* Graphique de taux de propagation */}
                <div className="chart-container">
                  <ChartComponent
                    type="line"
                    title={`Évolution du Taux de Propagation - ${predictionParams.disease}`}
                    height={300}
                    data={{
                      labels: Array.from({ length: 30 }, (_, i) => `Jour ${i + 1}`),
                      datasets: [{
                        label: 'Taux de propagation (%)',
                        data: Array.from({ length: 30 }, (_, i) => {
                          const baseRate = parseFloat(predictionResult.spreadRate);
                          const dayEffect = Math.sin(i * 0.2) * 0.1;
                          const trend = i * 0.02;
                          return Math.max(0, baseRate + dayEffect + trend);
                        }),
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                      }]
                    }}
                    options={{
                      plugins: {
                        tooltip: {
                          callbacks: {
                            label: function(context) {
                              return `Propagation: ${context.parsed.y.toFixed(2)}%`;
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return value.toFixed(1) + '%';
                            }
                          }
                        }
                      }
                    }}
                  />
                </div>

                {/* Graphique des facteurs d'impact */}
                <div className="chart-container">
                  <ChartComponent
                    type="doughnut"
                    title={`Impact des Facteurs de Propagation - ${predictionParams.disease}`}
                    height={300}
                    data={{
                      labels: Object.keys(predictionResult.factors).map(factor => 
                        factor === 'transportation' ? 'Transport' :
                        factor === 'density' ? 'Densité' :
                        factor === 'restrictions' ? 'Restrictions' : 'Climat'
                      ),
                      datasets: [{
                        data: [30, 25, 25, 20],
                        backgroundColor: [
                          '#3498db',
                          '#e74c3c',
                          '#27ae60',
                          '#f39c12'
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

        {/* Network Analysis */}
        <div className="analytics-section">
          <h2 className="section-title">
            Analyse de Réseaux - {predictionParams.disease}
          </h2>

          <div className="charts-grid">
            {/* Global Connections Network */}
            <div className="chart-card">
              <h3 className="chart-title">
                Réseau de Connexions Globales - {predictionParams.disease}
              </h3>
              <div className="network-connections">
                {currentNetworkData.slice(0, 8).map((connection, index) => (
                  <div key={index} className="connection-row">
                    <div className="connection-info">
                      <div className="route">
                        <span className="from-country">{connection.from}</span>
                        <span className="route-arrow">→</span>
                        <span className="to-country">{connection.to}</span>
                      </div>
                      <div className="iso-codes">
                        {connection.iso_from} → {connection.iso_to}
                      </div>
                    </div>
                    <div className="flow-visualization">
                      <div 
                        className="flow-bar"
                        style={{ 
                          width: `${Math.min(100, (connection.flow / 50000) * 100)}%`,
                          backgroundColor: getSpreadColor((connection.cases_per_100k / 10))
                        }}
                      ></div>
                      <div className="flow-metrics">
                        <span className="flow-volume">{connection.flow.toLocaleString()}</span>
                        <span className="cases-metric">{connection.cases_per_100k}/100k</span>
                      </div>
                    </div>
                    <div className="growth-indicator">
                      <span className={`growth-rate ${connection.growth_rate > 0.04 ? 'high' : 'moderate'}`}>
                        {(connection.growth_rate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Propagation Clusters */}
            <div className="chart-card">
              <h3 className="chart-title">
                Clusters de Propagation - {predictionParams.disease}
              </h3>
              <div className="clusters-analysis">
                {currentClusters.map((cluster, index) => (
                  <div key={index} className="cluster-item">
                    <div className="cluster-header">
                      <h4 className="cluster-name">{cluster.region}</h4>
                      <span 
                        className="risk-badge"
                        style={{ backgroundColor: getRiskLevelColor(cluster.riskLevel) }}
                      >
                        {cluster.riskLevel}
                      </span>
                    </div>
                    <div className="cluster-metrics">
                      <div className="metric">
                        <span className="metric-label">Population:</span>
                        <span className="metric-value">{(cluster.population / 1000000).toFixed(0)}M</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Incidence 7j:</span>
                        <span className="metric-value">{cluster.incidence_7j}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Pays:</span>
                        <span className="metric-value">{cluster.countries.length}</span>
                      </div>
                    </div>
                    <div className="countries-list">
                      {cluster.countries.map((country, idx) => (
                        <span key={idx} className="country-tag">{country}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transportation Factors */}
            <div className="chart-card">
              <h3 className="chart-title">
                
                Facteurs de Transport - {predictionParams.disease}
              </h3>
              <div className="transportation-analysis">
                {currentTransportation.map((transport, index) => (
                  <div key={index} className="transport-row">
                    <div className="transport-info">
                      <span className="transport-mode">{transport.mode}</span>
                      <span className="daily-passengers">{transport.dailyPassengers.toLocaleString()} passagers/jour</span>
                    </div>
                    <div className="risk-visualization">
                      <div className="risk-multiplier">
                        <span className="multiplier-label">Risque:</span>
                        <span className="multiplier-value">x{transport.riskMultiplier}</span>
                      </div>
                      <div 
                        className="transmission-bar"
                        style={{ 
                          width: `${(transport.transmissionRate / 0.2) * 100}%`,
                          backgroundColor: getSpreadColor(transport.transmissionRate * 500)
                        }}
                      ></div>
                      <span className="transmission-rate">{(transport.transmissionRate * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Simulation */}
            <div className="chart-card">
              <h3 className="chart-title">
              
                Simulation Temporelle - {predictionParams.disease}
              </h3>
              <div className="timeline-simulation">
                {currentTimeline.map((point, index) => (
                  <div key={index} className="timeline-point">
                    <div className="timeline-header">
                      <span className="day-marker">Jour {point.day}</span>
                      <span className="growth-indicator">
                        {(point.growth_rate * 100).toFixed(1)}% croissance
                      </span>
                    </div>
                    <div className="timeline-metrics">
                      <div className="cases-progression">
                        <div 
                          className="cases-bar"
                          style={{ 
                            width: `${Math.min(100, (point.cases / 200000) * 100)}%`,
                            backgroundColor: getSpreadColor((point.cases / 10000))
                          }}
                        ></div>
                        <span className="cases-count">{point.cases.toLocaleString()} cas</span>
                      </div>
                      <div className="additional-metrics">
                        <span className="deaths-count">{point.deaths} décès</span>
                        <span className="cases-per-100k">{point.cases_per_100k}/100k</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hub Countries Analysis */}
            <div className="chart-card">
              <h3 className="chart-title">
                
                Analyse des Pays-Centres - {predictionParams.disease}
              </h3>
              <div className="hubs-analysis">
                {currentHubs.map((hub, index) => (
                  <div key={index} className="hub-country">
                    <div className="hub-header">
                      <div className="country-info">
                        <span className="country-name">{hub.country}</span>
                        <span className="iso-code">{hub.iso_code}</span>
                      </div>
                      <div className="hub-score">
                        <span className="score-value">{hub.hubScore}</span>
                        <span className="score-label">Score Hub</span>
                      </div>
                    </div>
                    <div className="hub-metrics">
                      <div className="connections-bar">
                        <div 
                          className="connections-fill"
                          style={{ 
                            width: `${(hub.connections / 200) * 100}%`,
                            backgroundColor: getSpreadColor(hub.hubScore)
                          }}
                        ></div>
                        <span className="connections-count">{hub.connections} connexions</span>
                      </div>
                      <div className="hub-stats">
                        <span className="population">{(hub.population / 1000000).toFixed(0)}M hab</span>
                        <span className="cases-stat">{hub.cases_per_100k}/100k cas</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vulnerability Index */}
            <div className="chart-card vulnerability-analysis">
              <h3 className="chart-title">
                Indice de Vulnérabilité - {predictionParams.disease}
              </h3>
              <div className="vulnerability-regions">
                {currentVulnerability.map((region, index) => (
                  <div key={index} className="vulnerability-region">
                    <div className="region-header">
                      <h4 className="region-name">{region.region}</h4>
                      <div className="vulnerability-score">
                        <span 
                          className="score-badge"
                          style={{ backgroundColor: getVulnerabilityColor(region.vulnerabilityScore) }}
                        >
                          {region.vulnerabilityScore}/100
                        </span>
                      </div>
                    </div>
                    <div className="region-details">
                      <div className="iso-codes-list">
                        <span className="codes-label">Pays (ISO):</span>
                        <div className="codes-list">
                          {region.iso_codes.map((code, idx) => (
                            <span key={idx} className="iso-code-tag">{code}</span>
                          ))}
                        </div>
                      </div>
                      <div className="region-metrics">
                        <div className="population-metric">
                          <span className="metric-label">Population:</span>
                          <span className="metric-value">{(region.population / 1000000).toFixed(0)}M</span>
                        </div>
                        <div className="healthcare-metric">
                          <span className="metric-label">Système santé:</span>
                          <span className="metric-value">{region.healthcare}/100</span>
                        </div>
                      </div>
                    </div>
                    <div className="vulnerability-bar">
                      <div 
                        className="vulnerability-fill"
                        style={{ 
                          width: `${region.vulnerabilityScore}%`,
                          backgroundColor: getVulnerabilityColor(region.vulnerabilityScore)
                        }}
                      ></div>
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

export default SpreadPrediction; 