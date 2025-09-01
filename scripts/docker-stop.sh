#!/bin/bash
# Script pour arrêter l'environnement Docker

echo "🛑 Arrêt de l'environnement Docker Pandemies OMS..."

# Arrêter tous les services
docker-compose down

# Optionnel : supprimer les volumes (données)
read -p "🗑️  Voulez-vous supprimer les données (volumes) ? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose down -v
    echo "📦 Volumes supprimés"
fi

# Optionnel : supprimer les images
read -p "🖼️  Voulez-vous supprimer les images Docker ? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker-compose down --rmi all
    echo "🖼️ Images supprimées"
fi

# Nettoyer les ressources inutilisées
docker system prune -f

echo "✅ Environnement Docker arrêté!"

