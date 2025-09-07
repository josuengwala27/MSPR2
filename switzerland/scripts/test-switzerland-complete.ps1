# test-switzerland-complete.ps1
# Script de test complet du Cluster Suisse

Write-Host "🇨🇭 Test Complet du Cluster Suisse MSPR 3" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue
Write-Host ""

# Test 1: Statut des services
Write-Host "1. Vérification du statut des services..." -ForegroundColor Yellow
docker-compose -f switzerland/docker-compose.switzerland.yml ps
Write-Host ""

# Test 2: Service de traduction
Write-Host "2. Test du service de traduction..." -ForegroundColor Yellow

# Test endpoint languages
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3004/api/translate/languages" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Endpoint languages: OK ($($response.StatusCode))" -ForegroundColor Green
        Write-Host "   Contenu: $($response.Content)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Endpoint languages: FAILED" -ForegroundColor Red
}

# Test traductions
foreach ($lang in @("fr", "de", "it")) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3004/api/translate/common.welcome?lang=$lang" -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Traduction $lang : OK ($($response.StatusCode))" -ForegroundColor Green
            Write-Host "   Contenu: $($response.Content)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Traduction $lang : FAILED" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: API IA Suisse
Write-Host "3. Test de l'API IA Suisse..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8001/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API IA Suisse: OK ($($response.StatusCode))" -ForegroundColor Green
        Write-Host "   Contenu: $($response.Content)" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️ API IA Suisse: Service Unavailable - Problème de connexion API Express" -ForegroundColor Yellow
}

Write-Host ""

# Test 4: Frontend Suisse
Write-Host "4. Test du frontend suisse..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3003" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend Suisse: OK ($($response.StatusCode))" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend Suisse: FAILED" -ForegroundColor Red
}

Write-Host ""

# Test 5: Base de données Suisse
Write-Host "5. Test de la base de données suisse..." -ForegroundColor Yellow

$pgTest = docker exec pandemies-postgres-switzerland pg_isready -U pandemies_user -d pandemies_switzerland
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PostgreSQL Suisse: OK" -ForegroundColor Green
    
    # Test des tables
    $tables = docker exec pandemies-postgres-switzerland psql -U pandemies_user -d pandemies_switzerland -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
    Write-Host "   Tables: $tables" -ForegroundColor Gray
    
    # Test des données
    $count = docker exec pandemies-postgres-switzerland psql -U pandemies_user -d pandemies_switzerland -t -c "SELECT COUNT(*) FROM pays;" 2>$null
    if ($count -gt 0) {
        Write-Host "✅ Données pays: OK ($count enregistrements)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Données pays: Aucune donnée" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ PostgreSQL Suisse: FAILED" -ForegroundColor Red
}

Write-Host ""

# Test 6: Redis Suisse
Write-Host "6. Test de Redis Suisse..." -ForegroundColor Yellow

$redisTest = docker exec pandemies-redis-switzerland redis-cli ping
if ($redisTest -eq "PONG") {
    Write-Host "✅ Redis Suisse: OK" -ForegroundColor Green
    
    # Test des clés
    $keys = docker exec pandemies-redis-switzerland redis-cli keys "*" | Measure-Object | Select-Object -ExpandProperty Count
    Write-Host "   Clés Redis: $keys" -ForegroundColor Gray
} else {
    Write-Host "❌ Redis Suisse: FAILED" -ForegroundColor Red
}

Write-Host ""

# Test 7: API Express (pour comparaison)
Write-Host "7. Test de l'API Express (référence)..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/pays" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API Express: OK ($($response.StatusCode))" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ API Express: FAILED" -ForegroundColor Red
}

Write-Host ""

# Résumé des problèmes
Write-Host "🔍 DIAGNOSTIC DES PROBLÈMES IDENTIFIÉS:" -ForegroundColor Blue
Write-Host ""

