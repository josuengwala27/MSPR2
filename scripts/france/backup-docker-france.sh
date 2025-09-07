#!/bin/bash

# Script de sauvegarde Docker pour l'architecture France - MSPR3
# Sauvegarde des images Docker, volumes et configurations
# Architecture: PostgreSQL local (localhost:5432) + Docker services

set -euo pipefail

echo "🇫🇷 Sauvegarde Docker - Architecture France"
echo "==========================================="

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BACKUP_DIR="${PROJECT_ROOT}/backups/france/docker"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PREFIX="france_docker_${TIMESTAMP}"

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

# Création du répertoire de sauvegarde
mkdir -p "$BACKUP_DIR"
mkdir -p "$BACKUP_DIR/images"
mkdir -p "$BACKUP_DIR/volumes"
mkdir -p "$BACKUP_DIR/configs"
mkdir -p "$BACKUP_DIR/compose"

log_info "Démarrage de la sauvegarde Docker France..."

# Vérification que Docker est accessible
if ! docker info >/dev/null 2>&1; then
    log_error "Docker n'est pas accessible"
    exit 1
fi

cd "$PROJECT_ROOT"

# 1. Sauvegarde des images Docker France
log_info "Sauvegarde des images Docker France..."

# Liste des images France à sauvegarder
FRANCE_IMAGES=(
    "pandemies-api-ia-france"
    "pandemies-frontend-france"
    "redis:7-alpine"
)

for image in "${FRANCE_IMAGES[@]}"; do
    log_info "→ Sauvegarde de l'image: $image"
    
    # Vérifier si l'image existe
    if docker image inspect "$image" >/dev/null 2>&1; then
        # Sauvegarder l'image
        docker save "$image" | gzip > "$BACKUP_DIR/images/${BACKUP_PREFIX}_${image//[\/:]/_}.tar.gz"
        
        # Récupérer les métadonnées de l'image
        docker image inspect "$image" > "$BACKUP_DIR/images/${BACKUP_PREFIX}_${image//[\/:]/_}_metadata.json"
        
        log_success "✓ Image $image sauvegardée"
    else
        log_warning "⚠ Image $image non trouvée"
    fi
done

# 2. Sauvegarde des volumes Docker
log_info "Sauvegarde des volumes Docker France..."

# Obtenir la liste des volumes utilisés par docker-compose-france.yml
if [ -f "docker-compose-france.yml" ]; then
    # Obtenir les volumes depuis les containers en cours d'exécution
    FRANCE_VOLUMES=$(docker-compose -f docker-compose-france.yml config --volumes 2>/dev/null || true)
    
    if [ -n "$FRANCE_VOLUMES" ]; then
        for volume in $FRANCE_VOLUMES; do
            log_info "→ Sauvegarde du volume: $volume"
            
            # Créer un container temporaire pour sauvegarder le volume
            if docker run --rm -v "$volume":/source alpine sh -c "test -d /source" 2>/dev/null; then
                docker run --rm -v "$volume":/source -v "$BACKUP_DIR/volumes":/backup alpine \
                    tar -czf "/backup/${BACKUP_PREFIX}_volume_${volume}.tar.gz" -C /source . 2>/dev/null
                
                log_success "✓ Volume $volume sauvegardé"
            else
                log_warning "⚠ Volume $volume non trouvé ou vide"
            fi
        done
    else
        log_info "→ Aucun volume spécifique France trouvé"
    fi
fi

# 3. Sauvegarde des configurations Docker Compose
log_info "Sauvegarde des configurations Docker Compose..."

# docker-compose-france.yml
if [ -f "docker-compose-france.yml" ]; then
    cp "docker-compose-france.yml" "$BACKUP_DIR/compose/"
    log_success "✓ docker-compose-france.yml sauvegardé"
fi

# Dockerfile spécifiques France
if [ -f "AI_API/Dockerfile.france" ]; then
    cp "AI_API/Dockerfile.france" "$BACKUP_DIR/configs/"
    log_success "✓ Dockerfile.france sauvegardé"
fi

# Configuration Nginx France
if [ -f "frontend/nginx-france.conf" ]; then
    cp "frontend/nginx-france.conf" "$BACKUP_DIR/configs/"
    log_success "✓ nginx-france.conf sauvegardé"
fi

