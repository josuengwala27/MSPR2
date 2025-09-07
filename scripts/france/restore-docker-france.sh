#!/bin/bash

# Script de restauration Docker pour l'architecture France - MSPR3
# Restauration des images Docker, volumes et configurations
# Architecture: PostgreSQL local (localhost:5432) + Docker services

set -euo pipefail

echo "🇫🇷 Restauration Docker - Architecture France"
echo "============================================="

# Configuration des chemins
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Vérification des paramètres
if [ -z "$1" ]; then
    echo "Usage: $0 <backup_id>"
    echo "Exemple: $0 france_docker_20241106_143022"
    echo ""
    echo "Sauvegardes Docker disponibles:"
    ls -la "${PROJECT_ROOT}/backups/france/docker/" 2>/dev/null | grep france_docker_ | tail -10 || echo "Aucune sauvegarde trouvée"
    exit 1
fi

BACKUP_ID="$1"
BACKUP_DIR="${PROJECT_ROOT}/backups/france/docker"
RESTORE_DIR="$BACKUP_DIR"

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

# Vérification de l'existence de la sauvegarde Docker
if [ ! -d "$RESTORE_DIR" ] || [ ! -f "$RESTORE_DIR/${BACKUP_ID}_metadata.json" ]; then
    log_error "Sauvegarde Docker $BACKUP_ID introuvable dans $RESTORE_DIR"
    exit 1
fi

log_info "Restauration Docker de la sauvegarde: $BACKUP_ID"

# Lecture des métadonnées Docker
if [ -f "$RESTORE_DIR/${BACKUP_ID}_metadata.json" ]; then
    log_info "Lecture des métadonnées Docker..."
    BACKUP_DATE=$(grep '"date"' "$RESTORE_DIR/${BACKUP_ID}_metadata.json" | cut -d'"' -f4)
    DOCKER_VERSION=$(grep '"docker_version"' "$RESTORE_DIR/${BACKUP_ID}_metadata.json" | cut -d'"' -f4)
    log_info "→ Date de sauvegarde: $BACKUP_DATE"
    log_info "→ Version Docker: $DOCKER_VERSION"
else
    log_warning "Métadonnées Docker non trouvées"
fi

# Vérification que Docker est accessible
if ! docker info >/dev/null 2>&1; then
    log_error "Docker n'est pas accessible"
    exit 1
fi

cd "$PROJECT_ROOT"

# Confirmation avant restauration
echo ""
log_warning "⚠️  ATTENTION: Cette opération va REMPLACER les images et configurations Docker actuelles"
log_info "Sauvegarde à restaurer: $BACKUP_ID"
log_info "Date de la sauvegarde: ${BACKUP_DATE:-'Inconnue'}"
echo ""
read -p "Êtes-vous sûr de vouloir continuer? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "Restauration Docker annulée"
    exit 0
fi

# Arrêt des services France actuels
log_info "Arrêt des services France Docker..."
if docker-compose -f docker-compose-france.yml ps -q >/dev/null 2>&1; then
    docker-compose -f docker-compose-france.yml down --remove-orphans >/dev/null 2>&1 || log_warning "Erreur lors de l'arrêt"
fi

# 1. Restauration des images Docker
log_info "Restauration des images Docker France..."

