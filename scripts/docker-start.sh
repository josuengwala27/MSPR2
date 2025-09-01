#!/bin/bash
# Script pour démarrer l'environnement Docker

echo "🐳 Démarrage de l'environnement Docker Pandemies OMS..."

# Vérifier que Docker est installé et démarré
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop."
    exit 1
fi

# Copier le fichier d'environnement
if [ ! -f .env ]; then
    cp docker.env .env
    echo "📋 Fichier .env créé à partir de docker.env"
fi

# Construire les images
echo "🔨 Construction des images Docker..."
docker-compose build --no-cache

# Démarrer les services (sans ETL)
echo "🚀 Démarrage des services..."
docker-compose up -d

# Attendre que la base de données soit prête
echo "⏳ Attente de la base de données..."
sleep 10

# Vérifier l'état des services
echo "📊 État des services:"
docker-compose ps

# Afficher les logs en cas d'erreur
echo "📋 Vérification des logs..."
docker-compose logs --tail=20

echo ""
echo "✅ Environnement Docker démarré!"
echo ""
echo "🌐 Services disponibles:"
echo "   Frontend:     http://localhost:3000"
echo "   API Express:  http://localhost:3001"
echo "   API IA:       http://localhost:8000"
echo "   Swagger IA:   http://localhost:8000/docs"
echo "   PostgreSQL:   localhost:5432"
echo ""
echo "🔧 Commandes utiles:"
echo "   Voir les logs:        docker-compose logs -f"
echo "   Arrêter:             docker-compose down"
echo "   Lancer l'ETL:        docker-compose --profile etl up etl"
echo "   Redémarrer:          docker-compose restart"

