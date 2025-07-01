# 🦠 Frontend React - Prédiction Pandémies IA (MSPR2024)

## 📋 Vue d'ensemble

Application React moderne pour la prédiction des pandémies COVID-19 et MPOX, utilisant des modèles d'intelligence artificielle pour analyser et prédire :
- **Taux de transmission (Rt)** avec modèle LSTM
- **Taux de mortalité** avec modèle Random Forest  
- **Propagation géographique** avec modèle Clustering K-Means

## 🏗️ Architecture Système

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API IA        │    │   API Express   │
│   React         │◄──►│   Python        │◄──►│   Node.js       │
│   Port: 3000    │    │   Port: 8000    │    │   Port: 3000    │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • Prédictions   │    │ • Données       │
│ • Prédictions   │    │ • Modèles ML    │    │ • Historique    │
│ • Visualisation │    │ • Preprocessing │    │ • Métadonnées   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Flux de Données
1. **Frontend React** → Requête prédiction → **API IA Python**
2. **API IA Python** → Récupération données → **API Express.js** 
3. **API IA Python** → Traitement ML → Retour prédictions → **Frontend React**

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- npm ou yarn
- Variables d'environnement configurées

### Installation
```bash
# Installation des dépendances
npm install

# Configuration environnement
cp .env.example .env.local
# Ajustez les URLs dans .env.local

# Démarrage en mode développement
npm start
```

### Variables d'environnement
```env
# API Express.js (existante)
REACT_APP_EXPRESS_API_URL=http://localhost:3000/api

# API IA Python (à créer en PHASE 2)
REACT_APP_IA_API_URL=http://localhost:8000/api/ia

# Mode simulation (pour développement initial)
REACT_APP_SIMULATION_MODE=true
```

## 📁 Structure du Projet

```
src/
├── components/
│   ├── Layout/
│   │   ├── Navbar.jsx          # Navigation responsive + accessibilité
│   │   ├── Footer.jsx          # Footer informatif OMS
│   │   └── Layout.jsx          # Wrapper principal
│   └── common/
├── pages/
│   ├── Dashboard.jsx           # Tableau de bord + KPIs
│   ├── RtPrediction.jsx        # Prédiction taux transmission
│   ├── MortalityPrediction.jsx # Prédiction mortalité
│   ├── SpreadPrediction.jsx    # Prédiction propagation
│   └── About.jsx               # Information sur les modèles
├── services/
│   └── api.js                  # Services API + intégration future
├── styles/
│   └── *.css                   # Styles par composant
└── tests/                      # Tests unitaires + E2E
```

## 🔧 Services API

### API Express.js (Existante)
```javascript
import { expressAPI } from './services/api';

// Routes actuelles
await expressAPI.getPays();
await expressAPI.getIndicateurs();
await expressAPI.getDonneesHistoriques(params);

// Routes futures pour support IA
await expressAPI.getAggregation(params);
await expressAPI.getMLReadyData(params);
await expressAPI.getRt(params);
await expressAPI.getMortalityRate(params);
await expressAPI.getGeographicSpread(params);
```

### API IA Python (À créer - PHASE 2)
```javascript
import { iaAPI } from './services/api';

// Prédiction Rt (LSTM)
const rtPrediction = await iaAPI.predictRt({
  country: 'France',
  disease: 'COVID-19',
  timeHorizon: 30
});

// Prédiction Mortalité (Random Forest)
const mortalityPrediction = await iaAPI.predictMortality({
  country: 'France',
  disease: 'MPOX',
  riskFactors: ['immunodéficience', 'âge']
});

// Prédiction Propagation (Clustering)
const spreadPrediction = await iaAPI.predictSpread({
  originCountry: 'France',
  targetRegion: 'Europe',
  disease: 'COVID-19'
});
```

## 📊 Pages et Fonctionnalités

### 🏠 Dashboard
- **KPIs mondiaux** : Cas, décès, vaccination
- **Cartes interactives** : Risques par région
- **Évolution temporelle** : Graphiques tendances
- **Modules prédictions** : Accès rapide

### 📈 Prédiction Rt (Taux de Transmission)
- **Modèle** : LSTM (Précision: 60-70%)
- **Paramètres** : Pays, horizon (7-30j)
- **Résultats** : Rt prédit + intervalle confiance
- **Interprétation** : Statut épidémique (déclin/croissance)

### ⚕️ Prédiction Mortalité
- **Modèle** : Random Forest (Précision: 80-85%)
- **Paramètres** : Pays, âge, facteurs de risque
- **Résultats** : Taux mortalité + analyse facteurs
- **Visualisation** : Graphiques par groupe d'âge

### 🌍 Prédiction Propagation
- **Modèle** : Clustering K-Means (Précision: 70-75%)
- **Paramètres** : Origine, transport, densité
- **Résultats** : Pays à risque + timeline propagation
- **Réseaux** : Visualisation connexions mondiales

### ℹ️ À Propos
- **Modèles IA** : Description technique
- **Données** : Sources OMS, limitations
- **Technologies** : Stack technique utilisée
- **Contact** : Informations équipe

## 🧪 Tests