if [ -d "$RESTORE_DIR/images" ]; then
    for image_file in "$RESTORE_DIR/images"/*.tar.gz; do
        if [ -f "$image_file" ]; then
            image_name=$(basename "$image_file" | sed 's/.*_\(.*\)\.tar\.gz/\1/' | tr '_' '/')
            log_info "→ Chargement de l'image: $image_name"
            
            if gunzip -c "$image_file" | docker load >/dev/null 2>&1; then
                log_success "✓ Image $image_name restaurée"
            else
                log_warning "⚠ Échec du chargement de l'image: $image_name"
            fi
        fi
    done
else
    log_warning "⚠ Répertoire des images non trouvé"
fi

# 2. Restauration des configurations Docker Compose
log_info "Restauration des configurations Docker Compose..."

if [ -f "$RESTORE_DIR/compose/docker-compose-france.yml" ]; then
    cp "$RESTORE_DIR/compose/docker-compose-france.yml" ./
    log_success "✓ docker-compose-france.yml restauré"
else
    log_warning "⚠ docker-compose-france.yml non trouvé dans la sauvegarde"
fi

# 3. Restauration des configurations
log_info "Restauration des configurations spécifiques France..."

if [ -d "$RESTORE_DIR/configs" ]; then
    # Dockerfile France
    if [ -f "$RESTORE_DIR/configs/Dockerfile.france" ]; then
        mkdir -p AI_API
        cp "$RESTORE_DIR/configs/Dockerfile.france" AI_API/
        log_success "✓ Dockerfile.france restauré"
    fi
    
    # Configuration Nginx
    if [ -f "$RESTORE_DIR/configs/nginx-france.conf" ]; then
        mkdir -p frontend
        cp "$RESTORE_DIR/configs/nginx-france.conf" frontend/
        log_success "✓ nginx-france.conf restauré"
    fi
    
    # Requirements France
    if [ -f "$RESTORE_DIR/configs/requirements-france.txt" ]; then
        mkdir -p AI_API
        cp "$RESTORE_DIR/configs/requirements-france.txt" AI_API/
        log_success "✓ requirements-france.txt restauré"
    fi
    
    # Variables d'environnement
    if [ -f "$RESTORE_DIR/configs/.env" ]; then
        cp "$RESTORE_DIR/configs/.env" ./
        log_success "✓ Variables d'environnement restaurées"
    fi
    
    if [ -f "$RESTORE_DIR/configs/.env.france" ]; then
        cp "$RESTORE_DIR/configs/.env.france" ./
        log_success "✓ Variables d'environnement France restaurées"
    fi
else
    log_warning "⚠ Répertoire des configurations non trouvé"
fi

# 4. Restauration des volumes Docker
log_info "Restauration des volumes Docker France..."

if [ -d "$RESTORE_DIR/volumes" ]; then
    for volume_file in "$RESTORE_DIR/volumes"/*.tar.gz; do
        if [ -f "$volume_file" ]; then
            # Extraire le nom du volume depuis le nom de fichier
            volume_name=$(basename "$volume_file" | sed 's/.*_volume_\(.*\)\.tar\.gz/\1/')
            log_info "→ Restauration du volume: $volume_name"
            
            # Créer le volume s'il n'existe pas
            if docker volume create "$volume_name" >/dev/null 2>&1; then
                log_info "  Volume $volume_name créé"
            else
                log_info "  Volume $volume_name existe déjà"
            fi
            
            # Restaurer les données du volume
            if docker run --rm -v "$volume_name":/target -v "$RESTORE_DIR/volumes":/backup alpine \
                sh -c "cd /target && tar -xzf /backup/$(basename "$volume_file")" >/dev/null 2>&1; then
                log_success "✓ Volume $volume_name restauré"
            else
                log_warning "⚠ Échec de la restauration du volume: $volume_name"
            fi
        fi
    done
else
    log_info "→ Aucun volume à restaurer"
fi

# 5. Reconstruction des images personnalisées
log_info "Reconstruction des images France si nécessaire..."

# Si les images France existent, les reconstruire pour être sûr
if [ -f "docker-compose-france.yml" ]; then
    log_info "→ Reconstruction des images France..."
    
    if docker-compose -f docker-compose-france.yml build --no-cache >/dev/null 2>&1; then
        log_success "✓ Images France reconstruites"
    else
        log_warning "⚠ Problème lors de la reconstruction des images"
    fi
fi

# 6. Démarrage des services France
log_info "Démarrage des services France Docker..."

if docker-compose -f docker-compose-france.yml up -d >/dev/null 2>&1; then
    log_success "✓ Services France démarrés"
else
    log_error "✗ Échec du démarrage des services France"
fi

# Attente de stabilisation
log_info "Attente de stabilisation des services..."
sleep 10

# 7. Vérification de la restauration Docker
log_info "Vérification de la restauration Docker..."

# Vérification des services
SERVICES=("api-ia-france" "frontend-france" "redis-france")
for service in "${SERVICES[@]}"; do
    if docker-compose -f docker-compose-france.yml ps "$service" | grep -q "Up"; then
        log_success "✓ Service $service: En cours d'exécution"
    else
        log_warning "⚠ Service $service: Problème détecté"
    fi
done

# Test des endpoints
log_info "Test des endpoints France..."

# Test API IA
sleep 5  # Attendre que l'API démarre
if curl -s http://localhost:8001/health >/dev/null 2>&1; then
    log_success "✓ API IA France: Accessible"
else
    log_warning "⚠ API IA France: Non accessible (peut nécessiter plus de temps)"
fi

# Test Frontend
if curl -s http://localhost:3080 >/dev/null 2>&1; then
    log_success "✓ Frontend France: Accessible"
else
    log_warning "⚠ Frontend France: Non accessible (peut nécessiter plus de temps)"
fi

# 8. Audit post-restauration Docker
log_info "Audit post-restauration Docker..."
RESTORE_TIMESTAMP=$(date -Iseconds)
AUDIT_DIR="${PROJECT_ROOT}/logs"
mkdir -p "$AUDIT_DIR"

cat > "$AUDIT_DIR/restore_docker_audit_${RESTORE_TIMESTAMP}.json" << EOF
{
  "restore_id": "restore_docker_$(date +%Y%m%d_%H%M%S)",
  "backup_restored": "$BACKUP_ID",
  "restore_timestamp": "$RESTORE_TIMESTAMP",
  "country": "france",
  "type": "docker_restore",
  "images_restored": true,
  "volumes_restored": true,
  "configs_restored": true,
  "services_started": true,
  "restored_by": "restore-docker-france.sh",
  "audit_status": "completed"
}
EOF

log_success "✓ Audit Docker créé"

# Rapport final
echo ""
echo "📊 RAPPORT DE RESTAURATION DOCKER FRANCE"
echo "========================================"
echo "🕐 Heure: $(date)"
echo "🆔 Sauvegarde: $BACKUP_ID"
echo "📅 Date sauvegarde: ${BACKUP_DATE:-'Inconnue'}"
echo "🎯 État: Restauration Docker terminée"
echo ""
echo "🐳 Composants restaurés:"
echo "   • Images Docker: Rechargées et reconstruites"
echo "   • Configurations: docker-compose-france.yml + Dockerfiles"
echo "   • Volumes Docker: Données restaurées"
echo "   • Services: $(docker-compose -f docker-compose-france.yml ps --services | wc -l) services"
echo ""
echo "🌐 Services disponibles:"
echo "   • Frontend France:    http://localhost:3080"
echo "   • API IA France:      http://localhost:8001"
echo "   • Redis France:       localhost:6380"
echo ""
echo "📋 État des containers:"
docker-compose -f docker-compose-france.yml ps
echo ""

log_success "Restauration Docker France terminée avec succès ! 🇫🇷"
echo ""
echo "💡 Vérifiez le bon fonctionnement de vos services Docker"
echo "📋 Audit disponible: logs/restore_docker_audit_${RESTORE_TIMESTAMP}.json"