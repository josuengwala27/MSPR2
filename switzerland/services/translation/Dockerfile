FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install --omit=dev

# Copier le code source
COPY translation-service.js ./

# Créer le dossier i18n
RUN mkdir -p i18n

# Exposer le port
EXPOSE 3004

# Variables d'environnement
ENV PORT=3004
ENV SUPPORTED_LANGUAGES=fr,de,it
ENV DEFAULT_LANGUAGE=fr
ENV FALLBACK_LANGUAGE=fr

# Commande de démarrage
CMD ["node", "translation-service.js"]