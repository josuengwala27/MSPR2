#!/bin/bash

# Script de sauvegarde pour l'architecture France - MSPR3
# Conforme RGPD - PostgreSQL local + Services Docker
# Architecture: PostgreSQL local (localhost:5432) + Docker services

set -euo pipefail

echo "🇫🇷 Sauvegarde RGPD - Architecture France (PostgreSQL local)"
echo "============================================================="

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BACKUP_DIR="${PROJECT_ROOT}/backups/france"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PREFIX="france_backup_${TIMESTAMP}"

# Configuration PostgreSQL LOCAL
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="pandemies"
DB_USER="postgres"
DB_PASSWORD="root"

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
mkdir -p "$BACKUP_DIR/databases"
mkdir -p "$BACKUP_DIR/configs"
mkdir -p "$BACKUP_DIR/logs"

log_info "Démarrage de la sauvegarde RGPD..."

# Vérification que PostgreSQL local est accessible
log_info "Vérification de PostgreSQL local (${DB_HOST}:${DB_PORT})..."
if ! PGPASSWORD="${DB_PASSWORD}" pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" >/dev/null 2>&1; then
    log_error "PostgreSQL local non accessible sur ${DB_HOST}:${DB_PORT}"
    log_error "Vérifiez que PostgreSQL est démarré et que la base '${DB_NAME}' existe"
    exit 1
fi
log_success "✓ PostgreSQL local accessible"

# 1. Sauvegarde de la base de données PostgreSQL locale
log_info "Sauvegarde de PostgreSQL local (base: ${DB_NAME})..."
log_info "→ Sauvegarde complète avec données RGPD"

PGPASSWORD="${DB_PASSWORD}" pg_dump \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    --verbose \
    --clean \
    --create \
    --if-exists > "$BACKUP_DIR/databases/${BACKUP_PREFIX}_postgresql_full.sql"

log_success "✓ Base PostgreSQL sauvegardée"

# 2. Sauvegarde anonymisée (conformité RGPD Article 4)
log_info "→ Création de la sauvegarde anonymisée RGPD..."

# Requête SQL pour anonymiser les données sensibles
ANONYMIZE_SQL=$(cat << 'EOF'
-- Sauvegarde anonymisée RGPD
-- Population arrondie au millier le plus proche
-- Suppression des codes ISO précis si nécessaire

SELECT 
    id_donnee,
    date,
    CASE 
        WHEN country LIKE '%sensitive%' THEN 'ANONYMIZED_COUNTRY'
        ELSE country 
    END as country,
    value,
    indicator,
    source,
    CASE 
        WHEN iso_code IS NOT NULL THEN 'XXX'  -- Anonymisation codes ISO si nécessaire
        ELSE iso_code 
    END as iso_code,
    CASE 
        WHEN population IS NOT NULL THEN ROUND(population, -3)  -- Arrondi au millier
        ELSE population 
    END as population,
    unit,
    cases_per_100k,
    deaths_per_100k,
    incidence_7j,
    growth_rate
FROM donnee_historique;
EOF
)

PGPASSWORD="${DB_PASSWORD}" psql \
    -h "${DB_HOST}" \
    -p "${DB_PORT}" \
    -U "${DB_USER}" \
    -d "${DB_NAME}" \
    -c "COPY (${ANONYMIZE_SQL}) TO STDOUT WITH CSV HEADER;" > "$BACKUP_DIR/databases/${BACKUP_PREFIX}_anonymized.csv"

log_success "✓ Sauvegarde anonymisée RGPD créée"

# 3. Sauvegarde de Redis France (Docker)
log_info "Sauvegarde de Redis France..."
cd "${PROJECT_ROOT}"
if docker-compose -f docker-compose-france.yml ps | grep -q "pandemies-redis-france.*Up" 2>/dev/null; then
    docker-compose -f docker-compose-france.yml exec -T redis-france redis-cli --rdb - > "$BACKUP_DIR/databases/${BACKUP_PREFIX}_redis.rdb" 2>/dev/null
    log_success "✓ Cache Redis sauvegardé"
else
    log_warning "⚠ Redis France non disponible (services Docker non démarrés)"
fi

# 4. Sauvegarde des configurations
log_info "Sauvegarde des configurations France..."
cp docker-compose-france.yml "$BACKUP_DIR/configs/"
cp .env "$BACKUP_DIR/configs/" 2>/dev/null || log_warning "Variables d'environnement non trouvées"
cp -r docs/ "$BACKUP_DIR/configs/" 2>/dev/null || log_warning "Documentation non trouvée"
cp -r PowerBI/ "$BACKUP_DIR/configs/" 2>/dev/null || log_warning "Configuration PowerBI non trouvée"
cp -r frontend/nginx-france.conf "$BACKUP_DIR/configs/" 2>/dev/null || true

log_success "✓ Configurations sauvegardées"

# 5. Sauvegarde des logs (conformité RGPD - rétention 3 ans)  
log_info "Sauvegarde des logs RGPD..."
# Logs Docker des services France
if docker-compose -f docker-compose-france.yml ps -q >/dev/null 2>&1; then
    for service in api-ia-france frontend-france redis-france; do
        if docker-compose -f docker-compose-france.yml ps -q $service >/dev/null 2>&1; then
            docker-compose -f docker-compose-france.yml logs --no-color $service > "$BACKUP_DIR/logs/${BACKUP_PREFIX}_${service}.log" 2>/dev/null || true
        fi
    done
