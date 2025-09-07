# Guide de Démarrage Rapide - Architecture France 🇫🇷

## 📋 Prérequis

1. **PostgreSQL local** installé et démarré
2. **Base de données `pandemies`** avec données chargées 
3. **Docker Desktop** installé et démarré
4. **Prisma Studio** accessible (`npm run prisma:studio` dans `/BDD`)

## 🚀 Démarrage en 3 étapes

### Étape 1 : Vérifier les prérequis
```bash
# Vérifier PostgreSQL local
pg_isready -U postgres -h localhost -p 5432

# Vérifier la base de données
psql -U postgres -h localhost -p 5432 -d pandemies -c "SELECT COUNT(*) FROM donnee_historique;"

# Vérifier Docker
docker --version
```

### Étape 2 : Démarrer l'architecture France
```bash
# Aller dans le répertoire du projet
cd /Users/berdan/Ecoles/MSPR2

# Démarrer la stack France
docker-compose -f docker-compose-france.yml up --build -d
```

### Étape 3 : Vérifier le déploiement
```bash
# Vérifier les logs de l'API IA France
docker-compose -f docker-compose-france.yml logs api-ia-france

# Vous devez voir :
# ✅ Connexion directe à PostgreSQL établie
# INFO: Application startup complete.
```

## 🌐 Accès aux services

Une fois démarré, les services sont accessibles :

- **🇫🇷 Frontend France** : [http://localhost:3080](http://localhost:3080)
- **🤖 API IA France** : [http://localhost:8001](http://localhost:8001)
- **📊 PostgreSQL** : `localhost:5432` (base `pandemies`)
- **⚡ Redis Cache** : `localhost:6380`

## ✅ Tests de vérification

```bash
# Test API IA France
curl http://localhost:8001/

# Test santé des conteneurs
docker-compose -f docker-compose-france.yml ps

# Tous les services doivent être "Up"
```

## 🛑 Arrêt des services

```bash
# Arrêt propre de la stack France
docker-compose -f docker-compose-france.yml down
```

## 🔧 Configuration technique

### Variables d'environnement (automatique)
- `DATABASE_URL=postgresql://postgres:root@host.docker.internal:5432/pandemies`
- `FRANCE_MODE=true`
- `GDPR_COMPLIANCE=true`

### Ports utilisés
- `3080` - Frontend France (Nginx + React)
- `8001` - API IA France (FastAPI)
- `6380` - Redis France (Cache)
- `5432` - PostgreSQL local (existant)

### Architecture
```
Frontend France (3080) 
    ↓ HTTP
API IA France (8001)
    ↓ SQL Direct
PostgreSQL Local (5432)
```

## ❗ Troubleshooting

### Problème : API IA ne démarre pas
```bash
# Vérifier les logs
docker-compose -f docker-compose-france.yml logs -f api-ia-france

# Solutions courantes :
# 1. PostgreSQL local démarré ?
# 2. Base 'pandemies' existe ?
# 3. Utilisateur 'postgres' / mot de passe 'root' ?
```

### Problème : Port déjà utilisé
```bash
# Vérifier les ports utilisés
lsof -i :3080 -i :8001 -i :6380

# Arrêter les anciens conteneurs
docker stop $(docker ps -q)
```

### Problème : Base de données vide
```bash
# Vérifier les données dans Prisma Studio
cd BDD
npm run prisma:studio

# Ou en ligne de commande
psql -U postgres -h localhost -p 5432 -d pandemies -c "\dt"
```

## 📚 Documentation complète

- **Architecture détaillée** : [`docs/architecture-france.md`](./architecture-france.md)
- **Configuration Docker** : [`docker-compose-france.yml`](../docker-compose-france.yml)
- **PowerBI France** : [`PowerBI/`](../PowerBI/)

---

✅ **Architecture France opérationnelle !** 
🇫🇷 Conforme RGPD avec connexion directe PostgreSQL