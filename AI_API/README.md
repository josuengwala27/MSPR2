# API IA - Prédictions Pandémiques

## Justification des choix techniques

- **FastAPI** : Framework Python moderne, rapide, support natif OpenAPI/Swagger, documentation interactive, validation automatique des entrées/sorties, idéal pour l’intégration avec des frontends et des outils OMS.
- **scikit-learn** : Bibliothèque de référence pour le machine learning, robuste, éprouvée, adaptée aux modèles tabulaires (Random Forest, clustering).
- **Structuration modulaire** : Séparation claire des routes, modèles, services, facilitant la maintenance et l’ajout de nouveaux algorithmes.
- **Accessibilité API** : Documentation interactive (Swagger UI, ReDoc), endpoints auto-documentés, export OpenAPI pour intégration et audit.
- **Interopérabilité** : Facilité de connexion avec l’API Express.js (Node) et le frontend React, via HTTP REST standardisé.
- **Conformité OMS** : Transparence des modèles, traçabilité des prédictions, endpoints de monitoring et de qualité des données.

## Documentation OpenAPI

- **Swagger UI** : http://localhost:8000/docs (test interactif des endpoints)
- **ReDoc** : http://localhost:8000/redoc
- **Export OpenAPI** : http://localhost:8000/openapi.json (téléchargeable pour audit ou intégration)

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API IA        │    │   API Express   │
│   (React)       │◄──►│   (Python)      │◄──►│   (Node.js)     │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • Prédictions   │    │ • Données       │
│ • Prédictions   │    │ • Modèles ML    │    │ • Historique    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │   PostgreSQL    │
                                              │   (via Prisma)  │
                                              └─────────────────┘
```

## Installation

### 1. Prérequis
- Python 3.8+
- API Express.js en cours d'exécution (port 3000)

### 2. Installation des dépendances
```bash
cd AI_API
pip install -r requirements.txt
```

### 3. Configuration
```bash
# Copier le fichier de configuration
cp config.env.example .env

# Éditer les variables d'environnement
nano .env
```

### 4. Variables d'environnement
```env
# Configuration API IA
API_IA_HOST=0.0.0.0
API_IA_PORT=8000
API_IA_DEBUG=true

# Configuration API Express.js (à consommer)
API_EXPRESS_URL=http://localhost:3000
API_EXPRESS_TIMEOUT=30

# Configuration ML
ML_MODEL_CACHE_SIZE=100
ML_PREDICTION_HORIZON=30

# Logs
LOG_LEVEL=INFO
```

## Démarrage

### Mode développement
```bash
python main.py
```

### Mode production
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Documentation API

### Swagger UI
- **URL** : http://localhost:8000/docs
- **Description** : Interface interactive pour tester les endpoints

### ReDoc
- **URL** : http://localhost:8000/redoc
- **Description** : Documentation alternative

## Endpoints Disponibles

### 1. Prédictions de Mortalité
```bash
# Prédiction du taux de mortalité
GET /api/mortality/predict?pays=France&source=covid&horizon=7

# Informations sur le modèle
GET /api/mortality/model-info

# Vérification de la qualité des données
GET /api/mortality/data-quality?pays=France&source=covid
```

### 2. Prédictions Rt (en développement)
```bash
# Prédiction du nombre de reproduction
GET /api/rt/predict?pays=France&indicator=cases&source=covid&horizon=7

# Informations sur le modèle
GET /api/rt/model-info
```

### 3. Prédictions de Propagation (en développement)
```bash
# Prédiction de propagation géographique
GET /api/spread/predict?indicator=cases&source=covid&k=3

# Informations sur le modèle
GET /api/spread/model-info
```

### 4. Endpoints de Base
```bash
# Point d'entrée
GET /

