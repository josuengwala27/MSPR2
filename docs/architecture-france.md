# Architecture France - MSPR3

## 🇫🇷 Vue d'ensemble

L'architecture France est une variante spécialisée du système OMS, conçue pour respecter strictement les exigences du RGPD et les spécifications du cahier des charges MSPR3.

### Caractéristiques clés
- ✅ **Pas d'API Express** (API technique MSPR1 exclue)
- ✅ **Connexion directe PostgreSQL** par l'API IA
- ✅ **Conformité RGPD stricte** (chiffrement, anonymisation)
- ✅ **Interface française** native
- ✅ **Accès mobile optimisé**

## 📊 Diagramme d'Architecture

```mermaid
graph TD
    subgraph "🇫🇷 Cluster France"
        subgraph "Frontend Tier"
            F[Frontend React<br/>Port 3080<br/>Interface française]
        end
        
        subgraph "API Tier"  
            API[API IA France<br/>Port 8001<br/>Connexion directe BDD]
        end
        
        subgraph "Data Tier"
            DB[(PostgreSQL Local<br/>Port 5432<br/>Base: pandemies)]
            REDIS[(Redis France<br/>Port 6380<br/>Cache sécurisé)]
        end
        
        subgraph "Processing Tier"
            ETL[ETL Pipeline<br/>Mode France<br/>Anonymisation RGPD]
        end
    end
    
    subgraph "🗄️ Données Sources"
        DATAVIZ[Solution Dataviz<br/>MSPR1]
        POWERBI[PowerBI Desktop<br/>Connexion PostgreSQL Local<br/>Port 5432]
    end
    
    subgraph "🛡️ Sécurité RGPD"
        ENCRYPT[Chiffrement AES-256]
        ANON[Anonymisation automatique]
        AUDIT[Logs d'audit RGPD]
    end
    
    F -->|HTTP/HTTPS| API
    API -->|SQL Direct| DB
    API -->|Cache| REDIS  
    ETL -->|Données| DB
    DATAVIZ -->|Import| ETL
    POWERBI -->|SQL Direct| DB
    
    API -.->|Protection| ENCRYPT
    API -.->|Anonymisation| ANON
    API -.->|Audit| AUDIT
    
    style F fill:#e1f5fe
    style API fill:#fff3e0
    style DB fill:#f3e5f5
    style ETL fill:#e8f5e8
    style DATAVIZ fill:#fce4ec
```

## 🏗️ Composants de l'Architecture

### 1. Frontend France
- **Image**: `pandemies-frontend-france`
- **Port**: 3080
- **Technologie**: React + Nginx
- **Spécificités**:
  - Interface 100% française
  - Design responsive mobile-first
  - Conformité WCAG 2.1 AA
  - Pas d'appels vers API Express

**Variables d'environnement**:
```bash
REACT_APP_AI_API_URL=http://localhost:8001
REACT_APP_COUNTRY=france
REACT_APP_LOCALE=fr-FR
REACT_APP_GDPR_ENABLED=true
REACT_APP_FRANCE_MODE=true
```

### 2. API IA France
- **Image**: `pandemies-api-ia-france`  
- **Port**: 8001
- **Technologie**: FastAPI + SQLAlchemy + PostgreSQL
- **Spécificités**:
  - Connexion directe à PostgreSQL (sans API Express)
  - Anonymisation RGPD automatique
  - Chiffrement des données sensibles
  - Routes spécifiques conformité RGPD

**Variables d'environnement**:
```bash
DATABASE_URL=postgresql://postgres:root@host.docker.internal:5432/pandemies
FRANCE_MODE=true
DIRECT_DB_ACCESS=true
GDPR_COMPLIANCE=true
DATA_ANONYMIZATION=true
PERSONAL_DATA_ENCRYPTION=true
```

