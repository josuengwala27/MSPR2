# 🇫🇷 Architecture France - MSPR3

> **Déploiement spécialisé France conforme RGPD**  
> *Sans API technique MSPR1 - Connexion directe PostgreSQL*

## 🚀 Démarrage Rapide

```bash
# 1. Vérifier PostgreSQL local avec données
pg_isready -U postgres -h localhost -p 5432

# 2. Démarrer l'architecture France
docker-compose -f docker-compose-france.yml up --build -d

# 3. Accès aux services
# Frontend France: http://localhost:3080
# API IA France:   http://localhost:8001
# PostgreSQL:      localhost:5432 (base pandemies)
```

📖 **Guide détaillé** : [`docs/GUIDE-DEMARRAGE-FRANCE.md`](docs/GUIDE-DEMARRAGE-FRANCE.md)

## 📋 Spécifications France

### ✅ Conformité Sujet MSPR3
- ❌ **Pas d'API Express** (API technique MSPR1 exclue)
- ✅ **API IA avec connexion directe BDD**
- ✅ **Frontend React français**
- ✅ **Solution Dataviz MSPR1** (PowerBI + ETL)
- ✅ **ETL Pipeline** avec anonymisation
- ✅ **Conformité RGPD stricte**

### 🛡️ Exigences RGPD Respectées
- 🔐 **Chiffrement des données** (AES-256)
- 🎭 **Anonymisation automatique** (populations arrondies)
- 📝 **Logs d'audit complets** (rétention 3 ans)
- 🗑️ **Droit à l'effacement** (Article 17)
- 📤 **Export de données** (Article 20)
- 🇫🇷 **Interface française** native

---

## 🏗️ Architecture

```
🇫🇷 FRANCE CLUSTER
├── 🌐 Frontend (Port 3080)  → Interface française
├── 🧠 API IA (Port 8001)    → Connexion directe PostgreSQL  
├── 🗄️ PostgreSQL (Port 5432) → Base locale avec données réelles
├── ⚡ Redis (Port 6380)     → Cache sécurisé Docker
├── 🔄 ETL Pipeline          → Données déjà chargées
└── 📊 PowerBI Desktop       → Dashboard MSPR1 (connexion locale)
```

### Différences avec USA/Suisse
| Composant | USA | France | Suisse |
|-----------|-----|--------|--------|
| API Express | ✅ | ❌ | ❌ |
| API IA | ✅ | ✅ Direct BDD | ✅ |
| Frontend | ✅ EN | ✅ FR | ✅ FR/DE/IT |
| Dataviz MSPR1 | ✅ | ✅ | ❌ |
| RGPD | Standard | **Strict** | Standard |

---

## 📂 Fichiers Clés

### Configuration
```
docker-compose-france.yml     # Orchestration France
.env.france                   # Variables d'environnement
configs/france/               # Configurations RGPD
```

### Scripts de Gestion
```
scripts/france/
├── deploy-france.sh         # Déploiement automatisé
├── stop-france.sh           # Arrêt propre
├── backup-france.sh         # Sauvegarde RGPD
├── restore-france.sh        # Restauration sécurisée
└── monitor-france.sh        # Monitoring temps réel
```

### API IA France
```
AI_API/
├── main_france.py           # Point d'entrée France
├── Dockerfile.france        # Image spécialisée
├── requirements-france.txt  # Dépendances PostgreSQL
├── models/database_models.py # Modèles SQLAlchemy
└── services/database_service.py # Service direct BDD
```

### Documentation
```
docs/
├── architecture-france.md   # Architecture détaillée
├── docker-images-france.md  # Documentation images
└── README-FRANCE.md         # Ce fichier
```

---

## 🛠️ Commandes Essentielles

### Déploiement
```bash
# Déploiement complet
./scripts/france/deploy-france.sh

# Construction manuelle des images
docker-compose -f docker-compose-france.yml build

# Démarrage des services
docker-compose -f docker-compose-france.yml up -d
```

### Monitoring
```bash
# Statut instantané
./scripts/france/monitor-france.sh status

# Monitoring continu (Ctrl+C pour arrêter)
./scripts/france/monitor-france.sh continuous

# Tests de santé détaillés
./scripts/france/monitor-france.sh health

# Logs en temps réel
./scripts/france/monitor-france.sh logs
```

### Sauvegarde/Restauration
```bash
# Sauvegarde RGPD complète
./scripts/france/backup-france.sh

# Restauration (remplacer BACKUP_ID)
./scripts/france/restore-france.sh france_backup_20241106_143022

# Liste des sauvegardes disponibles
ls -la backups/france/
```

### Arrêt
```bash
# Arrêt propre avec sauvegarde automatique
./scripts/france/stop-france.sh

# Arrêt forcé
docker-compose -f docker-compose-france.yml down --remove-orphans
```

---

## 📊 PowerBI France (Solution Dataviz MSPR1)

### Configuration PowerBI
```bash
# 1. Démarrer l'architecture France
./scripts/france/deploy-france.sh

# 2. Vérifier PostgreSQL France
./scripts/france/monitor-france.sh database
```

### Connexion PowerBI Desktop
```
Serveur: localhost:5432
Base: pandemies
Utilisateur: postgres
Mot de passe: root
```

### Documentation PowerBI
- 📖 **Guide complet**: [`PowerBI/guide-adaptation-france.md`](PowerBI/guide-adaptation-france.md)
- 🔌 **Configuration**: [`PowerBI/connection-france.txt`](PowerBI/connection-france.txt)
- 📊 **Mesures DAX RGPD**: [`PowerBI/mesures-dax-france.txt`](PowerBI/mesures-dax-france.txt)

