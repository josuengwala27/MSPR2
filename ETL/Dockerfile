# Dockerfile pour l'ETL Python
FROM python:3.11-slim

# Variables d'environnement pour Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

# Installer les dépendances système
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        libc6-dev \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Créer un utilisateur non-root
RUN useradd --create-home --shell /bin/bash etl

# Définir le répertoire de travail
WORKDIR /app

# Copier les requirements et installer les dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY . .

# Créer les dossiers nécessaires
RUN mkdir -p /app/logs /app/processed /app/raw_data

# Changer les permissions
RUN chown -R etl:etl /app
USER etl

# Commande par défaut : lancer le pipeline ETL
CMD ["python", "scripts/run_etl_pipeline.py"]

