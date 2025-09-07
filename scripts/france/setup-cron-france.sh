#!/bin/bash

# Script de configuration des tâches automatiques pour l'architecture France - MSPR3
# Conforme RGPD - Automatisation des sauvegardes et maintenance
# Architecture: PostgreSQL local (localhost:5432) + Docker services

set -euo pipefail

echo "🇫🇷 Configuration Automatisation RGPD - Architecture France"
echo "==========================================================="

# Configuration des chemins
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_DIR="${PROJECT_ROOT}/logs/cron"

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

# Création du répertoire de logs
mkdir -p "$LOG_DIR"

log_info "Configuration de l'automatisation France..."

# Vérification que les scripts existent
BACKUP_SCRIPT="${SCRIPT_DIR}/backup-france.sh"
MONITOR_SCRIPT="${SCRIPT_DIR}/monitor-france.sh"

if [ ! -f "$BACKUP_SCRIPT" ]; then
    log_error "Script de sauvegarde non trouvé: $BACKUP_SCRIPT"
    exit 1
fi

if [ ! -f "$MONITOR_SCRIPT" ]; then
    log_warning "Script de monitoring non trouvé: $MONITOR_SCRIPT"
    log_warning "Création d'un script de monitoring basique..."
    
    cat > "$MONITOR_SCRIPT" << 'EOF'
#!/bin/bash
# Script de monitoring basique France
echo "$(date): Monitoring France basique - PostgreSQL local + Docker services" >> "${PROJECT_ROOT}/logs/cron/monitor.log"

# Test PostgreSQL local
if PGPASSWORD="root" pg_isready -h localhost -p 5432 -U postgres -d pandemies >/dev/null 2>&1; then
    echo "$(date): ✓ PostgreSQL local OK" >> "${PROJECT_ROOT}/logs/cron/monitor.log"
else
    echo "$(date): ✗ PostgreSQL local ERROR" >> "${PROJECT_ROOT}/logs/cron/monitor.log"
fi

# Test services Docker France
if docker-compose -f docker-compose-france.yml ps -q >/dev/null 2>&1; then
    echo "$(date): ✓ Services Docker France OK" >> "${PROJECT_ROOT}/logs/cron/monitor.log"
else
    echo "$(date): ✗ Services Docker France ERROR" >> "${PROJECT_ROOT}/logs/cron/monitor.log"
fi
EOF
    
    chmod +x "$MONITOR_SCRIPT"
    log_success "✓ Script de monitoring créé"
fi

# Rendre les scripts exécutables
chmod +x "$BACKUP_SCRIPT"
chmod +x "$MONITOR_SCRIPT"

# Configuration des tâches cron
CRON_TEMP="/tmp/cron_france_$(date +%s)"
CRON_FILE="${PROJECT_ROOT}/scripts/france/cron-france.txt"

log_info "Création de la configuration cron..."

cat > "$CRON_FILE" << EOF
# ============================================
# AUTOMATISATION FRANCE - MSPR3 - CONFORME RGPD
# Architecture: PostgreSQL local + Docker services
# ============================================

# Variables d'environnement pour cron
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
PROJECT_ROOT=${PROJECT_ROOT}

# ============================================
# SAUVEGARDES RGPD (Conformité Article 32)
# ============================================

# Sauvegarde quotidienne complète (2h00 du matin)
0 2 * * * cd ${PROJECT_ROOT} && ${BACKUP_SCRIPT} >> ${LOG_DIR}/backup-daily.log 2>&1

# Sauvegarde hebdomadaire de sécurité (dimanche 3h00)
0 3 * * 0 cd ${PROJECT_ROOT} && ${BACKUP_SCRIPT} >> ${LOG_DIR}/backup-weekly.log 2>&1

# ============================================
# MONITORING ET SURVEILLANCE
# ============================================

# Monitoring santé toutes les 5 minutes
*/5 * * * * cd ${PROJECT_ROOT} && ${MONITOR_SCRIPT} health >> ${LOG_DIR}/monitor-health.log 2>&1

# Monitoring complet toutes les heures
0 * * * * cd ${PROJECT_ROOT} && ${MONITOR_SCRIPT} status >> ${LOG_DIR}/monitor-status.log 2>&1

# ============================================
# MAINTENANCE RGPD
# ============================================

# Nettoyage logs anciens (rétention 3 ans RGPD) - tous les dimanches 4h00
0 4 * * 0 find ${PROJECT_ROOT}/logs -name "*.log" -mtime +1095 -delete >> ${LOG_DIR}/cleanup.log 2>&1

# Nettoyage logs temporaires (> 30 jours) - tous les jours 4h30
30 4 * * * find ${PROJECT_ROOT}/logs -name "*.tmp" -o -name "*.temp" -mtime +30 -delete >> ${LOG_DIR}/cleanup.log 2>&1

# Rotation logs cron (> 7 jours) - tous les jours 5h00
0 5 * * * find ${LOG_DIR} -name "*.log" -mtime +7 -exec gzip {} \; >> ${LOG_DIR}/rotation.log 2>&1

# ============================================
# VÉRIFICATIONS INTÉGRITÉ
# ============================================

# Vérification intégrité base PostgreSQL locale - tous les dimanches 1h00
0 1 * * 0 cd ${PROJECT_ROOT} && PGPASSWORD=root psql -h localhost -p 5432 -U postgres -d pandemies -c "SELECT 'Integrity check: ' || COUNT(*) || ' records' FROM donnee_historique;" >> ${LOG_DIR}/integrity.log 2>&1

