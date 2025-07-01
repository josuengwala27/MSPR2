// Services API pour l'application MSPR2024
// Architecture : Frontend React ↔ API IA Python ↔ API Express.js

// Configuration des APIs
const EXPRESS_API_BASE = process.env.REACT_APP_EXPRESS_API_URL || 'http://localhost:3000/api';
const IA_API_BASE = process.env.REACT_APP_IA_API_URL || 'http://localhost:8000/api/ia';

// ==============================================================================
// API EXPRESS.JS (Données historiques) - EXISTANTE + EXTENSIONS FUTURES
// ==============================================================================

export const expressAPI = {
  // Routes existantes
  async getPays() {
    const response = await fetch(`${EXPRESS_API_BASE}/pays`);
    return response.json();
  },

  async getIndicateurs() {
    const response = await fetch(`${EXPRESS_API_BASE}/indicateurs`);
    return response.json();
  },

  async getDonneesHistoriques(params = {}) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${EXPRESS_API_BASE}/donnees-historiques?${query}`);
    return response.json();
  },

  // Routes futures pour support IA (à implémenter dans l'API Express.js)
  async getAggregation(params) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${EXPRESS_API_BASE}/donnees-historiques/aggregation?${query}`);
    return response.json();
  },

  async getMLReadyData(params) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${EXPRESS_API_BASE}/donnees-historiques/ml-ready?${query}`);
    return response.json();
  },

  async getStats(params) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${EXPRESS_API_BASE}/donnees-historiques/stats?${query}`);
    return response.json();
  },

  async getRt(params) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${EXPRESS_API_BASE}/donnees-historiques/rt?${query}`);
    return response.json();
  },

  async getMortalityRate(params) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${EXPRESS_API_BASE}/donnees-historiques/mortality-rate?${query}`);
    return response.json();
  },

  async getGeographicSpread(params) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${EXPRESS_API_BASE}/donnees-historiques/geographic-spread?${query}`);
    return response.json();
  }
};

// ==============================================================================
// API IA PYTHON (Prédictions ML) - À CRÉER
// ==============================================================================

export const iaAPI = {
  // Prédiction Rt (taux de transmission) - Modèle LSTM
  async predictRt(params) {
    const response = await fetch(`${IA_API_BASE}/predict/rt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pays: params.country,
        maladie: params.disease, // 'COVID-19' ou 'MPOX'
        horizon_jours: params.timeHorizon || 30,
        date_debut: params.startDate || new Date().toISOString().split('T')[0],
        facteurs_additionnels: {
          vaccination_rate: params.vaccinationRate,
          restrictions: params.restrictions,
          population_density: params.populationDensity
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur API IA: ${response.status}`);
    }

    return response.json();
  },

  // Prédiction taux de mortalité - Modèle Random Forest
  async predictMortality(params) {
    const response = await fetch(`${IA_API_BASE}/predict/mortality`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pays: params.country,
        maladie: params.disease, // 'COVID-19' ou 'MPOX'
        horizon_jours: params.timeHorizon || 30,
        date_debut: params.startDate || new Date().toISOString().split('T')[0],
        facteurs_risque: {
          age_group: params.ageGroup,
          comorbidities: params.riskFactors || [],
          healthcare_capacity: params.healthcareCapacity,
          vaccination_rate: params.vaccinationRate
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur API IA: ${response.status}`);
    }

    return response.json();
  },

  // Prédiction propagation géographique - Modèle Clustering + Time Series
  async predictSpread(params) {
    const response = await fetch(`${IA_API_BASE}/predict/spread`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pays_origine: params.originCountry,
        maladie: params.disease, // 'COVID-19' ou 'MPOX'
        region_cible: params.targetRegion,
        horizon_jours: params.timeHorizon || 30,
        date_debut: params.startDate || new Date().toISOString().split('T')[0],
        facteurs_propagation: {
          transportation_level: params.transportationLevel,
          population_density: params.populationDensity,
          mobility_restrictions: params.mobilityRestrictions,
          climate_factors: params.climateFactors
        },
        nombre_pays_max: params.maxCountries || 10
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur API IA: ${response.status}`);
    }

    return response.json();
  },

  // Métriques de performance des modèles
  async getModelPerformance() {
    const response = await fetch(`${IA_API_BASE}/models/performance`);
    
    if (!response.ok) {
      throw new Error(`Erreur API IA: ${response.status}`);
    }

    return response.json();
  },

  // Statut de santé de l'API IA
  async getHealthStatus() {
    const response = await fetch(`${IA_API_BASE}/health`);
    
    if (!response.ok) {
      throw new Error(`Erreur API IA: ${response.status}`);
    }

    return response.json();
  }
};

// ==============================================================================
// SERVICES UTILITAIRES
// ==============================================================================

export const apiUtils = {
  // Mode simulation pour développement (quand API IA pas encore créée)
  isSimulationMode: () => {
    return process.env.REACT_APP_SIMULATION_MODE === 'true' || !process.env.REACT_APP_IA_API_URL;
  },

  // Fallback vers données simulées quand API IA indisponible
  async callWithFallback(apiCall, fallbackData) {
    try {
      if (this.isSimulationMode()) {
        console.warn('Mode simulation activé - utilisation des données factices');
        return fallbackData;
      }
      return await apiCall();
    } catch (error) {
      console.error('Erreur API, basculement vers simulation:', error);
      return fallbackData;
    }
  },

  // Validation des paramètres de prédiction
  validatePredictionParams(params, type) {
    const errors = [];

    if (!params.country) {
      errors.push('Pays requis');
    }

    if (!params.disease || !['COVID-19', 'MPOX'].includes(params.disease)) {
      errors.push('Maladie doit être COVID-19 ou MPOX');
    }

    if (params.timeHorizon && (params.timeHorizon < 7 || params.timeHorizon > 90)) {
      errors.push('Horizon temporel doit être entre 7 et 90 jours');
    }

    // Validations spécifiques par type de prédiction
    if (type === 'mortality') {
      if (params.riskFactors && !Array.isArray(params.riskFactors)) {
        errors.push('Facteurs de risque doivent être un tableau');
      }
    }

    if (type === 'spread') {
      if (!params.originCountry) {
        errors.push('Pays d\'origine requis pour la propagation');
      }
      if (!params.targetRegion) {
        errors.push('Région cible requise pour la propagation');
      }
    }

    return errors;
  },

  // Formatage des données pour les graphiques
  formatForCharts(data, chartType) {
    switch (chartType) {
      case 'timeSeries':
        return {
          labels: data.timeline?.map(point => point.date) || [],
          datasets: [{
            label: data.indicator || 'Prédiction',
            data: data.timeline?.map(point => point.value) || [],
            borderColor: data.color || '#3498db',
            backgroundColor: data.color || '#3498db',
            fill: false
          }]
        };

      case 'geographic':
        return data.countries?.map(country => ({
          id: country.iso_code,
          value: country.risk_score,
          name: country.name
        })) || [];

      case 'risk':
        return {
          labels: data.riskFactors?.map(factor => factor.name) || [],
          datasets: [{
            data: data.riskFactors?.map(factor => factor.weight) || [],
            backgroundColor: data.riskFactors?.map(factor => factor.color) || []
          }]
        };

      default:
        return data;
    }
  }
};

// ==============================================================================
// HOOKS PERSONNALISÉS POUR LES COMPOSANTS REACT
// ==============================================================================

export const useAPI = () => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const callAPI = async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { loading, error, callAPI };
};

// Configuration pour différents environnements
export const config = {
  development: {
    EXPRESS_API_BASE: 'http://localhost:3000/api',
    IA_API_BASE: 'http://localhost:8000/api/ia',
    SIMULATION_MODE: true
  },
  production: {
    EXPRESS_API_BASE: process.env.REACT_APP_EXPRESS_API_URL,
    IA_API_BASE: process.env.REACT_APP_IA_API_URL,
    SIMULATION_MODE: false
  }
};

export default { expressAPI, iaAPI, apiUtils, useAPI, config }; 