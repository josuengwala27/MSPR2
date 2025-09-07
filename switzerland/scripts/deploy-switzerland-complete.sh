#!/bin/bash
# deploy-switzerland-complete.sh
# Script de déploiement complet du Cluster Suisse MSPR 3

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="switzerland/docker-compose.switzerland.yml"
ENV_FILE="switzerland/config/switzerland.env"
BACKUP_DIR="switzerland/backups"
LOG_DIR="switzerland/logs"

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Fonction de vérification des prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker non installé"
        exit 1
    fi
    
    # Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose non installé"
        exit 1
    fi
    
    # RAM
    RAM_GB=$(free -g | awk '/^Mem:/{print $2}')
    if [ $RAM_GB -lt 4 ]; then
        log_error "RAM insuffisante: ${RAM_GB}GB (minimum 4GB requis)"
        exit 1
    fi
    
    # Espace disque
    DISK_GB=$(df -BG . | awk 'NR==2{print $4}' | sed 's/G//')
    if [ $DISK_GB -lt 10 ]; then
        log_error "Espace disque insuffisant: ${DISK_GB}GB (minimum 10GB requis)"
        exit 1
    fi
    
    log_success "Prérequis satisfaits"
}

# Fonction de préparation de l'environnement
prepare_environment() {
    log_info "Préparation de l'environnement..."
    
    # Création des répertoires
    mkdir -p "$BACKUP_DIR" "$LOG_DIR"
    
    # Vérification des fichiers de configuration
    if [ ! -f "$ENV_FILE" ]; then
        log_warning "Création du fichier d'environnement..."
        cp switzerland/config/switzerland.env.example "$ENV_FILE"
    fi
    
    # Vérification des fichiers i18n
    for lang in fr de it; do
        if [ ! -f "switzerland/config/i18n/${lang}.json" ]; then
            log_error "Fichier de traduction manquant: ${lang}.json"
            exit 1
        fi
    done
    
    log_success "Environnement préparé"
}

# Fonction de nettoyage
cleanup() {
    log_info "Nettoyage des ressources existantes..."
    
    # Arrêt des services existants
    docker-compose -f "$COMPOSE_FILE" down --volumes --remove-orphans 2>/dev/null || true
    
    # Nettoyage des images
    docker image prune -f
    
    log_success "Nettoyage terminé"
}

# Fonction de construction des images
build_images() {
    log_info "Construction des images Docker..."
    
    docker-compose -f "$COMPOSE_FILE" build \
        --parallel \
        --no-cache \
        --progress=plain
    
    log_success "Images construites"
}

# Fonction de démarrage des services
start_services() {
    log_info "Démarrage des services..."
    
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Attente de la disponibilité
    log_info "Attente de la disponibilité des services..."
    sleep 30
    
    log_success "Services démarrés"
}

# Fonction d'initialisation de la base de données
init_database() {
    log_info "Initialisation de la base de données..."
    
    # Attente de PostgreSQL
    until docker exec pandemies-postgres-switzerland pg_isready -U pandemies_user -d pandemies_switzerland; do
        log_info "Attente de PostgreSQL..."
        sleep 5
    done
    
    # Initialisation du schéma
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
    docker exec pandemies-postgres-switzerland psql -U pandemies_user -d pandemies_switzerland -c "
    INSERT INTO pays (country, iso_code, population) VALUES 
    ('Suisse', 'CHE', 8703000),
    ('France', 'FRA', 68000000),
    ('Allemagne', 'DEU', 83000000),
    ('Italie', 'ITA', 60000000)
    ON CONFLICT (iso_code) DO NOTHING;
    "
    
    log_success "Base de données initialisée"
}

# Fonction de tests de validation
run_validation_tests() {
    log_info "Exécution des tests de validation..."
    
    # Test service de traduction
    for lang in fr de it; do
        response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3004/api/translate/common.welcome?lang=$lang")
        if [ $response -eq 200 ]; then
            log_success "Traduction $lang: OK"
        else
            log_error "Traduction $lang: FAILED (HTTP $response)"
            exit 1
        fi
    done
    
    # Test API IA Suisse
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8001/health")
    if [ $response -eq 200 ]; then
        log_success "API IA Suisse: OK"
    else
        log_error "API IA Suisse: FAILED (HTTP $response)"
        exit 1
    fi
    
    # Test Frontend Suisse
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3003")
    if [ $response -eq 200 ]; then
        log_success "Frontend Suisse: OK"
    else
        log_error "Frontend Suisse: FAILED (HTTP $response)"
        exit 1
    fi
    
    # Test base de données
    docker exec pandemies-postgres-switzerland psql -U pandemies_user -d pandemies_switzerland -c "SELECT COUNT(*) FROM pays;" > /dev/null
    if [ $? -eq 0 ]; then
        log_success "Base de données: OK"
    else
        log_error "Base de données: FAILED"
        exit 1
    fi
    
    # Test Redis
    docker exec pandemies-redis-switzerland redis-cli ping | grep -q "PONG"
    if [ $? -eq 0 ]; then
        log_success "Redis: OK"
    else
        log_error "Redis: FAILED"
        exit 1
    fi
    
    log_success "Tous les tests de validation sont passés"
}

# Fonction d'affichage du statut final
show_final_status() {
    log_info "Statut final des services:"
    docker-compose -f "$COMPOSE_FILE" ps
    
    echo ""
    log_success "🎉 Déploiement du Cluster Suisse terminé avec succès!"
    echo ""
    echo "🌐 Services disponibles:"
    echo "   Frontend Suisse:     http://localhost:3003"
    echo "   Service Traduction:  http://localhost:3004"
    echo "   API IA Suisse:       http://localhost:8001"
    echo "   Documentation:       http://localhost:8001/docs"
    echo ""
    echo "🔧 Commandes utiles:"
    echo "   Voir les logs:       docker-compose -f $COMPOSE_FILE logs -f"
    echo "   Arrêter:             docker-compose -f $COMPOSE_FILE down"
    echo "   Redémarrer:          docker-compose -f $COMPOSE_FILE restart"
    echo "   Monitoring:          ./switzerland/scripts/monitor-switzerland.sh"
    echo ""
}

# Fonction principale
main() {
    echo "🇨🇭 Déploiement du Cluster Suisse MSPR 3"
    echo "=========================================="
    echo ""
    
    check_prerequisites
    prepare_environment
    cleanup
    build_images
    start_services
    init_database
    run_validation_tests
    show_final_status
}

# Exécution du script
main "$@"
