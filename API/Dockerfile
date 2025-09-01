# Dockerfile pour l'API Express.js
FROM node:18-slim

# Installer les dépendances système nécessaires pour Prisma
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Créer un utilisateur non-root pour la sécurité
RUN groupadd --gid 1001 nodejs
RUN useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nodejs

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Copier le code source
COPY . .

# Générer le client Prisma
RUN npx prisma generate

# Changer les permissions
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exposer le port 3001
EXPOSE 3001

# Vérifier la santé de l'application
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Démarrer l'application
CMD ["npm", "start"]
