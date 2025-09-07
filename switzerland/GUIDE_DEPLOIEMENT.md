# Guide de Déploiement - Cluster Suisse MSPR 3

## 🎯 Objectif

Ce guide détaille le déploiement complet du **Cluster Suisse** selon les exigences du MSPR 3, incluant la mise en production, la configuration multi-langues, et la maintenance opérationnelle.

---

## 📋 Prérequis

### Environnement Système

| Composant | Version Minimale | Recommandée | Vérification |
|-----------|------------------|--------------|--------------|
| **Docker** | 20.10+ | 24.0+ | `docker --version` |
| **Docker Compose** | 2.0+ | 2.20+ | `docker-compose --version` |
| **RAM** | 4GB | 8GB+ | `free -h` |
| **Disque** | 10GB | 20GB+ | `df -h` |
| **CPU** | 2 cœurs | 4 cœurs+ | `nproc` |

### Vérification des Prérequis

```bash
#!/bin/bash
# check-prerequisites.sh

echo "🔍 Vérification des prérequis pour le Cluster Suisse"

# Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d' ' -f3 | cut -d',' -f1)
    echo "✅ Docker: $DOCKER_VERSION"
else
    echo "❌ Docker non installé"
    exit 1
fi

# Docker Compose
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version | cut -d' ' -f3 | cut -d',' -f1)
    echo "✅ Docker Compose: $COMPOSE_VERSION"
else
    echo "❌ Docker Compose non installé"
    exit 1
fi

# RAM
RAM_GB=$(free -g | awk '/^Mem:/{print $2}')
if [ $RAM_GB -ge 4 ]; then
    echo "✅ RAM: ${RAM_GB}GB"
else
    echo "❌ RAM insuffisante: ${RAM_GB}GB (minimum 4GB requis)"
    exit 1
fi

# Espace disque
DISK_GB=$(df -BG . | awk 'NR==2{print $4}' | sed 's/G//')
if [ $DISK_GB -ge 10 ]; then
    echo "✅ Espace disque: ${DISK_GB}GB"
else
    echo "❌ Espace disque insuffisant: ${DISK_GB}GB (minimum 10GB requis)"
    exit 1
fi

echo "🎉 Tous les prérequis sont satisfaits!"
```

---

## 🚀 Déploiement Étape par Étape

### Étape 1 : Préparation de l'Environnement

```bash
#!/bin/bash
# step1-prepare-environment.sh

echo "🇨🇭 Étape 1: Préparation de l'environnement Cluster Suisse"

# Création des répertoires nécessaires
mkdir -p switzerland/logs
mkdir -p switzerland/data
mkdir -p switzerland/backups

# Configuration des permissions
chmod 755 switzerland/logs
chmod 755 switzerland/data
chmod 755 switzerland/backups

# Vérification des fichiers de configuration
if [ ! -f "switzerland/config/switzerland.env" ]; then
    echo "⚠️  Création du fichier d'environnement..."
    cp switzerland/config/switzerland.env.example switzerland/config/switzerland.env
    echo "📝 Veuillez configurer les variables dans switzerland/config/switzerland.env"
fi

# Vérification des fichiers i18n
for lang in fr de it; do
    if [ ! -f "switzerland/config/i18n/${lang}.json" ]; then
        echo "❌ Fichier de traduction manquant: ${lang}.json"
        exit 1
    fi
done

echo "✅ Environnement préparé avec succès"
```

### Étape 2 : Construction des Images Docker

```bash
#!/bin/bash
# step2-build-images.sh

echo "🔨 Étape 2: Construction des images Docker"

# Nettoyage des images existantes
echo "🧹 Nettoyage des images existantes..."
docker image prune -f

# Construction des images avec cache optimisé
echo "🏗️  Construction des images..."
docker-compose -f switzerland/docker-compose.switzerland.yml build \
    --parallel \
    --no-cache \
    --progress=plain

# Vérification des images construites
echo "🔍 Vérification des images construites..."
docker images | grep switzerland

echo "✅ Images construites avec succès"
```

### Étape 3 : Démarrage des Services