### Fonctionnalités RGPD
- ✅ Données anonymisées (population arrondie au millier)
- ✅ Limitation pays européens uniquement
- ✅ Export maximum 10k lignes
- ✅ Mesures DAX conformes RGPD
- ✅ Page conformité intégrée

### Pages du Dashboard
- **Vue d'ensemble Europe**: Cartes, KPI, courbes globales
- **Analyse pays**: Indicateurs normalisés par pays
- **Comparaison pays**: Analyses croisées multi-pays  
- **Export RGPD**: Données filtrées exportables
- **Conformité RGPD**: Contrôles et validation

---

## 🔍 Tests et Validation

### Tests de Connectivité
```bash
# PostgreSQL
docker-compose -f docker-compose-france.yml exec postgres-france pg_isready -U postgres_fr

# API IA France
curl http://localhost:8001/health

# Frontend France
curl http://localhost:3080

# Test spécifique base de données
curl http://localhost:8001/test-database
```

### Validation RGPD
```bash
# Export données personnelles (simulation)
curl http://localhost:8001/api/gdpr/data-export?user_country=france

# Test anonymisation
curl http://localhost:8001/api/data/ml-ready?pays=france&indicator=cases&limit=10

# Vérification chiffrement base
./scripts/france/monitor-france.sh database
```

---

## 🚨 Troubleshooting

### Problèmes Courants

**1. API IA ne démarre pas**
```bash
# Vérifier logs API IA
docker-compose -f docker-compose-france.yml logs api-ia-france

# Vérifier connexion PostgreSQL
docker-compose -f docker-compose-france.yml exec postgres-france pg_isready -U postgres_fr

# Restart API IA
docker-compose -f docker-compose-france.yml restart api-ia-france
```

**2. Base de données inaccessible**
```bash
# Logs PostgreSQL
docker-compose -f docker-compose-france.yml logs postgres-france

# Test de connexion direct
docker-compose -f docker-compose-france.yml exec postgres-france psql -U postgres_fr -d pandemies_db_france -c "SELECT 1;"
```

**3. Frontend France ne charge pas**
```bash
# Vérifier variables d'environnement
docker-compose -f docker-compose-france.yml exec frontend-france env | grep REACT_APP

# Logs Nginx
docker-compose -f docker-compose-france.yml logs frontend-france
```

**4. Erreurs RGPD**
```bash
# Vérifier configuration RGPD
grep -r "GDPR_COMPLIANCE" .env.france docker-compose-france.yml

# Test des endpoints RGPD
curl http://localhost:8001/api/gdpr/data-export?user_country=france
```

---

## 📊 Surveillance et Maintenance

### Métriques Importantes
- **Disponibilité services**: > 99.9%
- **Temps réponse API**: < 2s
- **Utilisation RAM**: < 80%
- **Espace disque**: < 85%

### Maintenance Automatique
```bash
# Sauvegarde quotidienne (crontab)
0 2 * * * /path/to/scripts/france/backup-france.sh

# Nettoyage logs hebdomadaire  
0 0 * * 0 find ./logs -name "*.log" -mtime +21 -delete

# Monitoring santé (toutes les 5 min)
*/5 * * * * /path/to/scripts/france/monitor-france.sh health
```

### Alertes Recommandées
- Service indisponible > 1 min
- Erreur base de données
- Espace disque < 15%
- Échec sauvegarde
- Anomalie RGPD

---

## 📚 Documentation Complète

### Liens Utiles
- 📖 [Architecture Détaillée](docs/architecture-france.md)
- 🐳 [Images Docker France](docs/docker-images-france.md)
- 🛡️ [Conformité RGPD](docs/architecture-france.md#-conformité-rgpd)
- 🔧 [Guide Troubleshooting](docs/architecture-france.md#-troubleshooting)

### APIs Disponibles
- 🌐 **Frontend**: http://localhost:3080
- 🧠 **API IA**: http://localhost:8001
- 📚 **Documentation API**: http://localhost:8001/docs
- 🔍 **Tests Santé**: http://localhost:8001/health

---

## 📞 Support

### Contacts
- **DPO France**: dpo@sante-france.fr
- **Support Technique**: support@sante-france.fr
- **Équipe DevOps**: devops@sante-france.fr

### Urgences
- **24h/7j**: +33 1 XX XX XX XX
- **Slack**: #mspr3-france-support
- **Escalade**: CTO OMS France

---

## ✅ Checklist de Déploiement

### Pré-déploiement
- [ ] Docker et Docker Compose installés
- [ ] Ports 3080, 8001, 5433, 6380 libres
- [ ] Espace disque suffisant (> 5GB)
- [ ] Variables d'environnement configurées

### Déploiement
- [ ] `./scripts/france/deploy-france.sh` exécuté avec succès
- [ ] Tous les services démarrés (4/4)
- [ ] Tests de connectivité passés
- [ ] Interface frontend accessible

### Post-déploiement
- [ ] Sauvegarde initiale créée
- [ ] Monitoring configuré
- [ ] Logs d'audit activés
- [ ] Tests RGPD validés
- [ ] Documentation à jour

---

**🇫🇷 Architecture France - MSPR3 - Version 1.0.0**  
*Conforme RGPD - Sans API technique MSPR1 - Connexion directe PostgreSQL*