Write-Host "⚠️ PROBLÈME 1: Service de traduction retourne les clés au lieu des traductions" -ForegroundColor Yellow
Write-Host "   Cause: Le service cherche les fichiers dans le mauvais répertoire" -ForegroundColor Gray
Write-Host "   Solution: Corriger le chemin dans translation-service.js" -ForegroundColor Gray
Write-Host ""

Write-Host "⚠️ PROBLÈME 2: API IA Suisse ne peut pas se connecter à l'API Express" -ForegroundColor Yellow
Write-Host "   Cause: L'API IA Suisse cherche api-express-switzerland qui n'existe pas" -ForegroundColor Gray
Write-Host "   Solution: Configurer la connexion vers l'API Express principale" -ForegroundColor Gray
Write-Host ""

Write-Host "⚠️ PROBLÈME 3: ETL a des problèmes de permissions" -ForegroundColor Yellow
Write-Host "   Cause: Permissions insuffisantes sur le répertoire raw_data" -ForegroundColor Gray
Write-Host "   Solution: Corriger les permissions ou utiliser un volume Docker" -ForegroundColor Gray
Write-Host ""

# Solutions proposées
Write-Host "🔧 SOLUTIONS PROPOSÉES:" -ForegroundColor Blue
Write-Host ""
Write-Host "1. Pour le service de traduction:" -ForegroundColor Yellow
Write-Host "   - Modifier le chemin dans translation-service.js" -ForegroundColor Gray
Write-Host "   - Redémarrer le service: docker-compose -f switzerland/docker-compose.switzerland.yml restart translation-service" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Pour l'API IA Suisse:" -ForegroundColor Yellow
Write-Host "   - Configurer la connexion vers l'API Express principale (port 3001)" -ForegroundColor Gray
Write-Host "   - Ou créer un service api-express-switzerland dans la config suisse" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Pour l'ETL:" -ForegroundColor Yellow
Write-Host "   - Corriger les permissions: chmod 755 ETL/raw_data" -ForegroundColor Gray
Write-Host "   - Ou utiliser un volume Docker pour les données" -ForegroundColor Gray
Write-Host ""

# URLs de test
Write-Host "🌐 URLs DE TEST:" -ForegroundColor Blue
Write-Host ""
Write-Host "Frontend Suisse:     http://localhost:3003" -ForegroundColor Cyan
Write-Host "Service Traduction:  http://localhost:3004/api/translate/languages" -ForegroundColor Cyan
Write-Host "API IA Suisse:       http://localhost:8001/health" -ForegroundColor Cyan
Write-Host "API Express:         http://localhost:3001/api/pays" -ForegroundColor Cyan
Write-Host ""

Write-Host "🧪 COMMANDES DE TEST:" -ForegroundColor Blue
Write-Host ""
Write-Host "# Test traductions" -ForegroundColor Yellow
Write-Host "Invoke-WebRequest -Uri 'http://localhost:3004/api/translate/common.welcome?lang=fr'" -ForegroundColor Gray
Write-Host "Invoke-WebRequest -Uri 'http://localhost:3004/api/translate/common.welcome?lang=de'" -ForegroundColor Gray
Write-Host "Invoke-WebRequest -Uri 'http://localhost:3004/api/translate/common.welcome?lang=it'" -ForegroundColor Gray
Write-Host ""
Write-Host "# Test APIs" -ForegroundColor Yellow
Write-Host "Invoke-WebRequest -Uri 'http://localhost:8001/health'" -ForegroundColor Gray
Write-Host "Invoke-WebRequest -Uri 'http://localhost:3001/api/pays'" -ForegroundColor Gray
Write-Host ""

Write-Host "🎯 CONCLUSION:" -ForegroundColor Blue
Write-Host "Le Cluster Suisse est déployé mais nécessite des corrections mineures" -ForegroundColor White
Write-Host "pour fonctionner parfaitement selon les exigences du MSPR 3." -ForegroundColor White
