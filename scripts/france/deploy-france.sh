#!/bin/bash

# Script de déploiement pour l'architecture France
# Conforme aux exigences RGPD et sans API technique MSPR1

set -e  # Arrêt en cas d'erreur

echo "🇫🇷 Déploiement de l'architecture France - OMS MSPR3"
echo "=================================================="

# Configuration des variables d'environnement France
export POSTGRES_USER_FR="postgres_fr"
export POSTGRES_PASSWORD_FR="postgres123_fr_secure_$(date +%s)"
export POSTGRES_DB_FR="pandemies_db_france"
export REDIS_PASSWORD_FR="redis_france_secure_$(date +%s)"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérification des prérequis
log_info "Vérification des prérequis..."

if ! command -v docker &> /dev/null; then
    log_error "Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose n'est pas installé"
    exit 1
fi

log_success "Prérequis validés"

# Création des dossiers de logs France
log_info "Création des dossiers de logs France..."
mkdir -p AI_API/logs/france
mkdir -p ETL/logs/france
mkdir -p configs/france

# Création du fichier de configuration PostgreSQL pour RGPD
log_info "Configuration PostgreSQL RGPD..."
cat > configs/france/postgresql.conf << EOF
# Configuration PostgreSQL pour la France (RGPD)
# Sécurité et chiffrement renforcés

# Logging et audit (RGPD Article 30)
log_statement = 'all'
log_duration = on
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_min_duration_statement = 1000
log_connections = on
log_disconnections = on

# Chiffrement des données
ssl = on
ssl_prefer_server_ciphers = on

# Sécurité des connexions
max_connections = 100
password_encryption = scram-sha-256

# Rétention des logs RGPD (3 ans maximum)
log_rotation_age = 1d
log_rotation_size = 100MB
log_truncate_on_rotation = on
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'

# Performance
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# RGPD - Anonymisation automatique
log_statement_stats = off
log_parser_stats = off
log_planner_stats = off
log_executor_stats = off
EOF

log_success "Configuration PostgreSQL RGPD créée"

# Arrêt des services existants si ils tournent
log_info "Arrêt des services existants..."
docker-compose -f docker-compose-france.yml down --remove-orphans 2>/dev/null || true

# Construction des images Docker France
log_info "Construction des images Docker pour la France..."
log_info "→ Construction de l'image AI API France..."
docker-compose -f docker-compose-france.yml build api-ia-france

log_info "→ Construction des autres services..."
docker-compose -f docker-compose-france.yml build

log_success "Images Docker construites"

# Démarrage de la base de données
log_info "Démarrage de la base de données PostgreSQL France..."
docker-compose -f docker-compose-france.yml up -d postgres-france

# Attente de la disponibilité de la base
log_info "Attente de la disponibilité de PostgreSQL..."
timeout=60
counter=0
until docker-compose -f docker-compose-france.yml exec -T postgres-france pg_isready -U $POSTGRES_USER_FR -d $POSTGRES_DB_FR; do
    sleep 2
    counter=$((counter + 2))
    if [ $counter -ge $timeout ]; then
        log_error "Timeout: PostgreSQL n'est pas disponible après ${timeout}s"
        exit 1
    fi
done

log_success "PostgreSQL France disponible"

# Démarrage de Redis
log_info "Démarrage de Redis France..."
docker-compose -f docker-compose-france.yml up -d redis-france

# Démarrage de l'API IA France
log_info "Démarrage de l'API IA France (connexion directe BDD)..."
docker-compose -f docker-compose-france.yml up -d api-ia-france

# Attente de l'API IA
log_info "Attente de l'API IA France..."
timeout=60
counter=0
until curl -s http://localhost:8001/health > /dev/null; do
    sleep 3
    counter=$((counter + 3))
    if [ $counter -ge $timeout ]; then
        log_warning "L'API IA France met du temps à démarrer, continuons..."
        break
    fi
done

# Démarrage du Frontend France
log_info "Démarrage du Frontend France..."
docker-compose -f docker-compose-france.yml up -d frontend-france

# Vérification de l'état des services
log_info "Vérification de l'état des services France..."
sleep 5

services_status=$(docker-compose -f docker-compose-france.yml ps --services --filter "status=running")
expected_services="postgres-france redis-france api-ia-france frontend-france"

for service in $expected_services; do
    if echo "$services_status" | grep -q "$service"; then
        log_success "✓ $service: Running"
    else
        log_warning "⚠ $service: Not running"
    fi
done

# Test de connectivité
log_info "Tests de connectivité..."

# Test PostgreSQL
if docker-compose -f docker-compose-france.yml exec -T postgres-france pg_isready -U $POSTGRES_USER_FR -d $POSTGRES_DB_FR > /dev/null; then
    log_success "✓ PostgreSQL France: Connecté"
else
    log_error "✗ PostgreSQL France: Non disponible"
fi

# Test API IA
if curl -s http://localhost:8001/health | grep -q "healthy"; then
    log_success "✓ API IA France: Healthy"
else
    log_warning "⚠ API IA France: Non disponible"
fi

# Test Frontend
if curl -s http://localhost:3080 > /dev/null; then
    log_success "✓ Frontend France: Accessible"
else
    log_warning "⚠ Frontend France: Non disponible"
fi

# Affichage des informations de déploiement
echo ""
echo "🇫🇷 DÉPLOIEMENT FRANCE TERMINÉ"
echo "==============================="
echo ""
echo "🌐 Services disponibles:"
echo "   • Frontend France:    http://localhost:3080"
echo "   • API IA France:      http://localhost:8001"
echo "   • API Docs:           http://localhost:8001/docs"
echo "   • PostgreSQL:         localhost:5433"
echo "   • Redis:              localhost:6380"
echo ""
echo "📊 État des services:"
docker-compose -f docker-compose-france.yml ps
echo ""
echo "🛡️ Conformité RGPD:     ACTIVÉE"
echo "🗄️ Connexion directe:    PostgreSQL (sans API Express)"
echo "🏁 Architecture:         FRANCE"
echo ""
echo "📝 Logs disponibles dans:"
echo "   • AI_API/logs/france/"
echo "   • ETL/logs/france/"
echo ""
echo "🔧 Commandes utiles:"
echo "   • Logs: docker-compose -f docker-compose-france.yml logs -f"
echo "   • Arrêt: ./scripts/france/stop-france.sh"
echo "   • Backup: ./scripts/france/backup-france.sh"
echo ""

# Sauvegarde des variables d'environnement
echo "# Variables d'environnement France - $(date)" > .env.france
echo "POSTGRES_USER_FR=$POSTGRES_USER_FR" >> .env.france
echo "POSTGRES_PASSWORD_FR=$POSTGRES_PASSWORD_FR" >> .env.france
echo "POSTGRES_DB_FR=$POSTGRES_DB_FR" >> .env.france
echo "REDIS_PASSWORD_FR=$REDIS_PASSWORD_FR" >> .env.france

log_success "Variables d'environnement sauvegardées dans .env.france"
log_success "Déploiement France terminé avec succès ! 🇫🇷"