# Requirements France
if [ -f "AI_API/requirements-france.txt" ]; then
    cp "AI_API/requirements-france.txt" "$BACKUP_DIR/configs/"
    log_success "✓ requirements-france.txt sauvegardé"
fi

# Variables d'environnement
if [ -f ".env" ]; then
    cp ".env" "$BACKUP_DIR/configs/" 2>/dev/null || log_warning "Variables d'environnement non copiées"
fi
if [ -f ".env.france" ]; then
    cp ".env.france" "$BACKUP_DIR/configs/" 2>/dev/null || log_warning ".env.france non trouvé"
fi

# 4. Sauvegarde des networks Docker
log_info "Sauvegarde des réseaux Docker France..."
docker network ls --filter name=france --format "{{.Name}}" > "$BACKUP_DIR/configs/${BACKUP_PREFIX}_networks.txt" 2>/dev/null || true

# Obtenir les détails des réseaux France
docker-compose -f docker-compose-france.yml config --services 2>/dev/null | while read service; do
    if [ -n "$service" ]; then
        echo "Service: $service" >> "$BACKUP_DIR/configs/${BACKUP_PREFIX}_networks_details.txt"
    fi
done 2>/dev/null || true

# 5. Sauvegarde de l'état des containers
log_info "Sauvegarde de l'état des containers France..."

# État des containers France
docker-compose -f docker-compose-france.yml ps > "$BACKUP_DIR/${BACKUP_PREFIX}_containers_status.txt" 2>/dev/null || true

# Logs des containers France (dernières 1000 lignes)
log_info "→ Sauvegarde des logs containers"
for service in api-ia-france frontend-france redis-france; do
    if docker-compose -f docker-compose-france.yml ps -q "$service" >/dev/null 2>&1; then
        docker-compose -f docker-compose-france.yml logs --tail=1000 --no-color "$service" > "$BACKUP_DIR/${BACKUP_PREFIX}_logs_${service}.txt" 2>/dev/null || true
        log_success "✓ Logs $service sauvegardés"
    fi
done

# 6. Informations système Docker
log_info "Sauvegarde des informations système..."

# Version Docker
docker version > "$BACKUP_DIR/${BACKUP_PREFIX}_docker_version.txt" 2>/dev/null || true
docker-compose version > "$BACKUP_DIR/${BACKUP_PREFIX}_docker_compose_version.txt" 2>/dev/null || true

# Statistiques d'utilisation
docker system df > "$BACKUP_DIR/${BACKUP_PREFIX}_docker_usage.txt" 2>/dev/null || true

# 7. Métadonnées de sauvegarde Docker
log_info "Création des métadonnées Docker..."
cat > "$BACKUP_DIR/${BACKUP_PREFIX}_metadata.json" << EOF
{
  "backup_id": "${BACKUP_PREFIX}",
  "timestamp": "${TIMESTAMP}",
  "date": "$(date -Iseconds)",
  "type": "docker_backup",
  "country": "france",
  "architecture": "postgresql_local_docker_services",
  "docker_version": "$(docker version --format '{{.Server.Version}}' 2>/dev/null || echo 'unknown')",
  "compose_version": "$(docker-compose version --short 2>/dev/null || echo 'unknown')",
  "images_saved": [
    $(printf '"%s",' "${FRANCE_IMAGES[@]}" | sed 's/,$//')
  ],
  "services": [
    "api-ia-france",
    "frontend-france", 
    "redis-france"
  ],
  "configs_included": {
    "docker_compose": "docker-compose-france.yml",
    "dockerfile": "AI_API/Dockerfile.france",
    "nginx": "frontend/nginx-france.conf",
    "requirements": "AI_API/requirements-france.txt"
  },
  "created_by": "backup-docker-france.sh",
  "restore_instructions": "use restore-docker-france.sh script"
}
EOF

# 8. Script de restauration automatique Docker
log_info "Création du script de restauration Docker..."
cat > "$BACKUP_DIR/${BACKUP_PREFIX}_restore_docker.sh" << 'EOF'
#!/bin/bash

# Script de restauration automatique Docker France
# Généré automatiquement lors de la sauvegarde

set -e

BACKUP_ID="$(basename "$(dirname "$0")" | cut -d'_' -f3-4)"
BACKUP_DIR="$(dirname "$0")"

echo "🇫🇷 Restauration Docker France - $BACKUP_ID"
echo "==========================================="

