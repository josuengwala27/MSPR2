#!/bin/bash
# Script pour voir les logs Docker

echo "📋 Affichage des logs Docker..."

if [ $# -eq 0 ]; then
    # Afficher tous les logs
    echo "📊 Logs de tous les services:"
    docker-compose logs -f --tail=50
else
    # Afficher les logs d'un service spécifique
    echo "📊 Logs du service $1:"
    docker-compose logs -f --tail=50 $1
fi