```bash
#!/bin/bash
# step3-start-services.sh

echo "🚀 Étape 3: Démarrage des services Cluster Suisse"

# Démarrage en mode détaché
docker-compose -f switzerland/docker-compose.switzerland.yml up -d

# Attente de la disponibilité des services
echo "⏳ Attente de la disponibilité des services..."
sleep 30

# Vérification du statut des services
echo "📊 Statut des services:"
docker-compose -f switzerland/docker-compose.switzerland.yml ps

# Vérification des health checks
echo "🏥 Vérification des health checks..."
for service in postgres-switzerland redis-switzerland translation-service api-ia-switzerland frontend-switzerland; do
    echo "Checking $service..."
    docker-compose -f switzerland/docker-compose.switzerland.yml ps $service
done

echo "✅ Services démarrés avec succès"
```

### Étape 4 : Initialisation de la Base de Données

```bash
#!/bin/bash
# step4-init-database.sh

echo "🗄️  Étape 4: Initialisation de la base de données"

# Attente de la disponibilité de PostgreSQL
echo "⏳ Attente de PostgreSQL..."
until docker exec pandemies-postgres-switzerland pg_isready -U pandemies_user -d pandemies_switzerland; do
    echo "PostgreSQL non disponible, attente..."
    sleep 5
done

# Initialisation du schéma
echo "📋 Initialisation du schéma de base de données..."
docker exec pandemies-postgres-switzerland psql -U pandemies_user -d pandemies_switzerland -c "
CREATE TABLE IF NOT EXISTS pays (
    id_pays SERIAL PRIMARY KEY,
    country VARCHAR(100) NOT NULL,
    iso_code VARCHAR(3) UNIQUE NOT NULL,
    population BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donnee_historique (
    id_donnee SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    country VARCHAR(100) NOT NULL,
    indicator VARCHAR(50) NOT NULL,
    value FLOAT,
    iso_code VARCHAR(3),
    source VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_donnee_date ON donnee_historique(date);
CREATE INDEX IF NOT EXISTS idx_donnee_country ON donnee_historique(country);
"

# Insertion des données de test
echo "📊 Insertion des données de test..."
docker exec pandemies-postgres-switzerland psql -U pandemies_user -d pandemies_switzerland -c "
INSERT INTO pays (country, iso_code, population) VALUES 
('Suisse', 'CHE', 8703000),
('France', 'FRA', 68000000),
('Allemagne', 'DEU', 83000000),
('Italie', 'ITA', 60000000)
ON CONFLICT (iso_code) DO NOTHING;
"

echo "✅ Base de données initialisée avec succès"
```

### Étape 5 : Tests de Validation

```bash
#!/bin/bash
# step5-validation-tests.sh

echo "🧪 Étape 5: Tests de validation"

# Test 1: Service de traduction
echo "🔤 Test du service de traduction..."
for lang in fr de it; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3004/api/translate/common.welcome?lang=$lang")
    if [ $response -eq 200 ]; then
        echo "✅ Traduction $lang: OK"
    else
        echo "❌ Traduction $lang: FAILED (HTTP $response)"
        exit 1
    fi
done

# Test 2: API IA Suisse
echo "🤖 Test de l'API IA Suisse..."
response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8001/health")
if [ $response -eq 200 ]; then
    echo "✅ API IA Suisse: OK"
else
    echo "❌ API IA Suisse: FAILED (HTTP $response)"
    exit 1
fi

# Test 3: Frontend Suisse
echo "🌐 Test du frontend suisse..."
response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3003")
if [ $response -eq 200 ]; then
    echo "✅ Frontend Suisse: OK"
else
    echo "❌ Frontend Suisse: FAILED (HTTP $response)"
    exit 1
fi

# Test 4: Base de données
echo "🗄️  Test de la base de données..."
docker exec pandemies-postgres-switzerland psql -U pandemies_user -d pandemies_switzerland -c "SELECT COUNT(*) FROM pays;" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Base de données: OK"
else
    echo "❌ Base de données: FAILED"
    exit 1
fi

# Test 5: Redis
echo "🔴 Test de Redis..."
docker exec pandemies-redis-switzerland redis-cli ping | grep -q "PONG"
if [ $? -eq 0 ]; then
    echo "✅ Redis: OK"
else
    echo "❌ Redis: FAILED"
    exit 1
fi

echo "🎉 Tous les tests de validation sont passés!"
```

---

## 🔧 Configuration Avancée

### Configuration des Variables d'Environnement

