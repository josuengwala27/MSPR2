const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @swagger
 * tags:
 *   name: DonneesHistoriques
 *   description: Gestion des données historiques
 */

/**
 * @swagger
 * /api/donnees-historiques:
 *   get:
 *     summary: Récupère les données historiques (pagination)
 *     tags: [DonneesHistoriques]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste paginée des données historiques
 */
// GET toutes les données historiques (avec pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    
    const donnees = await prisma.donneeHistorique.findMany({
      skip,
      take: limit,
      orderBy: {
        date: 'desc'
      }
    });
    
    const total = await prisma.donneeHistorique.count();
    
    res.json({
      data: donnees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Liste des features calculées et brutes (hors id)
const ML_FEATURES = [
  'date',
  'value',
  'population',
  'cases_per_100k',
  'deaths_per_100k',
  'incidence_7j',
  'growth_rate',
  'source',
  'moyenne_7j',
  'moyenne_14j',
  'moyenne_30j',
  'ecart_type_7j',
  'min_7j',
  'max_7j',
  'tendance_7j',
  'croissance',
  'acceleration'
];

// Endpoint pour lister dynamiquement les features disponibles
/**
 * @swagger
 * /api/donnees-historiques/features:
 *   get:
 *     summary: "Liste des features disponibles pour le ML"
 *     tags: [DonneesHistoriques]
 *     responses:
 *       200:
 *         description: "Liste des features calculées et brutes"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 features:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.get('/features', (req, res) => {
  res.json({ features: ML_FEATURES });
});

// Ajout d'un middleware pour vérifier la présence de 'source' sur les routes analytiques
function requireSource(req, res, next) {
  if (!req.query.source) {
    return res.status(400).json({ error: "Le paramètre 'source' (ex: covid, mpox) est obligatoire." });
  }
  next();
}

/**
 * @swagger
 * /api/donnees-historiques/ml-ready:
 *   get:
 *     summary: "Données historiques formatées pour le Machine Learning"
 *     tags: [DonneesHistoriques]
 *     parameters:
 *       - in: query
 *         name: pays
 *         schema:
 *           type: string
 *         required: true
 *         description: "Nom du pays ou code ISO"
 *       - in: query
 *         name: indicator
 *         schema:
 *           type: string
 *         required: true
 *         description: "Indicateur (ex: cases, deaths)"
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         required: true
 *         description: "Source des données (ex: covid, mpox)"
 *       - in: query
 *         name: dateDebut
 *         schema:
 *           type: string
 *           format: date
 *         description: "Date de début (optionnel)"
 *       - in: query
 *         name: dateFin
 *         schema:
 *           type: string
 *           format: date
 *         description: "Date de fin (optionnel)"
 *       - in: query
 *         name: features
 *         schema:
 *           type: string
 *         description: "Liste des features à retourner (ex: moyenne_7j,croissance)"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: "Nombre maximum de lignes (défaut: 1000)"
 *     responses:
 *       200:
 *         description: "Données historiques enrichies pour ML"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 meta:
 *                   type: object
 *                   properties:
 *                     pays:
 *                       type: string
 *                     indicator:
 *                       type: string
 *                     source:
 *                       type: string
 *                     features:
 *                       type: array
 *                       items:
 *                         type: string
 *                     count:
 *                       type: integer
 */
router.get('/ml-ready', requireSource, async (req, res) => {
  try {
    const { pays, indicator, source, dateDebut, dateFin, features, limit = 1000 } = req.query;
    if (!pays || !indicator) {
      return res.status(400).json({ error: 'Paramètres pays et indicator requis' });
    }
    if (!source) {
      return res.status(400).json({ error: "Le paramètre 'source' (ex: covid, mpox) est obligatoire." });
    }
    // Construction du filtre
    let where = { country: pays, indicator };
    if (source) where.source = source;
    if (dateDebut || dateFin) {
      where.date = {};
      if (dateDebut) where.date.gte = new Date(dateDebut);
      if (dateFin) where.date.lte = new Date(dateFin);
    }
    // Récupération des données brutes
    const donnees = await prisma.donneeHistorique.findMany({
      where,
      orderBy: { date: 'asc' },
      take: parseInt(limit)
    });
    if (!donnees || donnees.length === 0) {
      return res.status(404).json({ error: 'Aucune donnée trouvée' });
    }
    // Regroupement par date
    const map = new Map();
    for (const row of donnees) {
      const date = row.date instanceof Date ? row.date.toISOString() : row.date;
      if (!map.has(date)) map.set(date, []);
      map.get(date).push(row);
    }
    let allFeatures = [];
    const dataML = Array.from(map.entries()).map(([date, rows], idx, arr) => {
      // Agrégation (moyenne) pour chaque champ numérique
      function avg(key) {
        const vals = rows.map(r => r[key]).filter(v => v !== null && v !== undefined);
        if (!vals.length) return null;
        if (typeof vals[0] === 'string' && !isNaN(Number(vals[0]))) return vals[0]; // population BigInt as string
        return vals.reduce((a, b) => a + b, 0) / vals.length;
      }
      // Pour source, on prend la première valeur (toutes les lignes d'une même date ont la même source)
      let enriched = {
        date,
        value: avg('value'),
        population: rows[0].population,
        cases_per_100k: avg('cases_per_100k'),
        deaths_per_100k: avg('deaths_per_100k'),
        incidence_7j: avg('incidence_7j'),
        growth_rate: avg('growth_rate'),
        source: rows[0].source, // Ajout de la source pour distinguer COVID vs MPOX
        // Les features calculées seront null ici, elles seront calculées après sur le tableau final
      };
      if (idx === 0) {
        allFeatures = Object.keys(enriched);
      }
      return enriched;
    });
    // Calcul des features glissantes sur le tableau agrégé
    const dataMLFinal = dataML.map((row, idx, arr) => {
      // Moyennes mobiles
      let moyenne_7j = null, moyenne_14j = null, moyenne_30j = null;
      if (idx >= 6) {
        const sum = arr.slice(idx - 6, idx + 1).reduce((acc, r) => acc + (r.value || 0), 0);
        moyenne_7j = sum / 7;
      }
      if (idx >= 13) {
        const sum = arr.slice(idx - 13, idx + 1).reduce((acc, r) => acc + (r.value || 0), 0);
        moyenne_14j = sum / 14;
      }
      if (idx >= 29) {
        const sum = arr.slice(idx - 29, idx + 1).reduce((acc, r) => acc + (r.value || 0), 0);
        moyenne_30j = sum / 30;
      }
      // Écart-type, min, max sur 7 jours
      let ecart_type_7j = null, min_7j = null, max_7j = null;
      if (idx >= 6) {
        const window = arr.slice(idx - 6, idx + 1).map(r => r.value || 0);
        const mean = window.reduce((a, b) => a + b, 0) / 7;
        ecart_type_7j = Math.sqrt(window.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / 7);
        min_7j = Math.min(...window);
        max_7j = Math.max(...window);
      }
      // Tendance (pente de régression linéaire sur 7 jours)
      let tendance_7j = null;
      if (idx >= 6) {
        const window = arr.slice(idx - 6, idx + 1).map(r => r.value || 0);
        const n = 7;
        const sumX = 21;
        const sumX2 = 91;
        const sumY = window.reduce((a, b) => a + b, 0);
        const sumXY = window.reduce((a, b, i) => a + b * i, 0);
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        tendance_7j = slope;
      }
      // Croissance (taux de croissance par rapport à la veille)
      let croissance = null;
      if (idx > 0 && arr[idx - 1].value && arr[idx - 1].value !== 0) {
        croissance = (row.value - arr[idx - 1].value) / arr[idx - 1].value;
      }
      // Accélération (seconde différence)
      let acceleration = null;
      if (idx > 1 && arr[idx - 1].value !== undefined && arr[idx - 2].value !== undefined) {
        const diff1 = arr[idx].value - arr[idx - 1].value;
        const diff2 = arr[idx - 1].value - arr[idx - 2].value;
        acceleration = diff1 - diff2;
      }
      return {
        ...row,
        moyenne_7j,
        moyenne_14j,
        moyenne_30j,
        ecart_type_7j,
        min_7j,
        max_7j,
        tendance_7j,
        croissance,
        acceleration
      };
    });
    // Parsing des features demandées
    let featuresList;
    if (features && features.trim() !== "") {
      featuresList = features.split(',').filter(f => ML_FEATURES.includes(f));
    } else {
      featuresList = allFeatures.concat([
        'moyenne_7j','moyenne_14j','moyenne_30j','ecart_type_7j','min_7j','max_7j','tendance_7j','croissance','acceleration'
      ]);
    }
    // Filtrage des features sur chaque ligne
    const filteredDataML = dataMLFinal.map(row => {
      return Object.fromEntries(
        Object.entries(row).filter(([k]) => featuresList.includes(k))
      );
    });
    res.json({
      data: filteredDataML,
      meta: {
        pays,
        indicator,
        source: source || donnees[0]?.source, // Ajout de la source dans les métadonnées
        features: featuresList,
        count: filteredDataML.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/donnees-historiques/rt:
 *   get:
 *     summary: "Calcul du nombre de reproduction (Rt) sur une fenêtre glissante"
 *     tags: [DonneesHistoriques]
 *     parameters:
 *       - in: query
 *         name: pays
 *         schema: { type: string }
 *         required: true
 *         description: "Nom du pays ou code ISO"
 *       - in: query
 *         name: indicator
 *         schema: { type: string }
 *         required: true
 *         description: "Indicateur (ex: cases, deaths)"
 *       - in: query
 *         name: source
 *         schema: { type: string }
 *         required: true
 *         description: "Source des données (ex: covid, mpox)"
 *       - in: query
 *         name: dateDebut
 *         schema: { type: string, format: date }
 *         description: "Date de début (optionnel)"
 *       - in: query
 *         name: dateFin
 *         schema: { type: string, format: date }
 *         description: "Date de fin (optionnel)"
 *       - in: query
 *         name: window
 *         schema: { type: integer }
 *         description: "Fenêtre glissante en jours (défaut: 7)"
 *     responses:
 *       200:
 *         description: "Tableau date/Rt"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 meta:
 *                   type: object
 */
router.get('/rt', requireSource, async (req, res) => {
  try {
    const { pays, indicator, source, dateDebut, dateFin, window = 7 } = req.query;
    if (!pays || !indicator) {
      return res.status(400).json({ error: 'Paramètres pays et indicator requis' });
    }
    if (!source) {
      return res.status(400).json({ error: "Le paramètre 'source' (ex: covid, mpox) est obligatoire." });
    }
    let where = { country: pays, indicator };
    if (source) where.source = source;
    if (dateDebut || dateFin) {
      where.date = {};
      if (dateDebut) where.date.gte = new Date(dateDebut);
      if (dateFin) where.date.lte = new Date(dateFin);
    }
    const donnees = await prisma.donneeHistorique.findMany({
      where,
      orderBy: { date: 'asc' }
    });
    if (!donnees || donnees.length === 0) {
      return res.status(404).json({ error: 'Aucune donnée trouvée' });
    }
    // Regroupement par date unique (moyenne des values si plusieurs)
    const grouped = groupByDateAndAggregate(donnees, 'value', 'mean');
    const win = parseInt(window);
    const dataRt = grouped.map((row, idx, arr) => {
      let Rt = null;
      if (idx >= win) {
        const valNow = arr[idx].mean;
        const valPast = arr[idx - win].mean;
        if (valPast && valPast !== 0) {
          Rt = Math.pow(valNow / valPast, 1 / win);
        }
      }
      return {
        date: row.date,
        Rt
      };
    });
    res.json({
      data: dataRt,
      meta: {
        pays,
        indicator,
        source: source || donnees[0]?.source, // Ajout de la source dans les métadonnées
        window: win,
        count: dataRt.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/donnees-historiques/mortality-rate:
 *   get:
 *     summary: "Calcul du taux de mortalité sur une période glissante"
 *     tags: [DonneesHistoriques]
 *     parameters:
 *       - in: query
 *         name: pays
 *         schema: { type: string }
 *         required: true
 *         description: "Nom du pays ou code ISO"
 *       - in: query
 *         name: source
 *         schema: { type: string }
 *         required: true
 *         description: "Source des données (ex: covid, mpox)"
 *       - in: query
 *         name: dateDebut
 *         schema: { type: string, format: date }
 *         description: "Date de début (optionnel)"
 *       - in: query
 *         name: dateFin
 *         schema: { type: string, format: date }
 *         description: "Date de fin (optionnel)"
 *       - in: query
 *         name: window
 *         schema: { type: integer }
 *         description: "Fenêtre glissante en jours (défaut: 7)"
 *     responses:
 *       200:
 *         description: "Tableau date/mortality_rate"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 meta:
 *                   type: object
 */
router.get('/mortality-rate', requireSource, async (req, res) => {
  try {
    const { pays, source, dateDebut, dateFin, window = 7 } = req.query;
    if (!pays) {
      return res.status(400).json({ error: 'Paramètre pays requis' });
    }
    if (!source) {
      return res.status(400).json({ error: "Le paramètre 'source' (ex: covid, mpox) est obligatoire." });
    }
    let whereCases = { country: pays, indicator: 'cases' };
    let whereDeaths = { country: pays, indicator: 'deaths' };
    if (source) {
      whereCases.source = source;
      whereDeaths.source = source;
    }
    if (dateDebut || dateFin) {
      whereCases.date = {};
      whereDeaths.date = {};
      if (dateDebut) { whereCases.date.gte = new Date(dateDebut); whereDeaths.date.gte = new Date(dateDebut); }
      if (dateFin) { whereCases.date.lte = new Date(dateFin); whereDeaths.date.lte = new Date(dateFin); }
    }
    const cases = await prisma.donneeHistorique.findMany({ where: whereCases, orderBy: { date: 'asc' } });
    const deaths = await prisma.donneeHistorique.findMany({ where: whereDeaths, orderBy: { date: 'asc' } });
    if (!cases.length || !deaths.length) {
      return res.status(404).json({ error: 'Aucune donnée trouvée' });
    }
    // Regroupement par date unique (moyenne des values si plusieurs)
    const groupedCases = groupByDateAndAggregate(cases, 'value', 'mean');
    const groupedDeaths = groupByDateAndAggregate(deaths, 'value', 'mean');
    // On suppose que les deux tableaux sont alignés par date
    const win = parseInt(window);
    const dataMortality = groupedCases.map((row, idx) => {
      let mortality_rate = null;
      if (idx >= win - 1) {
        const sumCases = groupedCases.slice(idx - win + 1, idx + 1).reduce((a, r) => a + (r.mean || 0), 0);
        const sumDeaths = groupedDeaths.slice(idx - win + 1, idx + 1).reduce((a, r) => a + (r.mean || 0), 0);
        if (sumCases && sumCases !== 0) {
          mortality_rate = sumDeaths / sumCases;
        }
      }
      return {
        date: row.date,
        mortality_rate
      };
    });
    res.json({
      data: dataMortality,
      meta: {
        pays,
        source: source || cases[0]?.source, // Ajout de la source dans les métadonnées
        window: win,
        count: dataMortality.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/donnees-historiques/aggregation:
 *   get:
 *     summary: "Agrégations temporelles sur une fenêtre glissante"
 *     tags: [DonneesHistoriques]
 *     parameters:
 *       - in: query
 *         name: pays
 *         schema: { type: string }
 *         required: true
 *         description: "Nom du pays ou code ISO"
 *       - in: query
 *         name: indicator
 *         schema: { type: string }
 *         required: true
 *         description: "Indicateur (ex: cases, deaths)"
 *       - in: query
 *         name: source
 *         schema: { type: string }
 *         required: true
 *         description: "Source des données (ex: covid, mpox)"
 *       - in: query
 *         name: dateDebut
 *         schema: { type: string, format: date }
 *         description: "Date de début (optionnel)"
 *       - in: query
 *         name: dateFin
 *         schema: { type: string, format: date }
 *         description: "Date de fin (optionnel)"
 *       - in: query
 *         name: window
 *         schema: { type: integer }
 *         description: "Fenêtre glissante en jours (défaut: 7)"
 *       - in: query
 *         name: operation
 *         schema: { type: string, enum: [mean, sum, min, max, std] }
 *         required: true
 *         description: "Type d'agrégation"
 *     responses:
 *       200:
 *         description: "Tableau date/valeur agrégée"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 meta:
 *                   type: object
 */
router.get('/aggregation', requireSource, async (req, res) => {
  try {
    const { pays, indicator, source, dateDebut, dateFin, window = 7, operation } = req.query;
    if (!pays || !indicator || !operation) {
      return res.status(400).json({ error: 'Paramètres pays, indicator et operation requis' });
    }
    if (!source) {
      return res.status(400).json({ error: "Le paramètre 'source' (ex: covid, mpox) est obligatoire." });
    }
    let where = { country: pays, indicator };
    if (source) where.source = source;
    if (dateDebut || dateFin) {
      where.date = {};
      if (dateDebut) where.date.gte = new Date(dateDebut);
      if (dateFin) where.date.lte = new Date(dateFin);
    }
    const donnees = await prisma.donneeHistorique.findMany({ where, orderBy: { date: 'asc' } });
    if (!donnees.length) {
      return res.status(404).json({ error: 'Aucune donnée trouvée' });
    }
    const win = parseInt(window);
    const dataAgg = groupByDateAndAggregate(donnees, 'value', operation);
    res.json({
      data: dataAgg,
      meta: {
        pays,
        indicator,
        source: source || donnees[0]?.source, // Ajout de la source dans les métadonnées
        window: win,
        operation,
        count: dataAgg.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/donnees-historiques/stats:
 *   get:
 *     summary: "Statistiques descriptives sur une période"
 *     tags: [DonneesHistoriques]
 *     parameters:
 *       - in: query
 *         name: pays
 *         schema: { type: string }
 *         required: true
 *         description: "Nom du pays ou code ISO"
 *       - in: query
 *         name: indicator
 *         schema: { type: string }
 *         required: true
 *         description: "Indicateur (ex: cases, deaths)"
 *       - in: query
 *         name: source
 *         schema: { type: string }
 *         description: "Source des données (ex: covid, mpox)"
 *       - in: query
 *         name: dateDebut
 *         schema: { type: string, format: date }
 *         description: "Date de début (optionnel)"
 *       - in: query
 *         name: dateFin
 *         schema: { type: string, format: date }
 *         description: "Date de fin (optionnel)"
 *     responses:
 *       200:
 *         description: "Statistiques descriptives"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                 meta:
 *                   type: object
 */
router.get('/stats', async (req, res) => {
  try {
    const { pays, indicator, source, dateDebut, dateFin } = req.query;
    if (!pays || !indicator) {
      return res.status(400).json({ error: 'Paramètres pays et indicator requis' });
    }
    if (!source) {
      return res.status(400).json({ error: "Le paramètre 'source' (ex: covid, mpox) est obligatoire." });
    }
    let where = { country: pays, indicator };
    if (source) where.source = source;
    if (dateDebut || dateFin) {
      where.date = {};
      if (dateDebut) where.date.gte = new Date(dateDebut);
      if (dateFin) where.date.lte = new Date(dateFin);
    }
    const donnees = await prisma.donneeHistorique.findMany({ where, orderBy: { date: 'asc' } });
    if (!donnees.length) {
      return res.status(404).json({ error: 'Aucune donnée trouvée' });
    }
    
    // Regroupement par date unique (moyenne des values si plusieurs)
    const grouped = groupByDateAndAggregate(donnees, 'value', 'mean');
    const values = grouped.map(r => r.mean || 0);
    
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n);
    const sorted = [...values].sort((a, b) => a - b);
    const quantile = q => sorted[Math.floor(q * (n - 1))];
    const stats = {
      mean,
      min,
      max,
      std,
      q25: quantile(0.25),
      median: quantile(0.5),
      q75: quantile(0.75)
    };
    res.json({
      stats,
      meta: {
        pays,
        indicator,
        source: source || donnees[0]?.source, // Ajout de la source dans les métadonnées
        count: n
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/donnees-historiques/geographic-spread:
 *   get:
 *     summary: "Clustering simple des pays par similarité temporelle (correlation)"
 *     tags: [DonneesHistoriques]
 *     parameters:
 *       - in: query
 *         name: indicator
 *         schema: { type: string }
 *         required: true
 *         description: "Indicateur (ex: cases, deaths)"
 *       - in: query
 *         name: source
 *         schema: { type: string }
 *         required: true
 *         description: "Source des données (ex: covid, mpox)"
 *       - in: query
 *         name: dateDebut
 *         schema: { type: string, format: date }
 *         description: "Date de début (optionnel)"
 *       - in: query
 *         name: dateFin
 *         schema: { type: string, format: date }
 *         description: "Date de fin (optionnel)"
 *       - in: query
 *         name: k
 *         schema: { type: integer }
 *         description: "Nombre de clusters (défaut: 3)"
 *     responses:
 *       200:
 *         description: "Groupes de pays similaires"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clusters:
 *                   type: array
 *                   items:
 *                     type: object
 *                 meta:
 *                   type: object
 */
router.get('/geographic-spread', async (req, res) => {
  try {
    const { indicator, source, dateDebut, dateFin, k = 3 } = req.query;
    if (!indicator) {
      return res.status(400).json({ error: 'Paramètre indicator requis' });
    }
    if (!source) {
      return res.status(400).json({ error: "Le paramètre 'source' (ex: covid, mpox) est obligatoire." });
    }
    // Récupérer la liste des pays ayant des données pour cet indicateur
    const paysList = await prisma.pays.findMany();
    const paysCodes = paysList.map(p => p.iso_code);
    // Pour chaque pays, récupérer la série temporelle
    let series = [];
    for (const code of paysCodes) {
      let where = { iso_code: code, indicator };
      if (source) where.source = source;
      if (dateDebut || dateFin) {
        where.date = {};
        if (dateDebut) where.date.gte = new Date(dateDebut);
        if (dateFin) where.date.lte = new Date(dateFin);
      }
      const donnees = await prisma.donneeHistorique.findMany({ where, orderBy: { date: 'asc' } });
      if (donnees.length > 0) {
        series.push({
          iso_code: code,
          country: paysList.find(p => p.iso_code === code)?.country,
          values: donnees.map(r => r.value || 0)
        });
      }
    }
    if (series.length === 0) {
      return res.status(404).json({ error: 'Aucune donnée trouvée' });
    }
    // Calculer la matrice de similarité (correlation de Pearson)
    function pearson(a, b) {
      const n = Math.min(a.length, b.length);
      if (n === 0) return 0;
      const meanA = a.slice(0, n).reduce((x, y) => x + y, 0) / n;
      const meanB = b.slice(0, n).reduce((x, y) => x + y, 0) / n;
      const num = a.slice(0, n).reduce((sum, v, i) => sum + (v - meanA) * (b[i] - meanB), 0);
      const denA = Math.sqrt(a.slice(0, n).reduce((sum, v) => sum + Math.pow(v - meanA, 2), 0));
      const denB = Math.sqrt(b.slice(0, n).reduce((sum, v) => sum + Math.pow(v - meanB, 2), 0));
      return denA && denB ? num / (denA * denB) : 0;
    }
    // K-means simple sur la matrice de similarité (1D)
    const kInt = parseInt(k);
    // On prend la première valeur de chaque série pour aligner les longueurs
    const minLen = Math.min(...series.map(s => s.values.length));
    const vectors = series.map(s => s.values.slice(0, minLen));
    // Initialisation aléatoire des centres
    let centers = vectors.slice(0, kInt);
    let clusters = Array.from({ length: kInt }, () => []);
    let changed = true;
    let iter = 0;
    while (changed && iter < 10) {
      clusters = Array.from({ length: kInt }, () => []);
      // Assignation
      for (let i = 0; i < vectors.length; i++) {
        let best = 0;
        let bestScore = -Infinity;
        for (let c = 0; c < kInt; c++) {
          const score = pearson(vectors[i], centers[c]);
          if (score > bestScore) {
            bestScore = score;
            best = c;
          }
        }
        clusters[best].push(series[i]);
      }
      // Mise à jour des centres
      changed = false;
      for (let c = 0; c < kInt; c++) {
        if (clusters[c].length === 0) continue;
        const newCenter = [];
        for (let j = 0; j < minLen; j++) {
          newCenter[j] = clusters[c].map(s => s.values[j]).reduce((a, b) => a + b, 0) / clusters[c].length;
        }
        if (JSON.stringify(newCenter) !== JSON.stringify(centers[c])) {
          centers[c] = newCenter;
          changed = true;
        }
      }
      iter++;
    }
    // Format de sortie
    const result = clusters.map((group, i) => ({
      cluster: i + 1,
      countries: group.map(g => ({ iso_code: g.iso_code, country: g.country }))
    }));
    res.json({
      clusters: result,
      meta: {
        indicator,
        source: source, // Ajout de la source dans les métadonnées
        k: kInt,
        count: series.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/donnees-historiques/filtre:
 *   get:
 *     summary: Filtre les données historiques
 *     tags: [DonneesHistoriques]
 *     parameters:
 *       - in: query
 *         name: pays
 *         schema:
 *           type: string
 *         description: Nom du pays
 *       - in: query
 *         name: iso_code
 *         schema:
 *           type: string
 *         description: Code ISO
 *       - in: query
 *         name: indicator
 *         schema:
 *           type: string
 *         description: Indicateur
 *       - in: query
 *         name: dateDebut
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début
 *       - in: query
 *         name: dateFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *         description: Source
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste filtrée des données historiques
 */
// GET données historiques filtrées
router.get('/filtre', async (req, res) => {
  try {
    const {
      pays,
      iso_code,
      indicator,
      dateDebut,
      dateFin,
      source,
      page = 1,
      limit = 100
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let where = {};
    
    // Construction des filtres
    if (pays) where.country = pays;
    if (iso_code) where.iso_code = iso_code;
    if (indicator) where.indicator = indicator;
    if (source) where.source = source;
    
    // Filtre de date
    if (dateDebut || dateFin) {
      where.date = {};
      if (dateDebut) where.date.gte = new Date(dateDebut);
      if (dateFin) where.date.lte = new Date(dateFin);
    }
    
    const donnees = await prisma.donneeHistorique.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: {
        date: 'desc'
      }
    });
    
    const total = await prisma.donneeHistorique.count({ where });
    
    res.json({
      data: donnees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/donnees-historiques/pays/{isoCode}:
 *   get:
 *     summary: Récupère les données par pays
 *     tags: [DonneesHistoriques]
 *     parameters:
 *       - in: path
 *         name: isoCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Code ISO du pays
 *       - in: query
 *         name: indicator
 *         schema:
 *           type: string
 *         description: Indicateur
 *       - in: query
 *         name: dateDebut
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début
 *       - in: query
 *         name: dateFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des données historiques pour un pays
 */
// GET données historiques par pays
router.get('/pays/:isoCode', async (req, res) => {
  try {
    const isoCode = req.params.isoCode;
    const {
      indicator,
      dateDebut,
      dateFin,
      page = 1,
      limit = 100
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let where = { iso_code: isoCode };
    
    if (indicator) where.indicator = indicator;
    
    // Filtre de date
    if (dateDebut || dateFin) {
      where.date = {};
      if (dateDebut) where.date.gte = new Date(dateDebut);
      if (dateFin) where.date.lte = new Date(dateFin);
    }
    
    const donnees = await prisma.donneeHistorique.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: {
        date: 'desc'
      }
    });
    
    const total = await prisma.donneeHistorique.count({ where });
    
    res.json({
      data: donnees,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/donnees-historiques/{id}:
 *   get:
 *     summary: Récupère une donnée par ID
 *     tags: [DonneesHistoriques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la donnée
 *     responses:
 *       200:
 *         description: Donnée trouvée
 *       404:
 *         description: Donnée non trouvée
 */
// GET une donnée historique par ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID invalide' });
    }
    const donnee = await prisma.donneeHistorique.findUnique({
      where: { id_donnee: id }
    });
    if (!donnee) {
      return res.status(404).json({ error: 'Donnée historique non trouvée' });
    }
    res.json(donnee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/donnees-historiques:
 *   post:
 *     summary: Crée une nouvelle donnée historique
 *     tags: [DonneesHistoriques]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - country
 *               - indicator
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               country:
 *                 type: string
 *               value:
 *                 type: number
 *               indicator:
 *                 type: string
 *               source:
 *                 type: string
 *               iso_code:
 *                 type: string
 *               population:
 *                 type: integer
 *               unit:
 *                 type: string
 *               cases_per_100k:
 *                 type: number
 *               deaths_per_100k:
 *                 type: number
 *               incidence_7j:
 *                 type: number
 *               growth_rate:
 *                 type: number
 *     responses:
 *       201:
 *         description: Donnée créée
 *       400:
 *         description: Données invalides
 */
// POST créer une donnée historique
router.post('/', async (req, res) => {
  try {
    const {
      date,
      country,
      value,
      indicator,
      source,
      iso_code,
      population,
      unit,
      cases_per_100k,
      deaths_per_100k,
      incidence_7j,
      growth_rate
    } = req.body;
    
    if (!date || !country || !indicator) {
      return res.status(400).json({ 
        error: 'La date, le pays et l\'indicateur sont requis' 
      });
    }
    
    const nouvelleDonnee = await prisma.donneeHistorique.create({
      data: {
        date: new Date(date),
        country,
        value: value || null,
        indicator,
        source: source || null,
        iso_code: iso_code || null,
        population: population ? BigInt(population) : null,
        unit: unit || null,
        cases_per_100k: cases_per_100k || null,
        deaths_per_100k: deaths_per_100k || null,
        incidence_7j: incidence_7j || null,
        growth_rate: growth_rate || null
      }
    });
    
    res.status(201).json(nouvelleDonnee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/donnees-historiques/{id}:
 *   put:
 *     summary: Met à jour une donnée historique
 *     tags: [DonneesHistoriques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la donnée
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               country:
 *                 type: string
 *               value:
 *                 type: number
 *               indicator:
 *                 type: string
 *               source:
 *                 type: string
 *               iso_code:
 *                 type: string
 *               population:
 *                 type: integer
 *               unit:
 *                 type: string
 *               cases_per_100k:
 *                 type: number
 *               deaths_per_100k:
 *                 type: number
 *               incidence_7j:
 *                 type: number
 *               growth_rate:
 *                 type: number
 *     responses:
 *       200:
 *         description: Donnée mise à jour
 *       400:
 *         description: Données invalides
 *       404:
 *         description: Donnée non trouvée
 */
// PUT mettre à jour une donnée historique
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      date,
      country,
      value,
      indicator,
      source,
      iso_code,
      population,
      unit,
      cases_per_100k,
      deaths_per_100k,
      incidence_7j,
      growth_rate
    } = req.body;
    
    const donneeExiste = await prisma.donneeHistorique.findUnique({
      where: { id_donnee: id }
    });
    
    if (!donneeExiste) {
      return res.status(404).json({ error: 'Donnée historique non trouvée' });
    }
    
    const donneeModifiee = await prisma.donneeHistorique.update({
      where: { id_donnee: id },
      data: {
        date: date ? new Date(date) : undefined,
        country: country || undefined,
        value: value !== undefined ? value : undefined,
        indicator: indicator || undefined,
        source: source !== undefined ? source : undefined,
        iso_code: iso_code !== undefined ? iso_code : undefined,
        population: population !== undefined ? BigInt(population) : undefined,
        unit: unit !== undefined ? unit : undefined,
        cases_per_100k: cases_per_100k !== undefined ? cases_per_100k : undefined,
        deaths_per_100k: deaths_per_100k !== undefined ? deaths_per_100k : undefined,
        incidence_7j: incidence_7j !== undefined ? incidence_7j : undefined,
        growth_rate: growth_rate !== undefined ? growth_rate : undefined
      }
    });
    
    res.json(donneeModifiee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/donnees-historiques/{id}:
 *   delete:
 *     summary: Supprime une donnée historique
 *     tags: [DonneesHistoriques]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la donnée
 *     responses:
 *       204:
 *         description: Donnée supprimée
 *       404:
 *         description: Donnée non trouvée
 */
// DELETE supprimer une donnée historique
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const donneeExiste = await prisma.donneeHistorique.findUnique({
      where: { id_donnee: id }
    });
    
    if (!donneeExiste) {
      return res.status(404).json({ error: 'Donnée historique non trouvée' });
    }
    
    await prisma.donneeHistorique.delete({
      where: { id_donnee: id }
    });
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Utilitaire pour regrouper par date et agréger (max, mean, sum, etc.)
function groupByDateAndAggregate(rows, valueKey = 'value', agg = 'mean') {
  const map = new Map();
  for (const row of rows) {
    const date = row.date instanceof Date ? row.date.toISOString() : row.date;
    if (!map.has(date)) map.set(date, []);
    map.get(date).push(row[valueKey] ?? 0);
  }
  const result = [];
  for (const [date, values] of map.entries()) {
    let val = null;
    switch (agg) {
      case 'mean':
        val = values.reduce((a, b) => a + b, 0) / values.length;
        break;
      case 'sum':
        val = values.reduce((a, b) => a + b, 0);
        break;
      case 'min':
        val = Math.min(...values);
        break;
      case 'max':
        val = Math.max(...values);
        break;
      case 'std':
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        val = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
        break;
      default:
        val = values[0];
    }
    result.push({ date, [agg]: val });
  }
  // Tri par date croissante
  return result.sort((a, b) => new Date(a.date) - new Date(b.date));
}

module.exports = router; 