### Tests Unitaires (Jest + React Testing Library)
```bash
# Tous les tests
npm test

# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

### Tests E2E (Cypress)
```bash
# Ouvrir Cypress GUI
npm run cypress:open

# Tests headless
npm run cypress:run
```

### Accessibilité
- **WCAG 2.1 AA** : Conformité totale
- **Navigation clavier** : Tab, Enter, Escape
- **Lecteurs d'écran** : ARIA, sémantique HTML
- **Contraste** : Ratio 4.5:1 minimum

## 🔄 Intégration API IA (Roadmap)

### Phase 1 : Développement Initial ✅
- [x] Frontend React complet
- [x] Mode simulation activé
- [x] Services API préparés
- [x] Tests unitaires + E2E

### Phase 2 : Intégration API IA Python 🚧
- [ ] Extension API Express.js (6 nouveaux endpoints)
- [ ] Création API IA Python (FastAPI)
- [ ] Modèles ML (LSTM, Random Forest, Clustering)
- [ ] Tests intégration Frontend ↔ API IA

### Phase 3 : Production 🔮
- [ ] Déploiement APIs
- [ ] Basculement mode production
- [ ] Monitoring performance
- [ ] Optimisations

## ⚙️ Migration vers API IA

### Étapes pour basculer du mode simulation vers API IA :

1. **Variables d'environnement**
```env
REACT_APP_SIMULATION_MODE=false
REACT_APP_IA_API_URL=http://localhost:8000/api/ia
```

2. **Décommenter imports**
```javascript
// Dans RtPrediction.jsx, MortalityPrediction.jsx, SpreadPrediction.jsx
import { iaAPI, apiUtils } from '../services/api';
```

3. **Remplacer simulations**
```javascript
// Remplacer blocs "SIMULATION ACTUELLE" par appels iaAPI
const result = await iaAPI.predictRt(params);
```

4. **Tests API IA**
```bash
# Vérifier santé API IA
curl http://localhost:8000/api/ia/health

# Test prédiction
curl -X POST http://localhost:8000/api/ia/predict/rt \
  -H "Content-Type: application/json" \
  -d '{"pays":"France","horizon_jours":30}'
```

## 🛠️ Développement

### Scripts Disponibles
```bash
npm start          # Développement (port 3000)
npm run build      # Build production
npm test           # Tests unitaires
npm run eject      # Éjecter CRA (non recommandé)
npm run lint       # Vérification ESLint
npm run format     # Formatage Prettier
```

### Standards Code
- **ESLint** : Configuration React recommandée
- **Prettier** : Formatage automatique
- **Husky** : Pre-commit hooks
- **Conventional Commits** : Messages standardisés

### Performance
- **Lazy Loading** : Chargement des pages à la demande
- **Memoization** : React.memo pour composants
- **Bundle Splitting** : Chunks par route
- **Service Worker** : Cache statique

## 🔒 Sécurité

### Protection XSS
- **DOMPurify** : Sanitisation HTML
- **Content Security Policy** : Headers sécurisés
- **Validation** : Paramètres côté client + serveur

### Variables Sensibles
```env
# Ne JAMAIS commiter de secrets
# Utiliser .env.local pour développement
# Variables prefix REACT_APP_ uniquement
```

## 📈 Monitoring & Analytics

### Métriques Collectées
- **Performance** : Temps chargement pages
- **Erreurs** : Logs côté client
- **Usage** : Prédictions lancées par type
- **Accessibilité** : Interactions clavier/souris

### Outils
- **React DevTools** : Debug composants
- **Lighthouse** : Audit performance + accessibilité
- **Sentry** : Monitoring erreurs (optionnel)

## 🤝 Contribution

### Workflow Git
```bash
# Nouvelle fonctionnalité
git checkout -b feature/nouvelle-fonctionnalite
git commit -m "feat: ajouter prédiction mortalité"
git push origin feature/nouvelle-fonctionnalite
# Créer Pull Request
```

### Standards
- **Branches** : feature/, bugfix/, hotfix/
- **Tests** : Obligatoires pour nouveau code
- **Documentation** : README à jour
- **Accessibilité** : Tests manuel + automatisé

## 📞 Support

### Problèmes Courants

**API IA indisponible**
```javascript
// Mode automatique de fallback
if (apiUtils.isSimulationMode()) {
  // Utilise données simulées
}
```

**Erreur CORS**
```bash
# Vérifier configuration serveur
# ou utiliser proxy dans package.json
"proxy": "http://localhost:3000"
```

**Tests échouent**
```bash
# Nettoyer cache
npm run test -- --clearCache --watchAll=false
```

### Contacts
- **Équipe Frontend** : [Votre équipe]
- **Documentation** : Ce README + commentaires code
- **Issues** : GitHub Issues pour bugs/features

---

## 🎯 Objectifs Projet

✅ **Frontend React moderne et accessible**  
🚧 **Intégration future API IA Python**  
🔮 **Prédictions fiables COVID-19 & MPOX**  
🎨 **UX optimale pour utilisateurs OMS**  

---

*Dernière mise à jour : Décembre 2024*
