#!/bin/bash
# Script pour lancer l'ETL Docker

echo "⚙️ Lancement du pipeline ETL..."

# Vérifier que la base de données est accessible
echo "🔍 Vérification de la base de données..."
docker-compose exec postgres pg_isready -U postgres -d pandemies_db

if [ $? -eq 0 ]; then
    echo "✅ Base de données accessible"
    
    # Lancer le pipeline ETL
    echo "🚀 Démarrage du pipeline ETL..."
    docker-compose --profile etl up etl
    
    echo "✅ Pipeline ETL terminé!"
else
    echo "❌ Base de données non accessible. Vérifiez que les services sont démarrés."
    exit 1
fi