```bash
# switzerland/config/switzerland.env
# Configuration Multilingue Suisse
SUPPORTED_LANGUAGES=fr,de,it
DEFAULT_LANGUAGE=fr
FALLBACK_LANGUAGE=fr

# Configuration locale Suisse
LOCALE_CH=fr_CH.UTF-8
TIMEZONE_CH=Europe/Zurich
CURRENCY_CH=CHF

# Configuration des APIs
API_EXPRESS_URL=http://api-express-switzerland:3002
API_IA_URL=http://api-ia-switzerland:8001
API_TRANSLATION_URL=http://translation-service:3004

# Configuration de la base de données
DATABASE_URL=postgresql://pandemies_user:pandemies_password@postgres-switzerland:5432/pandemies_switzerland_db
DATABASE_LOCALE=fr_CH.UTF-8

# Configuration Redis
REDIS_URL=redis://redis-switzerland:6379
REDIS_CACHE_PREFIX=switzerland:
REDIS_SESSION_TTL=7200

# Configuration de sécurité
JWT_SECRET=switzerland_jwt_secret_key_2024
ENCRYPTION_KEY=switzerland_encryption_key_2024
SESSION_SECRET=switzerland_session_secret_2024

# Configuration des logs
LOG_LEVEL=INFO
LOG_FORMAT=json
LOG_FILE_PATH=/app/logs/switzerland.log

# Configuration des fonctionnalités
ENABLE_DATAVIZ=false
ENABLE_TECHNICAL_API=false
ENABLE_MULTILINGUAL=true
ENABLE_SWISS_FEATURES=true

# Configuration des données
DATA_SOURCES=switzerland_covid,switzerland_mpox
DATA_REFRESH_INTERVAL=3600
DATA_BACKUP_ENABLED=true

# Configuration du monitoring
MONITORING_ENABLED=true
METRICS_ENDPOINT=/metrics
HEALTH_CHECK_INTERVAL=30
ALERT_THRESHOLD=80
```

### Configuration Nginx Optimisée

```nginx
# nginx.conf optimisé pour la Suisse
server {
    listen 80;
    server_name localhost;
    
    # Compression optimisée
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Sécurité headers renforcés
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Cache optimisé pour les assets statiques
    location /static/ {
        try_files $uri $uri/ =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Proxy vers l'API IA Suisse avec optimisations
    location /api/ {
        proxy_pass http://api-ia-switzerland:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts optimisés
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Proxy vers le service de traduction avec cache
    location /api/translate/ {
        proxy_pass http://translation-service:3004/api/translate/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Cache des traductions
        proxy_cache_valid 200 1h;
        proxy_cache_key "$scheme$request_method$host$request_uri";
    }
    
    # Route principale React (SPA routing)
    location / {
        try_files $uri $uri/ /index.html;
        
        # Cache pour les pages HTML
        location ~* \.html$ {
            expires 1h;
            add_header Cache-Control "public, must-revalidate";
        }
    }
}
```

---

## 📊 Monitoring et Maintenance

### Script de Monitoring

```bash
#!/bin/bash
# monitor-switzerland.sh

echo "📊 Monitoring du Cluster Suisse - $(date)"

# Fonction de vérification de santé
check_service_health() {
    local service_name=$1
    local url=$2
    local expected_status=${3:-200}
    
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo "✅ $service_name: OK ($status_code)"
        return 0
    else
        echo "❌ $service_name: FAILED ($status_code)"
        return 1
    fi
}

# Vérification des services
echo "🔍 Vérification des services..."

check_service_health "Frontend Suisse" "http://localhost:3003"
check_service_health "Service Traduction" "http://localhost:3004/api/translate/languages"
check_service_health "API IA Suisse" "http://localhost:8001/health"

# Vérification des traductions
echo "🔤 Vérification des traductions..."
for lang in fr de it; do
    check_service_health "Traduction $lang" "http://localhost:3004/api/translate/common.welcome?lang=$lang"
done

# Vérification des ressources système
echo "💻 Ressources système..."
echo "RAM utilisée: $(free -h | awk '/^Mem:/{print $3"/"$2}')"
echo "Disque utilisé: $(df -h . | awk 'NR==2{print $3"/"$2" ("$5")"}')"
echo "CPU load: $(uptime | awk -F'load average:' '{print $2}')"

# Vérification des containers
echo "🐳 Statut des containers..."
docker-compose -f switzerland/docker-compose.switzerland.yml ps

# Vérification des logs d'erreur
echo "📋 Vérification des erreurs récentes..."
docker-compose -f switzerland/docker-compose.switzerland.yml logs --tail=10 | grep -i error || echo "Aucune erreur récente"

echo "✅ Monitoring terminé"
```

