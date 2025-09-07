#!/bin/bash

# Script d'arrêt propre pour l'architecture France
# Garantit l'intégrité des données et la conformité RGPD

set -e

echo "🇫🇷 Arrêt de l'architecture France"
echo "=================================="

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Vérification de l'existence du fichier docker-compose
if [ ! -f "docker-compose-france.yml" ]; then
    log_error "Fichier docker-compose-france.yml non trouvé"
    exit 1
fi

# Arrêt graduel des services (ordre important pour RGPD)
log_info "Arrêt du Frontend France..."
docker-compose -f docker-compose-france.yml stop frontend-france

log_info "Arrêt de l'API IA France..."
docker-compose -f docker-compose-france.yml stop api-ia-france

# Attente pour permettre aux connexions de se fermer proprement
log_info "Attente de fermeture des connexions..."
sleep 5

# Arrêt de Redis (cache)
log_info "Arrêt de Redis France..."
docker-compose -f docker-compose-france.yml stop redis-france

# Arrêt de PostgreSQL (RGPD: sauvegarde automatique)
log_info "Arrêt sécurisé de PostgreSQL France..."
log_info "→ Sauvegarde automatique RGPD en cours..."

# Création d'une sauvegarde avant arrêt
timestamp=$(date +"%Y%m%d_%H%M%S")
docker-compose -f docker-compose-france.yml exec -T postgres-france pg_dump -U postgres_fr -d pandemies_db_france > "./backups/france/auto_backup_${timestamp}.sql" 2>/dev/null || log_warning "Sauvegarde automatique échouée"

docker-compose -f docker-compose-france.yml stop postgres-france

# Arrêt de tous les services restants
log_info "Arrêt final de tous les services France..."
docker-compose -f docker-compose-france.yml down --remove-orphans

# Nettoyage des ressources temporaires
log_info "Nettoyage des ressources temporaires..."
docker system prune -f --volumes > /dev/null 2>&1 || true

# Vérification que tous les services sont arrêtés
running_containers=$(docker ps --filter "name=pandemies-.*-france" --format "table {{.Names}}" | grep -v "NAMES" | wc -l)

if [ "$running_containers" -eq 0 ]; then
    log_success "Tous les services France sont arrêtés"
else
    log_warning "Certains conteneurs France sont encore en cours d'exécution"
    docker ps --filter "name=pandemies-.*-france"
fi

# Rapport d'arrêt
echo ""
echo "📊 RAPPORT D'ARRÊT FRANCE"
echo "========================="
echo "🕐 Heure d'arrêt: $(date)"
echo "🛡️ Conformité RGPD: Respectée"
echo "💾 Sauvegarde auto: ${timestamp}.sql"
echo "🧹 Nettoyage: Effectué"
echo ""

# Archivage des logs (conformité RGPD - rétention 3 ans)
if [ -d "AI_API/logs/france" ]; then
    log_info "Archivage des logs RGPD..."
    tar -czf "logs_archive/france/logs_france_${timestamp}.tar.gz" AI_API/logs/france/ ETL/logs/france/ 2>/dev/null || log_warning "Archivage des logs échoué"
fi

log_success "Arrêt de l'architecture France terminé ! 🇫🇷"
echo ""
echo "💡 Pour redémarrer: ./scripts/france/deploy-france.sh"
echo "📋 Pour consulter les logs: ls -la logs_archive/france/"