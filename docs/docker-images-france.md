# Documentation des Images Docker - France

## 🐳 Images Docker pour l'Architecture France

Cette documentation détaille les images Docker spécifiques à l'architecture France, leurs configurations et leurs spécificités RGPD.

---

## 1. 🧠 API IA France (`pandemies-api-ia-france`)

### Dockerfile: `AI_API/Dockerfile.france`
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Installation des dépendances système pour PostgreSQL
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Dépendances Python spécifiques France
COPY requirements-france.txt .
RUN pip install --no-cache-dir -r requirements-france.txt

COPY . .
RUN mkdir -p logs

EXPOSE 8000
CMD ["uvicorn", "main_france:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
```

### Dépendances spécifiques (`requirements-france.txt`)
```txt
# Connexion PostgreSQL directe
psycopg2-binary==2.9.9
sqlalchemy==2.0.23

# Sécurité RGPD
cryptography==41.0.7
bcrypt==4.1.2

# Machine Learning optimisé
scikit-learn==1.4.0
tensorflow==2.16.1  # Version allégée
```

### Variables d'environnement
| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `DATABASE_URL` | Connexion PostgreSQL directe | `postgresql://postgres_fr:pwd@postgres-france:5432/pandemies_db_france` |
| `FRANCE_MODE` | Active le mode France | `true` |
| `DIRECT_DB_ACCESS` | Connexion directe BDD | `true` |
| `GDPR_COMPLIANCE` | Conformité RGPD | `true` |
| `DATA_ANONYMIZATION` | Anonymisation automatique | `true` |
| `PERSONAL_DATA_ENCRYPTION` | Chiffrement données sensibles | `true` |

### Spécificités France
- **Pas de dépendance httpx** (plus d'API Express)
- **SQLAlchemy** pour connexion directe PostgreSQL
- **Cryptographie** renforcée pour RGPD
- **main_france.py** avec routes spécialisées
- **Anonymisation automatique** des réponses

### Endpoints spéciaux
```python
# Routes RGPD spécifiques
GET  /api/gdpr/data-export        # Export données personnelles
DELETE /api/gdpr/data-deletion    # Suppression données RGPD
GET  /api/predictions/mortality   # Prédictions anonymisées
GET  /test-database              # Test connexion directe BDD
```

### Construction
```bash
docker-compose -f docker-compose-france.yml build api-ia-france
```

---

## 2. 🗄️ PostgreSQL France (`pandemies-postgres-france`)

### Image de base: `postgres:15-alpine`

### Configuration RGPD (`configs/france/postgresql.conf`)
```ini
# Logging et audit RGPD (Article 30)
log_statement = 'all'
log_duration = on
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_connections = on
log_disconnections = on

# Chiffrement des données
ssl = on
ssl_prefer_server_ciphers = on
password_encryption = scram-sha-256

# Rétention RGPD (3 ans maximum)
log_rotation_age = 1d
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
```

### Variables d'environnement
| Variable | Description | Valeur |
|----------|-------------|--------|
| `POSTGRES_USER_FR` | Utilisateur spécifique France | `postgres_fr` |
| `POSTGRES_PASSWORD_FR` | Mot de passe sécurisé | Généré automatiquement |
| `POSTGRES_DB_FR` | Base de données France | `pandemies_db_france` |
| `POSTGRES_INITDB_ARGS` | Locale française | `--encoding=UTF8 --locale=fr_FR.UTF-8` |

### Volumes montés
```yaml
volumes:
  - postgres_data_france:/var/lib/postgresql/data
  - ./configs/france/postgresql.conf:/etc/postgresql/postgresql.conf:ro
```

### Ports
- **Interne**: 5432
- **Externe**: 5433 (évite conflits avec autres déploiements)

### Healthcheck
```bash
pg_isready -U postgres_fr -d pandemies_db_france
```

---

## 3. 🌐 Frontend France (`pandemies-frontend-france`)

### Dockerfile: `frontend/Dockerfile` (avec args France)
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Arguments de build France
ARG COUNTRY=france
ARG LOCALE=fr-FR

COPY . .
RUN npm run build

# Production stage  
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Variables d'environnement
| Variable | Description | Valeur |
|----------|-------------|--------|
| `REACT_APP_AI_API_URL` | URL API IA France | `http://localhost:8001` |
| `REACT_APP_COUNTRY` | Pays de déploiement | `france` |
| `REACT_APP_LOCALE` | Locale française | `fr-FR` |
| `REACT_APP_GDPR_ENABLED` | Mode RGPD | `true` |
| `REACT_APP_FRANCE_MODE` | Mode France spécial | `true` |

### Configuration Nginx (`nginx.conf`)
```nginx
server {
    listen 80;
    server_name localhost;
    
    # Sécurité renforcée France
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    
    # Gestion des erreurs
    error_page 404 /index.html;
}
```

### Spécificités France
- Interface 100% française
- **Pas d'API Express** dans les appels
- Communication directe avec API IA (port 8001)
- Headers de sécurité renforcés
- Conformité WCAG 2.1 AA

---

## 4. 🔄 ETL France (`pandemies-etl-france`)

### Dockerfile: `ETL/Dockerfile` (mode France)
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Dépendances ETL
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN mkdir -p logs processed raw_data

# Mode France avec anonymisation
ENV COUNTRY=france
ENV GDPR_COMPLIANCE=true
ENV DATA_ANONYMIZATION=true

CMD ["python", "scripts/run_etl_pipeline.py"]
```

### Variables d'environnement
| Variable | Description | Valeur |
|----------|-------------|--------|
| `DATABASE_URL` | Connexion PostgreSQL France | Connection string France |
| `COUNTRY` | Mode pays | `france` |
| `GDPR_COMPLIANCE` | Conformité RGPD | `true` |
| `DATA_ANONYMIZATION` | Anonymisation automatique | `true` |

### Profile ETL France
```yaml
profiles:
  - etl-france  # Démarre seulement sur demande
```

### Volumes
```yaml
volumes:
  - ./ETL/raw_data:/app/raw_data
  - ./ETL/processed:/app/processed
  - ./ETL/logs/france:/app/logs
```

---

## 5. ⚡ Redis France (`pandemies-redis-france`)

### Image de base: `redis:7-alpine`

### Configuration sécurisée
```bash
# Authentification obligatoire
command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD_FR}

# Optimisation réseau
sysctls:
  - net.core.somaxconn=65535
```

### Variables d'environnement
| Variable | Description | Valeur |
|----------|-------------|--------|
| `REDIS_PASSWORD_FR` | Mot de passe Redis France | Généré automatiquement |

### Ports
- **Interne**: 6379
- **Externe**: 6380

### Volume
```yaml
volumes:
  - redis_data_france:/data
```

---

## 🛠️ Scripts de Build

### Build complet France
```bash
#!/bin/bash
# Construction de toutes les images France

echo "🇫🇷 Construction des images France..."

# API IA France avec dépendances PostgreSQL
docker-compose -f docker-compose-france.yml build api-ia-france

# Frontend avec configuration France  
docker-compose -f docker-compose-france.yml build frontend-france

# ETL avec mode France
docker-compose -f docker-compose-france.yml build etl-france

echo "✅ Images France construites"
```

### Optimisation des images
```bash
# Nettoyage des couches intermédiaires
docker system prune -f

# Construction sans cache pour mise à jour complète
docker-compose -f docker-compose-france.yml build --no-cache

# Vérification taille des images
docker images | grep france
```

---

## 📊 Tailles et Performances

| Image | Taille | Temps démarrage | RAM utilisée |
|-------|--------|----------------|---------------|
| `pandemies-api-ia-france` | ~800MB | ~15s | ~200MB |
| `pandemies-postgres-france` | ~200MB | ~5s | ~100MB |
| `pandemies-frontend-france` | ~50MB | ~2s | ~20MB |
| `pandemies-etl-france` | ~600MB | ~10s | ~150MB |
| `pandemies-redis-france` | ~40MB | ~1s | ~10MB |

### Optimisations appliquées
- **Images Alpine** pour réduire la taille
- **Multi-stage builds** pour le frontend
- **Dépendances minimales** (requirements-france.txt allégé)
- **Layers caching** optimisé

---

## 🔒 Sécurité des Images

### Scan de vulnérabilités
```bash
# Scan sécurité avec Trivy
trivy image pandemies-api-ia-france:latest
trivy image pandemies-postgres-france:latest
```

### Bonnes pratiques appliquées
- ✅ **Utilisateur non-root** dans les conteneurs
- ✅ **Images de base officielles** uniquement
- ✅ **Dépendances minimales** installées
- ✅ **Secrets** via variables d'environnement
- ✅ **Logs** sécurisés (pas de données sensibles)

### Conformité RGPD
- ✅ **Chiffrement** des données sensibles
- ✅ **Anonymisation** automatique
- ✅ **Audit trails** complets
- ✅ **Rétention** limitée à 3 ans

---

## 🚀 Déploiement des Images

### Déploiement automatisé
```bash
# Déploiement complet avec build
./scripts/france/deploy-france.sh

# Processus :
# 1. Build des images France
# 2. Vérification des prérequis  
# 3. Démarrage orchestré des services
# 4. Tests de connectivité
# 5. Validation RGPD
```

### Vérification post-déploiement
```bash
# Statut des conteneurs
docker-compose -f docker-compose-france.yml ps

# Logs de démarrage
docker-compose -f docker-compose-france.yml logs --tail=20

# Tests de santé
./scripts/france/monitor-france.sh health
```

---

*Documentation Images Docker France - Version 1.0.0 - MSPR3 2025* 🇫🇷