# Vérification de santé
GET /health
```

## Modèles ML

### 1. Modèle de Mortalité (Random Forest)
- **Type** : Random Forest Regressor
- **Features** : 
  - Features temporelles (jour, mois, jour de l'année)
  - Features de tendance (lag 1, lag 7, moyennes mobiles)
  - Features de volatilité (écart-type)
- **Métriques** : MAE, RMSE, R²
- **Status** : ✅ Fonctionnel

### 2. Modèle Rt (LSTM)
- **Type** : LSTM (Long Short-Term Memory)
- **Features** : Séries temporelles
- **Status** : 🚧 En développement

### 3. Modèle de Propagation (Clustering)
- **Type** : Clustering temporel
- **Features** : Similarité entre pays
- **Status** : 🚧 En développement

## Exemple d'Utilisation

### Prédiction de mortalité COVID France
```bash
curl "http://localhost:8000/api/mortality/predict?pays=France&source=covid&horizon=7"
```

**Réponse :**
```json
{
  "predictions": [
    {
      "date": "2024-01-02",
      "predicted_mortality_rate": 0.001234,
      "confidence_interval": {
        "lower": 0.000234,
        "upper": 0.002234
      }
    }
  ],
  "metadata": {
    "pays": "France",
    "source": "covid",
    "request_date": "2024-01-01T12:00:00",
    "model": {
      "model_type": "Random Forest",
      "features_used": ["day_of_week", "month", ...],
      "training_samples": 150,
      "last_training_date": "2024-01-01",
      "prediction_horizon": 7,
      "model_accuracy": {
        "mae": 0.000123,
        "rmse": 0.000234,
        "r2": 0.85
      }
    }
  }
}
```

## Développement

### Structure du Projet
```
AI_API/
├── main.py                 # Point d'entrée FastAPI
├── requirements.txt        # Dépendances Python
├── config.env.example      # Configuration exemple
├── services/
│   └── express_client.py   # Client HTTP pour API Express.js
├── models/
│   └── mortality_model.py  # Modèle Random Forest
├── routes/
│   ├── mortality_routes.py # Routes prédictions mortalité
│   ├── rt_routes.py        # Routes prédictions Rt
│   └── spread_routes.py    # Routes prédictions propagation
└── utils/
    └── logger.py           # Configuration logging
```

### Ajout d'un Nouveau Modèle
1. Créer le modèle dans `models/`
2. Créer les routes dans `routes/`
3. Ajouter les dépendances dans `requirements.txt`
4. Tester avec Swagger UI

## Tests

### Tests de Connexion
```bash
# Test de santé
curl http://localhost:8000/health

# Test de connexion API Express.js
curl http://localhost:8000/api/mortality/data-quality?pays=France
```

### Tests de Prédiction
```bash
# Test prédiction mortalité
curl "http://localhost:8000/api/mortality/predict?pays=France&source=covid&horizon=3"
```

## Dépannage

### Erreur de Connexion API Express.js
- Vérifier que l'API Express.js est démarrée sur le port 3000
- Vérifier la variable `API_EXPRESS_URL` dans `.env`

### Erreur de Données Insuffisantes
- Vérifier que le pays a au moins 30 jours de données
- Utiliser `/api/mortality/data-quality` pour diagnostiquer

### Erreur de Modèle
- Vérifier les logs : `LOG_LEVEL=DEBUG`
- Redémarrer l'API IA

## 4. Prédictions de Propagation Géographique (Spread Predictions)

### Qu’est-ce que la propagation géographique ?
La propagation géographique correspond à l’identification de groupes de pays présentant une dynamique épidémique similaire, grâce à un **clustering KMeans multi-pays** appliqué sur les séries temporelles de cas ou de décès.

- **But** : Regrouper les pays selon la similarité de leur évolution épidémique (COVID, MPOX, etc.).
- **Méthode** : Clustering KMeans sur les séries temporelles de chaque pays (cas ou décès).
- **Utilité** : Surveillance internationale, détection de groupes à risque, aide à la décision OMS.

### Endpoint
```bash
GET /api/spread/predict?indicator=cases&source=covid&k=3
```
- `indicator` : "cases" ou "deaths"
- `source` : "covid", "mpox", etc.
- `k` : nombre de clusters (groupes de pays)

### Exemple d’appel
```bash
curl "http://localhost:8000/api/spread/predict?indicator=cases&source=covid&k=3"
```

### Exemple de réponse
```json
{
  "clusters": [
    {
      "cluster": 1,
      "countries": [
        {"iso_code": "FRA", "country": "France"},
        {"iso_code": "DEU", "country": "Germany"}
      ]
    },
    {
      "cluster": 2,
      "countries": [
        {"iso_code": "ITA", "country": "Italy"},
        {"iso_code": "ESP", "country": "Spain"}
      ]
    }
  ],
  "meta": {
    "indicator": "cases",
    "source": "covid",
    "k": 3,
    "count": 234,
    "model": "KMeans",
    "doc": "Clustering KMeans sur les séries temporelles de chaque pays. Les pays d'un même cluster présentent une dynamique similaire pour l'indicateur donné."
  }
}
```

### Distinction avec les autres prédictions
- **Rt** : Prédit le taux de transmission (nombre de personnes infectées par malade).
- **Mortalité** : Prédit le taux de décès.
- **Propagation géographique (Spread)** : Regroupe les pays par similarité de propagation, **ne prédit pas le nombre de cas/jour**.

---