**Endpoints spéciaux France**:
- `GET /api/gdpr/data-export` - Export données RGPD
- `DELETE /api/gdpr/data-deletion` - Suppression données RGPD
- `GET /api/predictions/mortality` - Prédictions avec anonymisation

### 3. PostgreSQL Local
- **Type**: PostgreSQL local (hors Docker)
- **Port**: 5432
- **Base**: `pandemies`
- **Utilisateur**: `postgres` / `root`
- **Spécificités**:
  - Base de données existante avec données réelles
  - Accès via `host.docker.internal` depuis Docker
  - Compatible RGPD avec anonymisation au niveau API

**Configuration RGPD**:
```sql
-- Logging et audit (RGPD Article 30)
log_statement = 'all'
log_connections = on
log_disconnections = on

-- Chiffrement
ssl = on
password_encryption = scram-sha-256

-- Rétention RGPD
log_rotation_age = 1d
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
```

### 4. Redis France
- **Image**: `redis:7-alpine`
- **Port**: 6380
- **Spécificités**:
  - Authentification par mot de passe
  - Persistance avec AOF
  - Pas de données personnelles stockées

### 5. ETL Pipeline France
- **Image**: `pandemies-etl-france`
- **Mode**: Démarrage sur demande
- **Spécificités**:
  - Anonymisation des données à l'ingestion
  - Conformité RGPD sur les transformations
  - Logs d'audit complets

### 6. PowerBI France (Solution Dataviz MSPR1)
- **Application**: PowerBI Desktop/Service
- **Connexion**: PostgreSQL Local (port 5432)
- **Spécificités**:
  - Dashboard multi-pages avec filtres dynamiques
  - Mesures DAX anonymisées RGPD
  - Limitation aux pays européens
  - Export conforme (max 10k lignes)

**Configuration de connexion :**
```
Serveur: localhost:5432
Base: pandemies
Utilisateur: postgres
Mot de passe: root
```

**Mesures DAX spécialisées :**
- `Total_Cas_France` (anonymisé, arrondi centaines)
- `Total_Deces_France` (anonymisé, arrondi dizaines)
- `Population_RGPD` (arrondi milliers)
- `Conformite_RGPD` (indicateur de conformité)

**Pages du dashboard :**
- Vue d'ensemble Europe (cartes, KPI)
- Analyse pays Europe (indicateurs normalisés)
- Comparaison pays (courbes, radar)
- Export RGPD (données filtrées)
- Conformité RGPD (contrôles)

**Filtres dynamiques RGPD :**
- Filtre temporel (depuis 2020)
- Filtre pays européens uniquement
- Filtre indicateur (cas, décès, incidence)
- Filtre source (COVID-19, MPOX)

**Documentation PowerBI :** [`PowerBI/`](../PowerBI/)
- `connection-france.txt` - Configuration connexion
- `mesures-dax-france.txt` - Mesures DAX RGPD
- `guide-adaptation-france.md` - Guide complet

## 🛡️ Conformité RGPD

### Anonymisation des données
```python
# Exemple d'anonymisation automatique
if os.getenv("DATA_ANONYMIZATION") == "true":
    for record in data.get('data', []):
        # Population arrondie au millier
        if record.get('population'):
            record['population'] = round(record['population'] / 1000) * 1000
```

### Chiffrement
- **Base de données**: SSL/TLS obligatoire
- **API**: HTTPS uniquement en production
- **Sauvegardes**: Chiffrement GPG AES-256

### Rétention des données
- **Données personnelles**: 3 ans maximum
- **Logs d'audit**: 3 ans pour conformité
- **Sauvegardes**: Suppression automatique après 3 ans

### Droits des utilisateurs
- **Article 20**: Export de données personnelles
- **Article 17**: Droit à l'effacement
- **Article 13**: Information transparente

## 🚀 Déploiement

### Prérequis
1. **PostgreSQL local** démarré avec base `pandemies` 
2. **Docker Desktop** en cours d'exécution
3. **Données ETL** chargées dans PostgreSQL local