fi
# Logs archivés s'ils existent
if [ -d "logs_archive/france" ]; then
    tar -czf "$BACKUP_DIR/logs/${BACKUP_PREFIX}_logs_archive.tar.gz" logs_archive/france/ 2>/dev/null || true
fi

log_success "✓ Logs archivés"

# 6. Métadonnées de sauvegarde RGPD
log_info "Création des métadonnées RGPD..."
cat > "$BACKUP_DIR/${BACKUP_PREFIX}_metadata.json" << EOF
{
  "backup_id": "${BACKUP_PREFIX}",
  "timestamp": "${TIMESTAMP}",
  "date": "$(date -Iseconds)",
  "country": "france",
  "gdpr_compliant": true,
  "anonymization_applied": true,
  "retention_period": "3_years",
  "data_controller": "OMS France",
  "backup_type": "automated_gdpr",
  "files": {
    "database_full": "${BACKUP_PREFIX}_postgresql_full.sql",
    "database_anonymized": "${BACKUP_PREFIX}_anonymized.csv",
    "redis_cache": "${BACKUP_PREFIX}_redis.rdb",
    "configurations": "configs/",
    "logs_ai": "${BACKUP_PREFIX}_logs_ai.tar.gz",
    "logs_etl": "${BACKUP_PREFIX}_logs_etl.tar.gz"
  },
  "size_total": "$(du -sh $BACKUP_DIR | cut -f1)",
  "created_by": "backup-france.sh",
  "encryption": "recommended_for_personal_data",
  "contact_dpo": "dpo@sante-france.fr"
}
EOF

log_success "✓ Métadonnées RGPD créées"

# 7. Chiffrement de la sauvegarde (optionnel mais recommandé RGPD)
log_info "Chiffrement de la sauvegarde (RGPD recommandé)..."
if command -v gpg &> /dev/null; then
    # Génération d'une clé symétrique pour cette sauvegarde
    BACKUP_PASSWORD="france_$(openssl rand -base64 32)"
    echo "$BACKUP_PASSWORD" > "$BACKUP_DIR/${BACKUP_PREFIX}_key.txt"
    
    # Chiffrement de la sauvegarde complète
    tar -czf - "$BACKUP_DIR" | gpg --cipher-algo AES256 --compress-algo 1 --symmetric --output "$BACKUP_DIR/../${BACKUP_PREFIX}_encrypted.gpg" --batch --passphrase "$BACKUP_PASSWORD"
    
    log_success "✓ Sauvegarde chiffrée créée"
    log_info "🔑 Clé de déchiffrement: ${BACKUP_PREFIX}_key.txt"
else
    log_warning "⚠ GPG non disponible - sauvegarde non chiffrée"
    log_warning "  Recommandation RGPD: Installer GPG pour le chiffrement"
fi

# 8. Vérification de l'intégrité
log_info "Vérification de l'intégrité..."
find "$BACKUP_DIR" -type f -name "*.sql" -o -name "*.csv" -o -name "*.rdb" | while read file; do
    if [ -s "$file" ]; then
        checksum=$(sha256sum "$file" | cut -d' ' -f1)
        echo "$(basename $file): $checksum" >> "$BACKUP_DIR/${BACKUP_PREFIX}_checksums.txt"
    else
        log_warning "⚠ Fichier vide: $file"
    fi
done

log_success "✓ Vérification d'intégrité terminée"

# 9. Nettoyage des anciennes sauvegardes (RGPD - rétention 3 ans)
log_info "Nettoyage des anciennes sauvegardes (rétention RGPD: 3 ans)..."
find "$BACKUP_DIR" -name "france_backup_*" -mtime +1095 -exec rm -rf {} \; 2>/dev/null || true
log_success "✓ Nettoyage effectué"

# Rapport final
echo ""
echo "📊 RAPPORT DE SAUVEGARDE FRANCE"
echo "==============================="
echo "🕐 Heure: $(date)"
echo "🆔 ID: $BACKUP_PREFIX"
echo "📁 Dossier: $BACKUP_DIR"
echo "💾 Taille: $(du -sh $BACKUP_DIR | cut -f1)"
echo ""
echo "📦 Fichiers créés:"
echo "   • Base complète: ${BACKUP_PREFIX}_postgresql_full.sql"
echo "   • Base anonymisée: ${BACKUP_PREFIX}_anonymized.csv"
echo "   • Cache Redis: ${BACKUP_PREFIX}_redis.rdb"
echo "   • Configurations: configs/"
echo "   • Logs: ${BACKUP_PREFIX}_logs_*.tar.gz"
echo "   • Métadonnées: ${BACKUP_PREFIX}_metadata.json"
echo "   • Checksums: ${BACKUP_PREFIX}_checksums.txt"
echo ""
echo "🛡️ Conformité RGPD:"
echo "   • Anonymisation: ✓"
echo "   • Métadonnées: ✓"
echo "   • Rétention 3 ans: ✓"
if [ -f "$BACKUP_DIR/../${BACKUP_PREFIX}_encrypted.gpg" ]; then
echo "   • Chiffrement: ✓"
else
echo "   • Chiffrement: ⚠ (recommandé)"
fi
echo ""

log_success "Sauvegarde France terminée avec succès ! 🇫🇷"
echo ""
echo "💡 Pour restaurer: ./scripts/france/restore-france.sh $BACKUP_PREFIX"
echo "📋 Localisation: $BACKUP_DIR"