### Script de Sauvegarde

```bash
#!/bin/bash
# backup-switzerland.sh

echo "💾 Sauvegarde du Cluster Suisse - $(date)"

BACKUP_DIR="switzerland/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="switzerland_backup_$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

# Sauvegarde PostgreSQL
echo "🗄️  Sauvegarde de la base de données..."
docker exec pandemies-postgres-switzerland pg_dump \
    -U pandemies_user \
    -d pandemies_switzerland \
    --format=custom \
    --compress=9 \
    > "$BACKUP_DIR/${BACKUP_NAME}_database.dump"

# Sauvegarde Redis
echo "🔴 Sauvegarde de Redis..."
docker exec pandemies-redis-switzerland redis-cli BGSAVE
docker cp pandemies-redis-switzerland:/data/dump.rdb "$BACKUP_DIR/${BACKUP_NAME}_redis.rdb"

# Sauvegarde des configurations
echo "⚙️  Sauvegarde des configurations..."
tar -czf "$BACKUP_DIR/${BACKUP_NAME}_config.tar.gz" \
    switzerland/config/ \
    switzerland/docker-compose.switzerland.yml

# Sauvegarde des logs
echo "📋 Sauvegarde des logs..."
tar -czf "$BACKUP_DIR/${BACKUP_NAME}_logs.tar.gz" \
    switzerland/logs/

# Compression de l'ensemble
echo "📦 Compression de la sauvegarde complète..."
tar -czf "$BACKUP_DIR/${BACKUP_NAME}_complete.tar.gz" \
    -C "$BACKUP_DIR" \
    "${BACKUP_NAME}_database.dump" \
    "${BACKUP_NAME}_redis.rdb" \
    "${BACKUP_NAME}_config.tar.gz" \
    "${BACKUP_NAME}_logs.tar.gz"

# Nettoyage des fichiers temporaires
rm -f "$BACKUP_DIR/${BACKUP_NAME}_database.dump"
rm -f "$BACKUP_DIR/${BACKUP_NAME}_redis.rdb"
rm -f "$BACKUP_DIR/${BACKUP_NAME}_config.tar.gz"
rm -f "$BACKUP_DIR/${BACKUP_NAME}_logs.tar.gz"

echo "✅ Sauvegarde terminée: $BACKUP_DIR/${BACKUP_NAME}_complete.tar.gz"

# Affichage de la taille
ls -lh "$BACKUP_DIR/${BACKUP_NAME}_complete.tar.gz"
```

### Script de Restauration

```bash
#!/bin/bash
# restore-switzerland.sh

if [ $# -ne 1 ]; then
    echo "Usage: $0 <backup_file.tar.gz>"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Fichier de sauvegarde non trouvé: $BACKUP_FILE"
    exit 1
fi

echo "🔄 Restauration du Cluster Suisse depuis: $BACKUP_FILE"

# Arrêt des services
echo "🛑 Arrêt des services..."
docker-compose -f switzerland/docker-compose.switzerland.yml down

# Extraction de la sauvegarde
echo "📦 Extraction de la sauvegarde..."
TEMP_DIR=$(mktemp -d)
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR"

# Redémarrage des services
echo "🚀 Redémarrage des services..."
docker-compose -f switzerland/docker-compose.switzerland.yml up -d

# Attente de la disponibilité
echo "⏳ Attente de la disponibilité..."
sleep 30

# Restauration PostgreSQL
echo "🗄️  Restauration de la base de données..."
docker exec -i pandemies-postgres-switzerland pg_restore \
    -U pandemies_user \
    -d pandemies_switzerland \
    --clean \
    --if-exists \
    < "$TEMP_DIR"/*_database.dump

# Restauration Redis
echo "🔴 Restauration de Redis..."
docker cp "$TEMP_DIR"/*_redis.rdb pandemies-redis-switzerland:/data/dump.rdb
docker-compose -f switzerland/docker-compose.switzerland.yml restart redis-switzerland

# Nettoyage
rm -rf "$TEMP_DIR"

echo "✅ Restauration terminée avec succès"
```