### Déploiement manuel
```bash
# Configuration France utilisant la base locale existante
docker-compose -f docker-compose-france.yml up --build -d

# Services démarrés :
# - Redis France (port 6380)  
# - API IA France (port 8001) → se connecte à PostgreSQL local
# - Frontend France (port 3080)
```

### Accès aux services
- **Frontend France** : http://localhost:3080
- **API IA France** : http://localhost:8001  
- **PostgreSQL** : localhost:5432 (base `pandemies`)
- **Redis Cache** : localhost:6380

### Vérification du déploiement
```bash
# Statut des services
./scripts/france/monitor-france.sh status

# Monitoring continu
./scripts/france/monitor-france.sh continuous

# Tests de santé
./scripts/france/monitor-france.sh health
```

## 💾 Sauvegarde et Restauration

### Sauvegarde RGPD
```bash
# Sauvegarde complète avec anonymisation
./scripts/france/backup-france.sh

# Fichiers créés :
# - Base complète chiffrée
# - Base anonymisée RGPD
# - Métadonnées de conformité
# - Checksums d'intégrité
```

### Restauration sécurisée
```bash
# Restauration avec vérification d'intégrité
./scripts/france/restore-france.sh france_backup_20241106_143022

# Processus :
# 1. Vérification intégrité
# 2. Arrêt services
# 3. Restauration base
# 4. Audit post-restauration
# 5. Redémarrage services
```

## 📊 Monitoring et Logs

### Métriques surveillées
- État des services (PostgreSQL, API IA, Frontend, Redis)
- Utilisation ressources (CPU, RAM, Disque)
- Connectivité et temps de réponse
- Intégrité base de données

### Logs RGPD
- **Anonymisation**: Suppression automatique des données personnelles
- **Rétention**: 3 ans maximum
- **Archivage**: Compression et chiffrement
- **Audit**: Traçabilité complète des accès

### Alertes
- Service indisponible
- Utilisation excessive de ressources  
- Erreurs base de données
- Échecs de sauvegarde

## 🔧 Maintenance

### Tâches régulières
```bash
# Sauvegarde quotidienne
0 2 * * * /path/to/scripts/france/backup-france.sh

# Nettoyage logs hebdomadaire
0 0 * * 0 find ./logs -name "*.log" -mtime +21 -delete

# Vérification intégrité mensuelle
0 0 1 * * ./scripts/france/monitor-france.sh database
```

### Mise à jour
```bash
# Arrêt propre
./scripts/france/stop-france.sh

# Mise à jour images
docker-compose -f docker-compose-france.yml build --no-cache

# Redéploiement
./scripts/france/deploy-france.sh
```

## 🔍 Troubleshooting

### Problèmes courants

**1. API IA ne démarre pas**
```bash
# Vérifier les logs
docker-compose -f docker-compose-france.yml logs api-ia-france

# Vérifier la connexion BDD
./scripts/france/monitor-france.sh health
```

**2. Base de données inaccessible**
```bash
# Vérifier PostgreSQL local
pg_isready -U postgres -h localhost -p 5432

# Vérifier la connexion depuis l'API IA
docker-compose -f docker-compose-france.yml exec api-ia-france python -c "
import psycopg2
conn = psycopg2.connect('postgresql://postgres:root@host.docker.internal:5432/pandemies')
print('✅ Connexion BDD OK')
"
```

**3. Erreurs RGPD**
```bash
# Vérifier configuration RGPD
grep -r "GDPR_COMPLIANCE" .env.france

# Audit RGPD
./scripts/france/backup-france.sh  # Génère un audit complet
```

## 📞 Support

**DPO (Data Protection Officer)**: `dpo@sante-france.fr`
**Support technique**: `support@sante-france.fr`
**Documentation**: Cette documentation + `/docs` de l'API

---

*Architecture France - Version 1.0.0 - Conformité RGPD 2025* 🇫🇷