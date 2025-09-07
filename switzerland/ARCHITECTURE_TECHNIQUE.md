# Architecture Technique - Cluster Suisse MSPR 3

## 📋 Table des Matières

1. [Vue d'ensemble technique](#vue-densemble-technique)
2. [Architecture des services](#architecture-des-services)
3. [Configuration réseau](#configuration-réseau)
4. [Gestion des données](#gestion-des-données)
5. [Sécurité et authentification](#sécurité-et-authentification)
6. [Monitoring et observabilité](#monitoring-et-observabilité)
7. [Déploiement et CI/CD](#déploiement-et-cicd)
8. [Troubleshooting](#troubleshooting)

---

## 🏗️ Vue d'ensemble technique

### Stack Technologique

| Composant | Technologie | Version | Port | Responsabilité |
|-----------|-------------|---------|------|----------------|
| **Frontend** | React + Nginx | 18.x + Alpine | 3003 | Interface utilisateur multi-langues |
| **Service Traduction** | Node.js + Express | 18.x | 3004 | API traductions FR/DE/IT |
| **API IA** | FastAPI + Python | 3.11 | 8001 | Modèles ML et prédictions |
| **Base de données** | PostgreSQL | 15-alpine | 5433 | Stockage données pandémiques |
| **Cache** | Redis | 7-alpine | 6380 | Cache traductions et sessions |

### Diagramme d'Architecture

```mermaid
graph TB
    subgraph "Cluster Suisse - Architecture Technique"
        subgraph "Couche Présentation"
            A[Frontend React<br/>Nginx Alpine<br/>Port 3003]
        end
        
        subgraph "Couche Application"
            B[Service Traduction<br/>Node.js Express<br/>Port 3004]
            C[API IA<br/>FastAPI Python<br/>Port 8001]
        end
        
        subgraph "Couche Données"
            D[PostgreSQL<br/>15-alpine<br/>Port 5433]
            E[Redis<br/>7-alpine<br/>Port 6380]
        end
        
        subgraph "Couche Configuration"
            F[Fichiers i18n<br/>fr.json, de.json, it.json]
            G[Variables Environnement<br/>switzerland.env]
        end
    end
    
    A --> B
    A --> C
    B --> E
    B --> F
    C --> D
    C --> E
    B --> G
    C --> G
```

---

## 🔧 Architecture des Services

### 1. Frontend Suisse (React + Nginx)

**Configuration Docker** :
```dockerfile
# Multi-stage build optimisé
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

**Configuration Nginx** :
```nginx
server {
    listen 80;
    server_name localhost;
    
    # Sécurité headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # Proxy vers API IA Suisse
    location /api/ {
        proxy_pass http://api-ia-switzerland:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Proxy vers service traduction
    location /api/translate/ {
        proxy_pass http://translation-service:3004/api/translate/;
    }
}
```

### 2. Service de Traduction (Node.js + Express)

**Structure du service** :
```javascript
// translation-service.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3004;

// Middleware
app.use(express.json());
app.use(cors());

// Routes principales
app.get('/api/translate/languages', (req, res) => {
    res.json({
        supported: ['fr', 'de', 'it'],
        default: 'fr',
        fallback: 'fr'
    });
});

app.get('/api/translate/:key', async (req, res) => {
    const { key } = req.params;
    const { lang = 'fr' } = req.query;
    
    try {
        const translation = await getTranslation(key, lang);
        res.json({
            success: true,
            key,
            language: lang,
            translation,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: 'Translation not found',
            fallback_used: true
        });
    }
});
```

**Gestion des traductions** :
```javascript
const fs = require('fs');
const path = require('path');

const translations = {
    fr: JSON.parse(fs.readFileSync('/app/i18n/fr.json', 'utf8')),
    de: JSON.parse(fs.readFileSync('/app/i18n/de.json', 'utf8')),
    it: JSON.parse(fs.readFileSync('/app/i18n/it.json', 'utf8'))
};

function getTranslation(key, lang) {
    const keys = key.split('.');
    let value = translations[lang] || translations.fr;
    
    for (const k of keys) {
        value = value[k];
        if (!value) {
            // Fallback vers français
            value = translations.fr;
            for (const fk of keys) {
                value = value[fk];
            }
            break;
        }
    }
    
    return value || key;
}
```

### 3. API IA Suisse (FastAPI + Python)

**Configuration principale** :
```python
# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

app = FastAPI(
    title="API IA Suisse - Prédictions Pandémiques",
    description="API spécialisée pour la Suisse (FR/DE/IT)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuration CORS pour la Suisse
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3003", "http://frontend-switzerland"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Configuration spécifique Suisse
SUPPORTED_LANGUAGES = ["fr", "de", "it"]
DEFAULT_LANGUAGE = "fr"
TIMEZONE = "Europe/Zurich"
ENABLE_DATAVIZ = False  # Conforme aux exigences
ENABLE_TECHNICAL_API = False  # Conforme aux exigences
```

**Modèles ML adaptés** :
```python
# models/mortality_model.py
from sklearn.ensemble import RandomForestRegressor
import pandas as pd
import numpy as np

class SwissMortalityModel:
    def __init__(self):
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        self.features = [
            'day_of_week', 'month', 'day_of_year',
            'lag_1', 'lag_7', 'rolling_mean_7',
            'volatility_7'
        ]
    
    def predict(self, data, horizon_days=7):
        """Prédiction adaptée pour la Suisse"""
        predictions = []
        
        for day in range(horizon_days):
            pred = self.model.predict(data)
            predictions.append({
                'date': (pd.Timestamp.now() + pd.Timedelta(days=day)).strftime('%Y-%m-%d'),
                'predicted_mortality_rate': float(pred[0]),
                'confidence_interval': {
                    'lower': float(pred[0] * 0.8),
                    'upper': float(pred[0] * 1.2)
                }
            })
        
        return predictions
```

### 4. PostgreSQL Suisse

**Configuration spécifique** :
```yaml
# docker-compose.switzerland.yml
postgres-switzerland:
  image: postgres:15-alpine
  environment:
    POSTGRES_DB: pandemies_switzerland
    POSTGRES_USER: pandemies_user
    POSTGRES_PASSWORD: pandemies_password
    POSTGRES_INITDB_ARGS: "--encoding=UTF-8 --lc-collate=fr_CH.UTF-8 --lc-ctype=fr_CH.UTF-8"
  ports:
    - "5433:5432"
  volumes:
    - postgres_data_switzerland:/var/lib/postgresql/data
    - ./init:/docker-entrypoint-initdb.d
```

**Schéma de base adapté** :
```sql
-- Tables principales
CREATE TABLE pays (
    id_pays SERIAL PRIMARY KEY,
    country VARCHAR(100) NOT NULL,
    iso_code VARCHAR(3) UNIQUE NOT NULL,
    population BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE donnee_historique (
    id_donnee SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    country VARCHAR(100) NOT NULL,
    indicator VARCHAR(50) NOT NULL,
    value FLOAT,
    iso_code VARCHAR(3),
    source VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour performance
CREATE INDEX idx_donnee_date ON donnee_historique(date);
CREATE INDEX idx_donnee_country ON donnee_historique(country);
CREATE INDEX idx_donnee_indicator ON donnee_historique(indicator);
```

### 5. Redis Suisse

**Configuration optimisée** :
```yaml
redis-switzerland:
  image: redis:7-alpine
  ports:
    - "6380:6379"
  volumes:
    - redis_data_switzerland:/data
  command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
```

**Utilisation du cache** :
```python
import redis
import json

class SwissCacheManager:
    def __init__(self):
        self.redis = redis.Redis(
            host='redis-switzerland',
            port=6379,
            db=0,
            decode_responses=True
        )
        self.prefix = "switzerland:"
    
    def cache_translation(self, key, lang, translation, ttl=3600):
        cache_key = f"{self.prefix}translation:{lang}:{key}"
        self.redis.setex(cache_key, ttl, json.dumps(translation))
    
    def get_translation(self, key, lang):
        cache_key = f"{self.prefix}translation:{lang}:{key}"
        cached = self.redis.get(cache_key)
        return json.loads(cached) if cached else None
```

---

## 🌐 Configuration réseau

### Docker Network

```yaml
networks:
  pandemies-switzerland-network:
    driver: bridge
    name: pandemies-switzerland-network
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### Communication Inter-Services

| Service Source | Service Destination | Protocole | Port | Description |
|----------------|-------------------|-----------|------|-------------|
| Frontend | API IA | HTTP | 8001 | Requêtes prédictions |
| Frontend | Service Traduction | HTTP | 3004 | Requêtes traductions |
| API IA | PostgreSQL | TCP | 5432 | Requêtes données |
| API IA | Redis | TCP | 6379 | Cache et sessions |
| Service Traduction | Redis | TCP | 6379 | Cache traductions |

### Health Checks

```yaml
# Configuration health checks
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:3004/api/translate/languages || exit 1"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

---

## 🔒 Sécurité et authentification

### Headers de Sécurité

```nginx
# Configuration Nginx sécurisée
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### Configuration JWT

```python
# JWT Configuration pour la Suisse
import jwt
from datetime import datetime, timedelta

class SwissJWTHandler:
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET', 'switzerland_jwt_secret_key_2024')
        self.algorithm = 'HS256'
        self.expiration_hours = 24
    
    def create_token(self, user_data):
        payload = {
            'user_id': user_data['id'],
            'country': 'CH',
            'languages': ['fr', 'de', 'it'],
            'exp': datetime.utcnow() + timedelta(hours=self.expiration_hours),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
    
    def verify_token(self, token):
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token expired")
        except jwt.InvalidTokenError:
            raise HTTPException(status_code=401, detail="Invalid token")
```

### Variables d'Environnement Sécurisées

```env
# switzerland.env
# Sécurité
JWT_SECRET=switzerland_jwt_secret_key_2024_$(openssl rand -hex 32)
ENCRYPTION_KEY=switzerland_encryption_key_2024_$(openssl rand -hex 32)
SESSION_SECRET=switzerland_session_secret_2024_$(openssl rand -hex 32)

# Base de données
DATABASE_URL=postgresql://pandemies_user:$(openssl rand -base64 32)@postgres-switzerland:5432/pandemies_switzerland

# Redis
REDIS_PASSWORD=$(openssl rand -base64 32)
```

---

## 📊 Monitoring et observabilité

### Logs Structurés

```python
# Configuration logging pour la Suisse
import logging
import json
from datetime import datetime

class SwissLogger:
    def __init__(self):
        self.logger = logging.getLogger('swiss_cluster')
        self.logger.setLevel(logging.INFO)
        
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
    
    def log_request(self, service, endpoint, status_code, response_time):
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'service': service,
            'endpoint': endpoint,
            'status_code': status_code,
            'response_time_ms': response_time,
            'country': 'CH',
            'environment': 'production'
        }
        self.logger.info(json.dumps(log_data))
```

### Métriques de Performance

```python
# Métriques spécifiques Suisse
class SwissMetrics:
    def __init__(self):
        self.metrics = {
            'translation_requests': 0,
            'translation_cache_hits': 0,
            'api_requests': 0,
            'average_response_time': 0,
            'error_rate': 0
        }
    
    def record_translation_request(self, lang, cache_hit=False):
        self.metrics['translation_requests'] += 1
        if cache_hit:
            self.metrics['translation_cache_hits'] += 1
    
    def get_cache_hit_ratio(self):
        if self.metrics['translation_requests'] == 0:
            return 0
        return self.metrics['translation_cache_hits'] / self.metrics['translation_requests']
```

### Health Check Endpoints

```python
# Health checks pour tous les services
@app.get("/health")
async def health_check():
    checks = {
        'api_ia': await check_api_ia_health(),
        'database': await check_database_health(),
        'redis': await check_redis_health(),
        'translation_service': await check_translation_health()
    }
    
    overall_status = "healthy" if all(checks.values()) else "unhealthy"
    
    return {
        'status': overall_status,
        'timestamp': datetime.utcnow().isoformat(),
        'country': 'CH',
        'services': checks
    }
```

---

## 🚀 Déploiement et CI/CD

### Script de Déploiement

```bash
#!/bin/bash
# deploy-switzerland.sh

set -e

echo "🇨🇭 Déploiement du Cluster Suisse MSPR 3"

# Variables
COMPOSE_FILE="switzerland/docker-compose.switzerland.yml"
ENV_FILE="switzerland/config/switzerland.env"

# Vérifications préalables
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Fichier docker-compose non trouvé: $COMPOSE_FILE"
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Fichier d'environnement non trouvé: $ENV_FILE"
    exit 1
fi

# Arrêt des services existants
echo "🛑 Arrêt des services existants..."
docker-compose -f "$COMPOSE_FILE" down --volumes --remove-orphans

# Nettoyage
echo "🧹 Nettoyage des ressources..."
docker system prune -f

# Construction des images
echo "🔨 Construction des images..."
docker-compose -f "$COMPOSE_FILE" build --no-cache

# Démarrage des services
echo "🚀 Démarrage des services..."
docker-compose -f "$COMPOSE_FILE" up -d

# Attente de la disponibilité
echo "⏳ Attente de la disponibilité des services..."
sleep 30

# Tests de santé
echo "🏥 Tests de santé des services..."
./scripts/test-switzerland-health.sh

echo "✅ Déploiement du Cluster Suisse terminé!"
echo ""
echo "🌐 Services disponibles:"
echo "   Frontend Suisse:     http://localhost:3003"
echo "   Service Traduction:  http://localhost:3004"
echo "   API IA Suisse:       http://localhost:8001"
echo "   Documentation:       http://localhost:8001/docs"
```

### Tests de Santé Automatisés

```bash
#!/bin/bash
# test-switzerland-health.sh

echo "🏥 Tests de santé du Cluster Suisse"

# Test Frontend Suisse
echo "Testing Frontend Suisse..."
if curl -f -s http://localhost:3003 > /dev/null; then
    echo "✅ Frontend Suisse: OK"
else
    echo "❌ Frontend Suisse: FAILED"
    exit 1
fi

# Test Service Traduction
echo "Testing Service Traduction..."
if curl -f -s "http://localhost:3004/api/translate/languages" > /dev/null; then
    echo "✅ Service Traduction: OK"
else
    echo "❌ Service Traduction: FAILED"
    exit 1
fi

# Test API IA Suisse
echo "Testing API IA Suisse..."
if curl -f -s http://localhost:8001/health > /dev/null; then
    echo "✅ API IA Suisse: OK"
else
    echo "❌ API IA Suisse: FAILED"
    exit 1
fi

# Test traductions multi-langues
echo "Testing traductions multi-langues..."
for lang in fr de it; do
    if curl -f -s "http://localhost:3004/api/translate/common.welcome?lang=$lang" > /dev/null; then
        echo "✅ Traduction $lang: OK"
    else
        echo "❌ Traduction $lang: FAILED"
        exit 1
    fi
done

echo "🎉 Tous les tests de santé sont passés!"
```

---

## 🔧 Troubleshooting

### Problèmes Courants

#### 1. Service de Traduction Non Disponible

**Symptômes** :
- Erreur 503 sur les requêtes de traduction
- Frontend affiche les clés au lieu des traductions

**Diagnostic** :
```bash
# Vérifier les logs
docker logs pandemies-translation-switzerland

# Vérifier la connectivité
docker exec pandemies-frontend-switzerland curl -f http://translation-service:3004/api/translate/languages
```

**Solutions** :
```bash
# Redémarrer le service
docker-compose -f switzerland/docker-compose.switzerland.yml restart translation-service

# Vérifier les fichiers i18n
docker exec pandemies-translation-switzerland ls -la /app/i18n/
```

#### 2. API IA Non Responsive

**Symptômes** :
- Timeout sur les prédictions
- Erreur de connexion à la base de données

**Diagnostic** :
```bash
# Vérifier les logs
docker logs pandemies-api-ia-switzerland

# Tester la connexion DB
docker exec pandemies-api-ia-switzerland python -c "
import psycopg2
conn = psycopg2.connect('postgresql://pandemies_user:pandemies_password@postgres-switzerland:5432/pandemies_switzerland')
print('DB Connection: OK')
"
```

**Solutions** :
```bash
# Redémarrer avec logs détaillés
docker-compose -f switzerland/docker-compose.switzerland.yml up -d api-ia-switzerland
docker logs -f pandemies-api-ia-switzerland
```

#### 3. Problèmes de Cache Redis

**Symptômes** :
- Traductions lentes
- Erreurs de cache

**Diagnostic** :
```bash
# Vérifier Redis
docker exec pandemies-redis-switzerland redis-cli ping

# Vérifier les clés
docker exec pandemies-redis-switzerland redis-cli keys "switzerland:*"
```

**Solutions** :
```bash
# Redémarrer Redis
docker-compose -f switzerland/docker-compose.switzerland.yml restart redis-switzerland

# Nettoyer le cache
docker exec pandemies-redis-switzerland redis-cli flushdb
```

### Commandes de Debug

```bash
# Voir tous les logs
docker-compose -f switzerland/docker-compose.switzerland.yml logs -f

# Voir les logs d'un service spécifique
docker-compose -f switzerland/docker-compose.switzerland.yml logs -f translation-service

# Entrer dans un container
docker exec -it pandemies-api-ia-switzerland bash

# Vérifier les ressources
docker stats pandemies-*-switzerland

# Vérifier les réseaux
docker network ls
docker network inspect pandemies-switzerland-network
```

---

## 📋 Checklist de Validation Technique

### ✅ Infrastructure

- [x] **Docker Compose** : Configuration multi-services fonctionnelle
- [x] **Réseau** : Communication inter-services opérationnelle
- [x] **Volumes** : Persistance des données configurée
- [x] **Health Checks** : Monitoring des services actif

### ✅ Sécurité

- [x] **Headers Sécurité** : X-Frame-Options, CSP, HSTS configurés
- [x] **JWT** : Authentification par tokens implémentée
- [x] **CORS** : Configuration restrictive par domaine
- [x] **Variables Sensibles** : Gestion sécurisée des secrets

### ✅ Performance

- [x] **Cache Redis** : Mise en cache des traductions
- [x] **Index DB** : Optimisation des requêtes PostgreSQL
- [x] **Compression** : Gzip activé sur Nginx
- [x] **Monitoring** : Métriques de performance collectées

### ✅ Observabilité

- [x] **Logs Structurés** : Format JSON avec métadonnées
- [x] **Health Checks** : Endpoints de santé pour tous les services
- [x] **Métriques** : Collecte des KPIs techniques
- [x] **Alerting** : Détection des anomalies

---

*Documentation technique générée le 2025-09-07 pour le MSPR 3 - Cluster Suisse*