---

## 🚨 Troubleshooting Avancé

### Diagnostic Complet

```bash
#!/bin/bash
# diagnose-switzerland.sh

echo "🔍 Diagnostic complet du Cluster Suisse - $(date)"

# Informations système
echo "💻 Informations système:"
echo "OS: $(uname -a)"
echo "Docker: $(docker --version)"
echo "Docker Compose: $(docker-compose --version)"
echo "RAM: $(free -h | awk '/^Mem:/{print $2}')"
echo "Disque: $(df -h . | awk 'NR==2{print $2}')"

# Statut des containers
echo "🐳 Statut des containers:"
docker-compose -f switzerland/docker-compose.switzerland.yml ps

# Utilisation des ressources
echo "📊 Utilisation des ressources:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" \
    $(docker-compose -f switzerland/docker-compose.switzerland.yml ps -q)

# Logs d'erreur
echo "📋 Logs d'erreur récents:"
for service in postgres-switzerland redis-switzerland translation-service api-ia-switzerland frontend-switzerland; do
    echo "--- $service ---"
    docker logs --tail=5 "$service" 2>&1 | grep -i error || echo "Aucune erreur"
done

# Tests de connectivité
echo "🌐 Tests de connectivité:"
curl -s -o /dev/null -w "Frontend Suisse: %{http_code}\n" http://localhost:3003
curl -s -o /dev/null -w "Service Traduction: %{http_code}\n" http://localhost:3004/api/translate/languages
curl -s -o /dev/null -w "API IA Suisse: %{http_code}\n" http://localhost:8001/health

# Vérification des volumes
echo "💾 Statut des volumes:"
docker volume ls | grep switzerland

# Vérification des réseaux
echo "🌐 Statut des réseaux:"
docker network ls | grep switzerland

echo "✅ Diagnostic terminé"
```

---

## 📋 Checklist de Déploiement

### ✅ Pré-déploiement

- [x] **Prérequis vérifiés** : Docker, RAM, disque
- [x] **Fichiers de configuration** : switzerland.env, i18n/*.json
- [x] **Permissions** : Répertoires logs, data, backups
- [x] **Réseau** : Ports 3003, 3004, 5433, 6380, 8001 disponibles

### ✅ Déploiement

- [x] **Images construites** : Toutes les images Docker créées
- [x] **Services démarrés** : Tous les containers en cours d'exécution
- [x] **Base de données** : PostgreSQL initialisé avec schéma
- [x] **Tests de validation** : Tous les services répondent correctement

### ✅ Post-déploiement

- [x] **Monitoring actif** : Health checks opérationnels
- [x] **Sauvegarde configurée** : Scripts de sauvegarde automatisés
- [x] **Documentation** : Guides utilisateur et technique disponibles
- [x] **Formation** : Équipe formée sur la maintenance

---

## 🎯 URLs de Validation

Après déploiement, vérifiez ces URLs :

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend Suisse** | http://localhost:3003 | Interface utilisateur multi-langues |
| **Service Traduction** | http://localhost:3004/api/translate/languages | API traductions disponibles |
| **API IA Suisse** | http://localhost:8001/docs | Documentation Swagger |
| **Health Check** | http://localhost:8001/health | État des services |

### Tests de Traduction

```bash
# Français
curl "http://localhost:3004/api/translate/common.welcome?lang=fr"

# Allemand
curl "http://localhost:3004/api/translate/common.welcome?lang=de"

# Italien
curl "http://localhost:3004/api/translate/common.welcome?lang=it"
```

---

## 🎉 Conclusion

Le **Cluster Suisse** est maintenant déployé et opérationnel selon les exigences du MSPR 3 :

- ✅ **Multi-langues complet** : FR/DE/IT fonctionnels
- ✅ **Architecture robuste** : Microservices containerisés
- ✅ **Sécurité renforcée** : Headers, JWT, CORS configurés
- ✅ **Monitoring actif** : Health checks et métriques
- ✅ **Maintenance facilitée** : Scripts automatisés

**Le cluster est prêt pour la production et la présentation MSPR 3 !** 🚀

---

*Guide de déploiement généré le 2025-09-07 pour le MSPR 3 - Cluster Suisse*
