# Dockerfile pour l'API IA (FastAPI) - Version optimisée
FROM python:3.11-slim

# Variables d'environnement pour Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# Installer les dépendances système minimales
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        g++ \
        libc6-dev \
        curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Créer un utilisateur non-root
RUN useradd --create-home --shell /bin/bash app

# Définir le répertoire de travail
WORKDIR /app

# Copier les requirements et installer les dépendances Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code source
COPY . .

# Changer les permissions
RUN chown -R app:app /app
USER app

# Exposer le port 8000
EXPOSE 8000

# Vérifier la santé de l'application
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import requests; requests.get('http://localhost:8000/health', timeout=5)"

# Démarrer l'application avec Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
