# Script de test complet - Cluster Suisse MSPR 3 (PowerShell)
# Vérifie toutes les fonctionnalités et endpoints

Write-Host "🧪 TESTS COMPLETS - CLUSTER SUISSE MSPR 3" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour tester un endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Name,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "Test $Name... " -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "✅ OK" -ForegroundColor Green
            Write-Host "  (HTTP $($response.StatusCode))" -ForegroundColor Gray
            return $true
        } else {
            Write-Host "❌ FAIL" -ForegroundColor Red
            Write-Host "  (HTTP $($response.StatusCode))" -ForegroundColor Gray
            return $false
        }
    } catch {
        Write-Host "❌ FAIL" -ForegroundColor Red
        Write-Host "  (Erreur: $($_.Exception.Message))" -ForegroundColor Gray
        return $false
    }
}

# Fonction pour tester le contenu JSON
function Test-JsonEndpoint {
    param(
        [string]$Url,
        [string]$Name,
        [string]$ExpectedField
    )
    
    Write-Host "Test $Name... " -NoNewline
    
    try {
        $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 10
        $json = $response.Content | ConvertFrom-Json
        
        if ($json -match $ExpectedField) {
            Write-Host "✅ OK" -ForegroundColor Green
            Write-Host "  (Contient '$ExpectedField')" -ForegroundColor Gray
            return $true
        } else {
            Write-Host "❌ FAIL" -ForegroundColor Red
            Write-Host "  (Ne contient pas '$ExpectedField')" -ForegroundColor Gray
            return $false
        }
    } catch {
        Write-Host "❌ FAIL" -ForegroundColor Red
        Write-Host "  (Erreur: $($_.Exception.Message))" -ForegroundColor Gray
        return $false
    }
}

Write-Host "🔍 VÉRIFICATION DES SERVICES DOCKER" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

# Vérifier que les conteneurs sont en cours d'exécution
$services = @(
    "pandemies-frontend-switzerland",
    "pandemies-api-ia-switzerland", 
    "pandemies-api-express-switzerland",
    "pandemies-postgres-switzerland",
    "pandemies-redis-switzerland",
    "pandemies-translation-switzerland"
)

$runningServices = 0
foreach ($service in $services) {
    Write-Host "Service $service... " -NoNewline
    $container = docker ps --format "table {{.Names}}" | Select-String $service
    if ($container) {
        Write-Host "✅ RUNNING" -ForegroundColor Green
        $runningServices++
    } else {
        Write-Host "❌ NOT RUNNING" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🌐 TESTS DES ENDPOINTS FRONTEND" -ForegroundColor Yellow
Write-Host "-------------------------------" -ForegroundColor Yellow

# Test du frontend
$frontendTest = Test-Endpoint "http://localhost:3003" "Frontend Suisse"

Write-Host ""
Write-Host "🤖 TESTS DES APIs" -ForegroundColor Yellow
Write-Host "-----------------" -ForegroundColor Yellow

# Tests API IA Suisse
$apiIaHealth = Test-Endpoint "http://localhost:8001/health" "API IA Health"
$apiIaDocs = Test-Endpoint "http://localhost:8001/docs" "API IA Documentation"

# Tests API Express Suisse
$apiExpressPays = Test-Endpoint "http://localhost:3002/api/pays" "API Express Pays"
$apiExpressDocs = Test-Endpoint "http://localhost:3002/api-docs" "API Express Documentation"

# Tests Service Traduction
$translationFr = Test-Endpoint "http://localhost:3004/api/translate/language/fr" "Service Traduction FR"
$translationDe = Test-Endpoint "http://localhost:3004/api/translate/language/de" "Service Traduction DE"
$translationIt = Test-Endpoint "http://localhost:3004/api/translate/language/it" "Service Traduction IT"

Write-Host ""
Write-Host "🌍 TESTS MULTI-LANGUE" -ForegroundColor Yellow
Write-Host "---------------------" -ForegroundColor Yellow

# Tester les 3 langues
$languages = @("fr", "de", "it")
$languageNames = @("Français", "Deutsch", "Italiano")

$languageTests = 0
for ($i = 0; $i -lt $languages.Count; $i++) {
    $lang = $languages[$i]
    $name = $languageNames[$i]
    
    Write-Host "Test langue $name... " -NoNewline
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3004/api/translate/language/$lang" -UseBasicParsing -TimeoutSec 10
        $json = $response.Content | ConvertFrom-Json
        
        if ($json.language -eq $lang) {
            Write-Host "✅ OK" -ForegroundColor Green
            $languageTests++
        } else {
            Write-Host "❌ FAIL" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ FAIL" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📊 RÉSUMÉ DES TESTS" -ForegroundColor Yellow
Write-Host "-------------------" -ForegroundColor Yellow

# Compter les tests réussis
$totalTests = $services.Count + 7 + $languages.Count  # Services + endpoints + langues
$passedTests = $runningServices

# Ajouter les tests d'endpoints
$endpointTests = @($frontendTest, $apiIaHealth, $apiIaDocs, $apiExpressPays, $apiExpressDocs, $translationFr, $translationDe, $translationIt)
foreach ($test in $endpointTests) {
    if ($test) { $passedTests++ }
}

# Ajouter les tests de langues
$passedTests += $languageTests

# Calculer le pourcentage
$percentage = [math]::Round(($passedTests * 100 / $totalTests), 1)

Write-Host "Tests réussis : $passedTests/$totalTests ($percentage%)" -ForegroundColor Cyan

if ($percentage -ge 90) {
    Write-Host "🎉 EXCELLENT ! Cluster Suisse opérationnel" -ForegroundColor Green
} elseif ($percentage -ge 80) {
    Write-Host "✅ BON ! Quelques ajustements mineurs nécessaires" -ForegroundColor Yellow
} else {
    Write-Host "⚠️ ATTENTION ! Problèmes détectés" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 CLUSTER SUISSE MSPR 3 - TESTS TERMINÉS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
