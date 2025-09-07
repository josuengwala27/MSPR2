const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3004;

const SUPPORTED_LANGUAGES = (process.env.SUPPORTED_LANGUAGES || 'fr,de,it').split(',');
const DEFAULT_LANGUAGE = process.env.DEFAULT_LANGUAGE || 'fr';
const FALLBACK_LANGUAGE = DEFAULT_LANGUAGE;

let translations = {};

// Fonction pour charger les traductions
const loadTranslations = () => {
    console.log('🔄 Chargement des traductions...');
    SUPPORTED_LANGUAGES.forEach(lang => {
        const filePath = path.join('/app', 'i18n', `${lang}.json`);
        try {
            if (fs.existsSync(filePath)) {
                const fileContent = fs.readFileSync(filePath, 'utf8');
                translations[lang] = JSON.parse(fileContent);
                console.log(`✅ Traductions chargées pour ${lang}`);
            } else {
                console.warn(`⚠️ Fichier de traduction manquant pour ${lang}: ${filePath}`);
                translations[lang] = {};
            }
        } catch (error) {
            console.error(`❌ Erreur lors du chargement des traductions pour ${lang}:`, error.message);
            translations[lang] = {};
        }
    });
    console.log(`📁 Traductions chargées pour ${Object.keys(translations).length} langues`);
};

// Fonction simplifiée pour naviguer dans la hiérarchie des traductions
const getTranslation = (obj, key) => {
    if (!obj || !key) return null;
    
    const keys = key.split('.');
    let current = obj;
    
    for (const k of keys) {
        if (current && typeof current === 'object' && k in current) {
            current = current[k];
        } else {
            return null;
        }
    }
    
    return typeof current === 'string' ? current : null;
};

// Chargement initial
loadTranslations();

// Middleware CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Middleware pour la détection de langue
app.use((req, res, next) => {
    const lang = req.headers['accept-language']?.split(',')[0]?.split('-')[0] || DEFAULT_LANGUAGE;
    req.lang = SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;
    next();
});

app.use(express.json());

// Route de santé
app.get('/api/translate/health', (req, res) => {
    res.status(200).json({
        success: true,
        service: 'translation-service-switzerland',
        status: 'healthy',
        supported_languages: SUPPORTED_LANGUAGES,
        default_language: DEFAULT_LANGUAGE,
        loaded_translations: Object.keys(translations),
        timestamp: new Date().toISOString()
    });
});

// Route de traduction principale
app.get('/api/translate/:key', (req, res) => {
    const { key } = req.params;
    const lang = req.query.lang || DEFAULT_LANGUAGE;
    
    // Vérifier que la langue est supportée
    const targetLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;
    
    // Récupérer la traduction en naviguant dans la hiérarchie
    let translation = getTranslation(translations[targetLang], key);
    
    // Fallback vers la langue par défaut si pas trouvé
    if (!translation && targetLang !== DEFAULT_LANGUAGE) {
        translation = getTranslation(translations[DEFAULT_LANGUAGE], key);
    }
    
    // Fallback vers la clé si toujours pas trouvé
    if (!translation) {
        translation = key;
    }

    res.status(200).json({
        success: true,
        key,
        language: targetLang,
        translation,
        fallback_used: targetLang !== lang,
        timestamp: new Date().toISOString()
    });
});

// Route pour obtenir toutes les traductions d'une langue
app.get('/api/translate/language/:lang', (req, res) => {
    const { lang } = req.params;
    const targetLang = SUPPORTED_LANGUAGES.includes(lang) ? lang : DEFAULT_LANGUAGE;
    
    res.status(200).json({
        success: true,
        language: targetLang,
        translations: translations[targetLang] || {},
        timestamp: new Date().toISOString()
    });
});

// Route pour recharger les traductions
app.post('/api/translate/reload', (req, res) => {
    try {
        loadTranslations();
        res.status(200).json({
            success: true,
            message: 'Traductions rechargées avec succès',
            loaded_languages: Object.keys(translations),
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error('❌ Erreur dans le service de traduction:', err);
    res.status(500).json({
        success: false,
        error: 'Erreur interne du serveur',
        timestamp: new Date().toISOString()
    });
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Service de traduction Suisse démarré sur le port ${PORT}`);
    console.log(`📚 Langues supportées: ${SUPPORTED_LANGUAGES.join(', ')}`);
    console.log(`🌍 Langue par défaut: ${DEFAULT_LANGUAGE}`);
    console.log(`🔄 Langue de fallback: ${FALLBACK_LANGUAGE}`);
    console.log(`📁 Traductions disponibles: ${Object.keys(translations).join(', ')}`);
});