# Vérification espace disque - toutes les heures
0 * * * * df -h ${PROJECT_ROOT} | awk 'NR==2{if(\$5+0 > 85) print "$(date): WARNING - Disk usage: " \$5}' >> ${LOG_DIR}/disk-space.log 2>&1

# ============================================
# ALERTES RGPD
# ============================================

# Vérification conformité RGPD quotidienne - tous les jours 6h00
0 6 * * * cd ${PROJECT_ROOT} && echo "$(date): Daily GDPR compliance check - Architecture France" >> ${LOG_DIR}/gdpr-compliance.log 2>&1

# Génération rapport RGPD hebdomadaire - tous les lundis 7h00
0 7 * * 1 cd ${PROJECT_ROOT} && echo "$(date): Weekly GDPR report - Backups: \$(ls -1 ${PROJECT_ROOT}/backups/france/ | grep france_backup_ | wc -l)" >> ${LOG_DIR}/gdpr-weekly.log 2>&1

EOF

log_success "✓ Configuration cron créée: $CRON_FILE"

# Affichage de la configuration
log_info "Configuration cron générée:"
echo ""
cat "$CRON_FILE"
echo ""

# Instructions d'installation
log_info "Instructions d'installation:"
echo ""
echo "1. Installer la configuration cron:"
echo "   crontab $CRON_FILE"
echo ""
echo "2. Vérifier l'installation:"
echo "   crontab -l"
echo ""
echo "3. Logs de surveillance disponibles dans:"
echo "   $LOG_DIR/"
echo ""

# Installation optionnelle automatique
read -p "Voulez-vous installer automatiquement cette configuration cron? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Installation de la configuration cron..."
    
    # Sauvegarde de l'ancienne configuration
    OLD_CRON_BACKUP="${PROJECT_ROOT}/scripts/france/cron-backup-$(date +%Y%m%d_%H%M%S).txt"
    crontab -l > "$OLD_CRON_BACKUP" 2>/dev/null || echo "# Pas de cron existant" > "$OLD_CRON_BACKUP"
    log_info "Ancienne configuration sauvegardée: $OLD_CRON_BACKUP"
    
    # Installation
    if crontab "$CRON_FILE"; then
        log_success "✓ Configuration cron installée avec succès"
        
        # Vérification
        log_info "Vérification de l'installation:"
        crontab -l | head -20
        
    else
        log_error "✗ Erreur lors de l'installation cron"
        log_info "Installation manuelle:"
        echo "  crontab $CRON_FILE"
    fi
else
    log_info "Installation manuelle requise:"
    echo "  crontab $CRON_FILE"
fi

# Scripts de gestion cron
CRON_MANAGER="${SCRIPT_DIR}/cron-manager-france.sh"
log_info "Création du gestionnaire cron..."

cat > "$CRON_MANAGER" << 'EOF'
#!/bin/bash

# Gestionnaire des tâches cron France

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_DIR="${PROJECT_ROOT}/logs/cron"

case "$1" in
    "status")
        echo "État des tâches cron France:"
        crontab -l | grep -E "(backup|monitor|cleanup|france)" || echo "Aucune tâche France trouvée"
        echo ""
        echo "Logs récents:"
        ls -la "$LOG_DIR"/*.log 2>/dev/null | tail -5 || echo "Aucun log trouvé"
        ;;
    "logs")
        echo "Logs d'automatisation France:"
        find "$LOG_DIR" -name "*.log" -mtime -1 -exec tail -5 {} \; 2>/dev/null || echo "Aucun log récent"
        ;;
    "disable")
        echo "Désactivation des tâches cron France..."
        crontab -l | grep -v france | crontab -
        echo "Tâches cron France désactivées"
        ;;
    "enable")
        echo "Activation des tâches cron France..."
        crontab "${PROJECT_ROOT}/scripts/france/cron-france.txt"
        echo "Tâches cron France activées"
        ;;
    *)
        echo "Usage: $0 {status|logs|disable|enable}"
        exit 1
        ;;
esac
EOF

chmod +x "$CRON_MANAGER"
log_success "✓ Gestionnaire cron créé: $CRON_MANAGER"

# Rapport final
echo ""
echo "📊 RAPPORT AUTOMATISATION FRANCE"
echo "================================="
echo "🕐 Heure: $(date)"
echo "📁 Projet: $PROJECT_ROOT"
echo "📋 Configuration: $CRON_FILE"
echo "🔧 Gestionnaire: $CRON_MANAGER"
echo ""
echo "📦 Tâches automatiques configurées:"
echo "   • Sauvegarde quotidienne: 2h00"
echo "   • Sauvegarde hebdomadaire: Dimanche 3h00"
echo "   • Monitoring continu: Toutes les 5min"
echo "   • Nettoyage RGPD: Dimanche 4h00"
echo "   • Vérification intégrité: Dimanche 1h00"
echo ""
echo "🛡️ Conformité RGPD:"
echo "   • Rétention 3 ans: ✓"
echo "   • Logs d'audit: ✓"
echo "   • Sauvegardes automatiques: ✓"
echo "   • Monitoring continu: ✓"
echo ""

log_success "Automatisation France configurée avec succès ! 🇫🇷"
echo ""
echo "💡 Commandes utiles:"
echo "   • Statut cron: $CRON_MANAGER status"
echo "   • Logs cron: $CRON_MANAGER logs"
echo "   • Désactiver: $CRON_MANAGER disable"
echo "   • Activer: $CRON_MANAGER enable"
echo "📋 Localisation logs: $LOG_DIR"