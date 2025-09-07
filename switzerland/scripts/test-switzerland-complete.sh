#!/bin/bash
# test-switzerland-complete.sh
# Script de test complet du Cluster Suisse

echo "🇨🇭 Test Complet du Cluster Suisse MSPR 3"
echo "=========================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Fonctions
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

# Test 1: Statut des services
log_info "1. Vérification du statut des services..."
docker-compose -f switzerland/docker-compose.switzerland.yml ps

echo ""

# Test 2: Service de traduction
log_info "2. Test du service de traduction..."

# Test endpoint languages
response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3004/api/translate/languages")
if [ $response -eq 200 ]; then
    log_success "Endpoint languages: OK ($response)"
else
    log_error "Endpoint languages: FAILED ($response)"
fi

# Test traductions
for lang in fr de it; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3004/api/translate/common.welcome?lang=$lang")
    if [ $response -eq 200 ]; then
        log_success "Traduction $lang: OK ($response)"
        # Afficher le contenu de la réponse
        content=$(curl -s "http://localhost:3004/api/translate/common.welcome?lang=$lang")
        echo "   Contenu: $content"
    else
        log_error "Traduction $lang: FAILED ($response)"
    fi
done

echo ""

# Test 3: API IA Suisse
log_info "3. Test de l'API IA Suisse..."

response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8001/health")
if [ $response -eq 200 ]; then
    log_success "API IA Suisse: OK ($response)"
    content=$(curl -s "http://localhost:8001/health")
    echo "   Contenu: $content"
elif [ $response -eq 503 ]; then
    log_warning "API IA Suisse: Service Unavailable ($response) - Problème de connexion API Express"
else
    log_error "API IA Suisse: FAILED ($response)"
fi

echo ""

# Test 4: Frontend Suisse
log_info "4. Test du frontend suisse..."

response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3003")
if [ $response -eq 200 ]; then
    log_success "Frontend Suisse: OK ($response)"
else
    log_error "Frontend Suisse: FAILED ($response)"
fi

echo ""

# Test 5: Base de données Suisse
log_info "5. Test de la base de données suisse..."

# Test connexion PostgreSQL
if docker exec pandemies-postgres-switzerland pg_isready -U pandemies_user -d pandemies_switzerland; then
    log_success "PostgreSQL Suisse: OK"
    
    # Test des tables
    tables=$(docker exec pandemies-postgres-switzerland psql -U pandemies_user -d pandemies_switzerland -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
    echo "   Tables: $tables"
    
    # Test des données
    count=$(docker exec pandemies-postgres-switzerland psql -U pandemies_user -d pandemies_switzerland -t -c "SELECT COUNT(*) FROM pays;" 2>/dev/null | tr -d ' ')
    if [ "$count" -gt 0 ]; then
        log_success "Données pays: OK ($count enregistrements)"
    else
        log_warning "Données pays: Aucune donnée"
    fi
else
    log_error "PostgreSQL Suisse: FAILED"
fi

echo ""

# Test 6: Redis Suisse
log_info "6. Test de Redis Suisse..."

if docker exec pandemies-redis-switzerland redis-cli ping | grep -q "PONG"; then
    log_success "Redis Suisse: OK"
    
    # Test des clés
    keys=$(docker exec pandemies-redis-switzerland redis-cli keys "*" | wc -l)
    echo "   Clés Redis: $keys"
else
    log_error "Redis Suisse: FAILED"
fi

echo ""

# Test 7: API Express (pour comparaison)
log_info "7. Test de l'API Express (référence)..."

response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001/api/pays")
if [ $response -eq 200 ]; then
    log_success "API Express: OK ($response)"
else
    log_error "API Express: FAILED ($response)"
fi

echo ""

# Test 8: ETL
log_info "8. Test de l'ETL..."

# Vérifier les permissions
if [ -w "ETL/raw_data" ]; then
    log_success "Permissions ETL: OK"
else
    log_warning "Permissions ETL: Problème de permissions sur ETL/raw_data"
fi

# Vérifier les fichiers de données
if [ -f "ETL/raw_data/worldometer_coronavirus_daily_data.csv" ]; then
    log_success "Données COVID: OK"
else
    log_warning "Données COVID: Fichier manquant"
fi

if [ -f "ETL/raw_data/owid-monkeypox-data.csv" ]; then
    log_success "Données MPOX: OK"
else
    log_warning "Données MPOX: Fichier manquant"
fi

echo ""

# Résumé des problèmes
log_info "🔍 DIAGNOSTIC DES PROBLÈMES IDENTIFIÉS:"
echo ""

# Problème 1: Service de traduction
log_warning "PROBLÈME 1: Service de traduction retourne les clés au lieu des traductions"
echo "   Cause: Le service cherche les fichiers dans le mauvais répertoire"
echo "   Solution: Corriger le chemin dans translation-service.js"
echo ""

# Problème 2: API IA Suisse
log_warning "PROBLÈME 2: API IA Suisse ne peut pas se connecter à l'API Express"
echo "   Cause: L'API IA Suisse cherche api-express-switzerland qui n'existe pas"
echo "   Solution: Configurer la connexion vers l'API Express principale"
echo ""

# Problème 3: ETL
log_warning "PROBLÈME 3: ETL a des problèmes de permissions"
echo "   Cause: Permissions insuffisantes sur le répertoire raw_data"
echo "   Solution: Corriger les permissions ou utiliser un volume Docker"
echo ""

# Solutions proposées
log_info "🔧 SOLUTIONS PROPOSÉES:"
echo ""
echo "1. Pour le service de traduction:"
echo "   - Modifier le chemin dans translation-service.js"
echo "   - Redémarrer le service: docker-compose -f switzerland/docker-compose.switzerland.yml restart translation-service"
echo ""
echo "2. Pour l'API IA Suisse:"
echo "   - Configurer la connexion vers l'API Express principale (port 3001)"
echo "   - Ou créer un service api-express-switzerland dans la config suisse"
echo ""
echo "3. Pour l'ETL:"
echo "   - Corriger les permissions: chmod 755 ETL/raw_data"
echo "   - Ou utiliser un volume Docker pour les données"
echo ""

# URLs de test
log_info "🌐 URLs DE TEST:"
echo ""
echo "Frontend Suisse:     http://localhost:3003"
echo "Service Traduction:  http://localhost:3004/api/translate/languages"
echo "API IA Suisse:       http://localhost:8001/health"
echo "API Express:         http://localhost:3001/api/pays"
echo ""

log_info "🧪 COMMANDES DE TEST:"
echo ""
echo "# Test traductions"
echo "curl 'http://localhost:3004/api/translate/common.welcome?lang=fr'"
echo "curl 'http://localhost:3004/api/translate/common.welcome?lang=de'"
echo "curl 'http://localhost:3004/api/translate/common.welcome?lang=it'"
echo ""
echo "# Test APIs"
echo "curl 'http://localhost:8001/health'"
echo "curl 'http://localhost:3001/api/pays'"
echo ""

echo "🎯 CONCLUSION:"
echo "Le Cluster Suisse est déployé mais nécessite des corrections mineures"
echo "pour fonctionner parfaitement selon les exigences du MSPR 3."
