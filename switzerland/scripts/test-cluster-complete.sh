#!/bin/bash

# Script de test complet - Cluster Suisse MSPR 3
# Vérifie toutes les fonctionnalités et endpoints

echo "🧪 TESTS COMPLETS - CLUSTER SUISSE MSPR 3"
echo "=========================================="
echo ""

# Couleurs pour les résultats
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour tester un endpoint
test_endpoint() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}
    
    echo -n "Test $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ OK${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $response)"
        return 1
    fi
}

# Fonction pour tester le contenu JSON
test_json_endpoint() {
    local url=$1
    local name=$2
    local expected_field=$3
    
    echo -n "Test $name... "
    
    response=$(curl -s "$url" 2>/dev/null)
    
    if echo "$response" | grep -q "$expected_field"; then
        echo -e "${GREEN}✅ OK${NC} (Contient '$expected_field')"
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Ne contient pas '$expected_field')"
        return 1
    fi
}

echo "🔍 VÉRIFICATION DES SERVICES DOCKER"
echo "-----------------------------------"

# Vérifier que les conteneurs sont en cours d'exécution
services=("pandemies-frontend-switzerland" "pandemies-api-ia-switzerland" "pandemies-api-express-switzerland" "pandemies-postgres-switzerland" "pandemies-redis-switzerland" "pandemies-translation-switzerland")

for service in "${services[@]}"; do
    echo -n "Service $service... "
    if docker ps --format "table {{.Names}}" | grep -q "$service"; then
        echo -e "${GREEN}✅ RUNNING${NC}"
    else
        echo -e "${RED}❌ NOT RUNNING${NC}"
    fi
done

echo ""
echo "🌐 TESTS DES ENDPOINTS FRONTEND"
echo "-------------------------------"

# Test du frontend
test_endpoint "http://localhost:3003" "Frontend Suisse"

echo ""
echo "🤖 TESTS DES APIs"
echo "-----------------"

# Tests API IA Suisse
test_endpoint "http://localhost:8001/health" "API IA Health"
test_json_endpoint "http://localhost:8001/health" "API IA Status" "healthy"
test_endpoint "http://localhost:8001/docs" "API IA Documentation"

# Tests API Express Suisse
test_endpoint "http://localhost:3002/api/pays" "API Express Pays"
test_endpoint "http://localhost:3002/api-docs" "API Express Documentation"

# Tests Service Traduction
test_endpoint "http://localhost:3004/api/translate/language/fr" "Service Traduction FR"
test_json_endpoint "http://localhost:3004/api/translate/language/fr" "Traductions FR" "success"
test_endpoint "http://localhost:3004/api/translate/language/de" "Service Traduction DE"
test_endpoint "http://localhost:3004/api/translate/language/it" "Service Traduction IT"

echo ""
echo "🗄️ TESTS DE LA BASE DE DONNÉES"
echo "-------------------------------"

# Test de connexion PostgreSQL
echo -n "Test PostgreSQL... "
if docker exec pandemies-postgres-switzerland pg_isready -U pandemies_user -d pandemies_switzerland >/dev/null 2>&1; then
    echo -e "${GREEN}✅ CONNECTED${NC}"
else
    echo -e "${RED}❌ DISCONNECTED${NC}"
fi

# Test Redis
echo -n "Test Redis... "
if docker exec pandemies-redis-switzerland redis-cli ping >/dev/null 2>&1; then
    echo -e "${GREEN}✅ CONNECTED${NC}"
else
    echo -e "${RED}❌ DISCONNECTED${NC}"
fi

echo ""
echo "🌍 TESTS MULTI-LANGUE"
echo "---------------------"

# Tester les 3 langues
languages=("fr" "de" "it")
language_names=("Français" "Deutsch" "Italiano")

for i in "${!languages[@]}"; do
    lang="${languages[$i]}"
    name="${language_names[$i]}"
    
    echo -n "Test langue $name... "
    response=$(curl -s "http://localhost:3004/api/translate/language/$lang" 2>/dev/null)
    
    if echo "$response" | grep -q "\"language\":\"$lang\""; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ FAIL${NC}"
    fi
done

echo ""
echo "📊 RÉSUMÉ DES TESTS"
echo "-------------------"

# Compter les tests réussis
total_tests=0
passed_tests=0

# Tests des services Docker
for service in "${services[@]}"; do
    total_tests=$((total_tests + 1))
    if docker ps --format "table {{.Names}}" | grep -q "$service"; then
        passed_tests=$((passed_tests + 1))
    fi
done

# Tests des endpoints
endpoints=(
    "http://localhost:3003"
    "http://localhost:8001/health"
    "http://localhost:8001/docs"
    "http://localhost:3002/api/pays"
    "http://localhost:3002/api-docs"
    "http://localhost:3004/api/translate/language/fr"
    "http://localhost:3004/api/translate/language/de"
    "http://localhost:3004/api/translate/language/it"
)

for endpoint in "${endpoints[@]}"; do
    total_tests=$((total_tests + 1))
    response=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint" 2>/dev/null)
    if [ "$response" = "200" ]; then
        passed_tests=$((passed_tests + 1))
    fi
done

# Tests base de données
total_tests=$((total_tests + 2))
if docker exec pandemies-postgres-switzerland pg_isready -U pandemies_user -d pandemies_switzerland >/dev/null 2>&1; then
    passed_tests=$((passed_tests + 1))
fi
if docker exec pandemies-redis-switzerland redis-cli ping >/dev/null 2>&1; then
    passed_tests=$((passed_tests + 1))
fi

# Calculer le pourcentage
percentage=$((passed_tests * 100 / total_tests))

echo "Tests réussis : $passed_tests/$total_tests ($percentage%)"

if [ $percentage -ge 90 ]; then
    echo -e "${GREEN}🎉 EXCELLENT ! Cluster Suisse opérationnel${NC}"
elif [ $percentage -ge 80 ]; then
    echo -e "${YELLOW}✅ BON ! Quelques ajustements mineurs nécessaires${NC}"
else
    echo -e "${RED}⚠️ ATTENTION ! Problèmes détectés${NC}"
fi

echo ""
echo "🚀 CLUSTER SUISSE MSPR 3 - TESTS TERMINÉS"
echo "=========================================="
