#!/bin/bash

# Script de monitoring pour l'architecture France
# Surveillance en temps réel avec conformité RGPD

echo "🇫🇷 Monitoring Architecture France"
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

# Fonction pour afficher le statut d'un service
check_service_status() {
    local service_name="$1"
    local container_name="$2"
    local expected_port="$3"
    
    if docker ps | grep -q "$container_name.*Up"; then
        if [ ! -z "$expected_port" ]; then
            if curl -s "http://localhost:$expected_port" > /dev/null 2>&1; then
                log_success "✓ $service_name: Running & Responsive"
                return 0
            else
                log_warning "⚠ $service_name: Running but not responsive"
                return 1
            fi
        else
            log_success "✓ $service_name: Running"
            return 0
        fi
    else
        log_error "✗ $service_name: Stopped"
        return 2
    fi
}

# Fonction de monitoring continu
continuous_monitoring() {
    while true; do
        clear
        echo "🇫🇷 MONITORING FRANCE - $(date)"
        echo "==============================="
        echo ""
        
        # État des services
        echo "📊 ÉTAT DES SERVICES:"
        check_service_status "PostgreSQL France" "pandemies-postgres-france"
        check_service_status "Redis France" "pandemies-redis-france"  
        check_service_status "API IA France" "pandemies-api-ia-france" "8001"
        check_service_status "Frontend France" "pandemies-frontend-france" "3080"
        
        echo ""
        
        # Utilisation des ressources
        echo "💾 UTILISATION RESSOURCES:"
        echo "CPU: $(docker stats --no-stream --format "table {{.CPUPerc}}" | tail -n +2 | head -1 2>/dev/null || echo "N/A")"
        echo "Mémoire: $(docker stats --no-stream --format "table {{.MemUsage}}" | tail -n +2 | head -1 2>/dev/null || echo "N/A")"
        
        echo ""
        
        # État de la base de données
        echo "🗄️ BASE DE DONNÉES:"
        if docker-compose -f docker-compose-france.yml exec -T postgres-france pg_isready -U postgres_fr -d pandemies_db_france > /dev/null 2>&1; then
            RECORD_COUNT=$(docker-compose -f docker-compose-france.yml exec -T postgres-france psql -U postgres_fr -d pandemies_db_france -t -c "SELECT COUNT(*) FROM donnee_historique;" 2>/dev/null | tr -d ' \n' || echo "0")
            DB_SIZE=$(docker-compose -f docker-compose-france.yml exec -T postgres-france psql -U postgres_fr -d pandemies_db_france -t -c "SELECT pg_size_pretty(pg_database_size('pandemies_db_france'));" 2>/dev/null | tr -d ' \n' || echo "N/A")
            log_success "✓ PostgreSQL: $RECORD_COUNT enregistrements ($DB_SIZE)"
        else
            log_error "✗ PostgreSQL: Non accessible"
        fi
        
        echo ""
        
        # Logs récents (anonymisés RGPD)
        echo "📝 LOGS RÉCENTS (5 dernières lignes):"
        if [ -d "AI_API/logs/france" ]; then
            echo "API IA France:"
            tail -n 3 AI_API/logs/france/*.log 2>/dev/null | grep -v "personal\|sensitive\|user\|password" | head -3 || echo "Aucun log disponible"
        fi
        
        echo ""
        
        # Tests de connectivité
        echo "🔗 TESTS CONNECTIVITÉ:"
        if curl -s http://localhost:8001/health | grep -q "healthy"; then
            log_success "✓ API IA: Health check OK"
        else
            log_warning "⚠ API IA: Health check échoué"
        fi
        
        if curl -s http://localhost:3080 > /dev/null; then
            log_success "✓ Frontend: Accessible"
        else
            log_warning "⚠ Frontend: Non accessible"
        fi
        
        echo ""
        echo "🛡️ RGPD: Monitoring anonymisé | 🔄 Actualisation dans 30s"
        echo "Appuyez sur Ctrl+C pour arrêter"
        
        sleep 30
    done
}

# Menu principal
case "$1" in
    "status")
        echo "📊 STATUT INSTANTANÉ:"
        check_service_status "PostgreSQL France" "pandemies-postgres-france"
        check_service_status "Redis France" "pandemies-redis-france"
        check_service_status "API IA France" "pandemies-api-ia-france" "8001"
        check_service_status "Frontend France" "pandemies-frontend-france" "3080"
        ;;
    "logs")
        log_info "📝 Affichage des logs France..."
        docker-compose -f docker-compose-france.yml logs -f --tail=50
        ;;
    "continuous"|"")
        log_info "🔄 Démarrage du monitoring continu..."
        continuous_monitoring
        ;;
    "health")
        log_info "🏥 Tests de santé des services..."
        
        # Test PostgreSQL
        if docker-compose -f docker-compose-france.yml exec -T postgres-france pg_isready -U postgres_fr -d pandemies_db_france > /dev/null 2>&1; then
            log_success "✓ PostgreSQL: Healthy"
        else
            log_error "✗ PostgreSQL: Unhealthy"
        fi
        
        # Test API IA
        if curl -s http://localhost:8001/health | grep -q "healthy"; then
            log_success "✓ API IA: Healthy"
            # Test spécifique base de données
            if curl -s http://localhost:8001/test-database | grep -q "success"; then
                log_success "✓ API IA → PostgreSQL: Connected"
            else
                log_warning "⚠ API IA → PostgreSQL: Connection issues"
            fi
        else
            log_error "✗ API IA: Unhealthy"
        fi
        
        # Test Frontend
        if curl -s http://localhost:3080 > /dev/null; then
            log_success "✓ Frontend: Healthy"
        else
            log_error "✗ Frontend: Unhealthy"
        fi
        ;;
    "resources")
        log_info "💾 Utilisation des ressources..."
        echo ""
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" | head -10
        ;;
    "database")
        log_info "🗄️ Statistiques base de données France..."
        if docker-compose -f docker-compose-france.yml exec -T postgres-france pg_isready -U postgres_fr -d pandemies_db_france > /dev/null 2>&1; then
            echo ""
            echo "📈 Statistiques:"
            docker-compose -f docker-compose-france.yml exec -T postgres-france psql -U postgres_fr -d pandemies_db_france -c "
                SELECT 
                    'Total enregistrements' as metric,
                    COUNT(*) as value
                FROM donnee_historique
                UNION ALL
                SELECT 
                    'Pays uniques' as metric,
                    COUNT(DISTINCT country) as value
                FROM donnee_historique
                UNION ALL
                SELECT 
                    'Indicateurs uniques' as metric,
                    COUNT(DISTINCT indicator) as value
                FROM donnee_historique
                UNION ALL
                SELECT 
                    'Taille base' as metric,
                    ROUND(pg_database_size('pandemies_db_france')/1024/1024) as value
                FROM (SELECT 1) t;
            "
        else
            log_error "Base de données non accessible"
        fi
        ;;
    "help")
        echo "Usage: $0 [command]"
        echo ""
        echo "Commandes disponibles:"
        echo "  status      - Statut instantané des services"
        echo "  logs        - Affichage des logs en temps réel"
        echo "  continuous  - Monitoring continu (défaut)"
        echo "  health      - Tests de santé détaillés"
        echo "  resources   - Utilisation des ressources"
        echo "  database    - Statistiques base de données"
        echo "  help        - Affiche cette aide"
        echo ""
        echo "Exemples:"
        echo "  $0                    # Monitoring continu"
        echo "  $0 status             # Statut rapide"
        echo "  $0 logs               # Voir les logs"
        ;;
    *)
        log_error "Commande inconnue: $1"
        echo "Utilisez '$0 help' pour voir les commandes disponibles"
        exit 1
        ;;
esac