# Restauration des images
echo "Restauration des images Docker..."
for image_file in "$BACKUP_DIR/images"/*.tar.gz; do
    if [ -f "$image_file" ]; then
        echo "→ Chargement: $(basename "$image_file")"
        gunzip -c "$image_file" | docker load
    fi
done

# Restauration des configurations
echo "Restauration des configurations..."
if [ -f "$BACKUP_DIR/compose/docker-compose-france.yml" ]; then
    cp "$BACKUP_DIR/compose/docker-compose-france.yml" ./
    echo "✓ docker-compose-france.yml restauré"
fi

# Restauration des volumes
echo "Restauration des volumes..."
for volume_file in "$BACKUP_DIR/volumes"/*.tar.gz; do
    if [ -f "$volume_file" ]; then
        volume_name=$(basename "$volume_file" | sed 's/.*_volume_\(.*\)\.tar\.gz/\1/')
        echo "→ Restauration volume: $volume_name"
        
        # Créer le volume s'il n'existe pas
        docker volume create "$volume_name" || true
        
        # Restaurer les données
        docker run --rm -v "$volume_name":/target -v "$BACKUP_DIR/volumes":/backup alpine \
            sh -c "cd /target && tar -xzf /backup/$(basename "$volume_file")"
    fi
done

echo "✅ Restauration Docker France terminée"
echo "💡 Redémarrez les services avec: docker-compose -f docker-compose-france.yml up -d"
EOF

chmod +x "$BACKUP_DIR/${BACKUP_PREFIX}_restore_docker.sh"
log_success "✓ Script de restauration Docker créé"

# 9. Compression et optimisation
log_info "Optimisation de la sauvegarde..."

# Création d'une archive complète (optionnel)
ARCHIVE_PATH="${BACKUP_DIR}/../${BACKUP_PREFIX}_complete.tar.gz"
cd "$BACKUP_DIR"
tar -czf "$ARCHIVE_PATH" ./* 2>/dev/null || log_warning "Échec de la création de l'archive complète"

if [ -f "$ARCHIVE_PATH" ]; then
    log_success "✓ Archive complète créée: $(basename "$ARCHIVE_PATH")"
fi

# 10. Nettoyage des anciennes sauvegardes Docker (rétention 30 jours)
log_info "Nettoyage des anciennes sauvegardes Docker..."
find "${PROJECT_ROOT}/backups/france/docker" -name "france_docker_*" -mtime +30 -exec rm -rf {} \; 2>/dev/null || true

# Vérification des tailles
log_info "Calcul des tailles de sauvegarde..."
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

# Rapport final
echo ""
echo "📊 RAPPORT DE SAUVEGARDE DOCKER FRANCE"
echo "======================================"
echo "🕐 Heure: $(date)"
echo "🆔 ID: $BACKUP_PREFIX"
echo "📁 Dossier: $BACKUP_DIR"
echo "💾 Taille: $BACKUP_SIZE"
echo ""
echo "🐳 Composants sauvegardés:"
echo "   • Images Docker: ${#FRANCE_IMAGES[@]} images"
echo "   • Configurations: docker-compose-france.yml + Dockerfiles"
echo "   • Volumes Docker: $(ls -1 "$BACKUP_DIR/volumes"/*.tar.gz 2>/dev/null | wc -l || echo 0) volumes"
echo "   • Logs containers: Dernières 1000 lignes par service"
echo "   • Métadonnées: État système Docker"
echo ""
echo "📦 Fichiers créés:"
echo "   • Images: images/*.tar.gz"
echo "   • Volumes: volumes/*.tar.gz"  
echo "   • Configs: configs/*"
echo "   • Métadonnées: ${BACKUP_PREFIX}_metadata.json"
echo "   • Restauration: ${BACKUP_PREFIX}_restore_docker.sh"
if [ -f "$ARCHIVE_PATH" ]; then
echo "   • Archive complète: $(basename "$ARCHIVE_PATH")"
fi
echo ""

log_success "Sauvegarde Docker France terminée avec succès ! 🇫🇷"
echo ""
echo "💡 Pour restaurer:"
echo "   1. Exécuter: $BACKUP_DIR/${BACKUP_PREFIX}_restore_docker.sh"
echo "   2. Redémarrer: docker-compose -f docker-compose-france.yml up -d"
echo "📋 Localisation: $BACKUP_DIR"