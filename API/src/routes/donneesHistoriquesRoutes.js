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

// Helper pour moyenne mobile
function movingAverage(arr, windowSize) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    if (i < windowSize - 1) {
      result.push(null);
    } else {
      let sum = 0;
      for (let j = 0; j < windowSize; j++) {
        sum += arr[i - j];
      }
      result.push(sum / windowSize);
    }
  }
  return result;
}

// Helper pour écart-type
function stdDev(arr, windowSize) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    if (i < windowSize - 1) {
      result.push(null);
    } else {
      let window = arr.slice(i - windowSize + 1, i + 1);
      let mean = window.reduce((a, b) => a + b, 0) / window.length;
      let variance = window.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / window.length;
      result.push(Math.sqrt(variance));
    }
  }
  return result;
}

// Helper pour taux de croissance
function growthRate(arr, windowSize) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    if (i < windowSize) {
      result.push(null);
    } else {
      let prev = arr[i - windowSize];
      if (prev === 0 || prev === null) {
        result.push(null);
      } else {
        result.push((arr[i] - prev) / prev);
      }
    }
  }
  return result;
}

// Helper pour clustering k-means naïf (1D)
function kMeans1D(values, k) {
  if (values.length < k) return values.map((v, i) => ({ value: v, cluster: i }));
  // Initialisation : k centres aléatoires
  let centers = values.slice(0, k);
  let clusters = Array(values.length).fill(0);
  let changed = true;
  let maxIter = 100;
  let iter = 0;
  while (changed && iter < maxIter) {
    changed = false;
    // Assignation
    for (let i = 0; i < values.length; i++) {
      let minDist = Infinity;
      let best = 0;
      for (let c = 0; c < k; c++) {
        let dist = Math.abs(values[i] - centers[c]);
        if (dist < minDist) {
          minDist = dist;
          best = c;
        }
      }
      if (clusters[i] !== best) {
        clusters[i] = best;
        changed = true;
      }
    }
    // Mise à jour des centres
    for (let c = 0; c < k; c++) {
      let members = values.filter((v, i) => clusters[i] === c);
      if (members.length > 0) {
        centers[c] = members.reduce((a, b) => a + b, 0) / members.length;
      }
    }
    iter++;
  }
  return values.map((v, i) => ({ value: v, cluster: clusters[i] }));
}

/**
 * @swagger
 * /api/donnees-historiques/aggregation:
 *   get:
 *     summary: Agrégation temporelle (moyennes mobiles, taux de croissance, écart-type)
 *     tags: [DonneesHistoriques]
 *     parameters:
 *       - in: query
 *         name: pays
 *         schema:
 *           type: string
 *         description: "Nom du pays"
 *       - in: query
 *         name: indicator
 *         schema:
 *           type: string
 *         description: "Indicateur"
 *       - in: query
 *         name: periode
 *         schema:
 *           type: string
 *         description: "Période d'agrégation, ex : 7j ou 14j ou 30j"
 *       - in: query
 *         name: operation
 *         schema:
 *           type: string
 *         description: "Opération (moyenne, ecart-type, croissance)"
 *     responses:
 *       200:
 *         description: Résultat de l'agrégation
 */
router.get('/aggregation', async (req, res) => {
  try {
    const { pays, indicator, periode = '7j', operation = 'moyenne' } = req.query;
    if (!pays || !indicator) {
      return res.status(400).json({ error: 'Paramètres pays et indicator requis' });
    }
    const windowSize = parseInt(periode);
    const donnees = await prisma.donneeHistorique.findMany({
      where: { country: pays, indicator },
      orderBy: { date: 'asc' }
    });
    const values = donnees.map(d => d.value ?? 0);
    let result;
    if (operation === 'moyenne') {
      result = movingAverage(values, windowSize);
    } else if (operation === 'ecart-type') {
      result = stdDev(values, windowSize);
    } else if (operation === 'croissance') {
      result = growthRate(values, windowSize);
    } else {
      return res.status(400).json({ error: 'Opération non supportée' });
    }
    res.json({
      dates: donnees.map(d => d.date),
      values: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/donnees-historiques/stats:
 *   get:
 *     summary: Statistiques descriptives (min, max, moyenne, écart-type)
 *     tags: [DonneesHistoriques]
 *     parameters:
 *       - in: query
 *         name: pays
 *         schema:
 *           type: string
 *         description: Nom du pays
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
 *     responses:
 *       200:
 *         description: Statistiques calculées
 */
router.get('/stats', async (req, res) => {
  try {
    const { pays, indicator, dateDebut, dateFin } = req.query;
    if (!pays || !indicator) {
      return res.status(400).json({ error: 'Paramètres pays et indicator requis' });
    }
    let where = { country: pays, indicator };
    if (dateDebut || dateFin) {
      where.date = {};
      if (dateDebut) where.date.gte = new Date(dateDebut);
      if (dateFin) where.date.lte = new Date(dateFin);
    }
    const donnees = await prisma.donneeHistorique.findMany({ where, orderBy: { date: 'asc' } });
    const values = donnees.map(d => d.value ?? 0);
    if (values.length === 0) return res.json({ min: null, max: null, moyenne: null, ecartType: null });
    const min = Math.min(...values);
    const max = Math.max(...values);
    const moyenne = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - moyenne, 2), 0) / values.length;
    const ecartType = Math.sqrt(variance);
    res.json({ min, max, moyenne, ecartType });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/donnees-historiques/ml-ready:
 *   get:
 *     summary: Données formatées pour Machine Learning (features calculées)
 *     tags: [DonneesHistoriques]
 *     parameters:
 *       - in: query
 *         name: pays
 *         schema:
 *           type: string
 *         description: "Nom du pays"
 *       - in: query
 *         name: indicator
 *         schema:
 *           type: string
 *         description: "Indicateur"
 *       - in: query
 *         name: features
 *         schema:
 *           type: string
 *         description: "Liste des features à calculer, ex : 30j_moyenne ou 7j_croissance"
 *     responses:
 *       200:
 *         description: Données prêtes pour ML
 */
router.get('/ml-ready', async (req, res) => {
  try {
    const { pays, indicator, features = '' } = req.query;
    if (!pays || !indicator) {
      return res.status(400).json({ error: 'Paramètres pays et indicator requis' });
    }
    const donnees = await prisma.donneeHistorique.findMany({
      where: { country: pays, indicator },
      orderBy: { date: 'asc' }
    });
    const values = donnees.map(d => d.value ?? 0);
    let result = { dates: donnees.map(d => d.date), value: values };
    if (features.includes('moyenne')) {
      const window = features.match(/(\d+)j_moyenne/);
      if (window) result[`moyenne_${window[1]}j`] = movingAverage(values, parseInt(window[1]));
    }
    if (features.includes('croissance')) {
      const window = features.match(/(\d+)j_croissance/);
      if (window) result[`croissance_${window[1]}j`] = growthRate(values, parseInt(window[1]));
    }
    if (features.includes('ecart-type')) {
      const window = features.match(/(\d+)j_ecart-type/);
      if (window) result[`ecartType_${window[1]}j`] = stdDev(values, parseInt(window[1]));
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/donnees-historiques/rt:
 *   get:
 *     summary: Calcul du taux de transmission Rt
 *     tags: [DonneesHistoriques]
 *     parameters:
 *       - in: query
 *         name: pays
 *         schema:
 *           type: string
 *         description: "Nom du pays"
 *       - in: query
 *         name: periode
 *         schema:
 *           type: string
 *         description: "Période de calcul, ex : 7j"
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: "Date de référence"
 *     responses:
 *       200:
 *         description: Valeur de Rt calculée
 */
router.get('/rt', async (req, res) => {
  try {
    const { pays, periode = '7j', date } = req.query;
    if (!pays || !date) {
      return res.status(400).json({ error: 'Paramètres pays et date requis' });
    }
    const windowSize = parseInt(periode);
    const refDate = new Date(date);
    // Récupère la valeur du jour N et du jour N-windowSize
    const donnees = await prisma.donneeHistorique.findMany({
      where: { country: pays, indicator: 'cases', date: { lte: refDate } },
      orderBy: { date: 'asc' }
    });
    if (donnees.length === 0) return res.status(404).json({ error: 'Pas de données' });
    const idx = donnees.findIndex(d => d.date.toISOString().slice(0,10) === refDate.toISOString().slice(0,10));
    if (idx === -1 || idx < windowSize) return res.status(400).json({ error: 'Pas assez de données pour calculer Rt' });
    const casN = donnees[idx].value ?? 0;
    const casNmoins = donnees[idx - windowSize].value ?? 0;
    if (casNmoins === 0) return res.status(400).json({ error: 'Division par zéro' });
    const rt = Math.pow(casN / casNmoins, 1 / windowSize);
    res.json({ date: donnees[idx].date, rt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/donnees-historiques/mortality-rate:
 *   get:
 *     summary: Calcul du taux de mortalité
 *     tags: [DonneesHistoriques]
 *     parameters:
 *       - in: query
 *         name: pays
 *         schema:
 *           type: string
 *         description: "Nom du pays"
 *       - in: query
 *         name: periode
 *         schema:
 *           type: string
 *         description: "Période de calcul, ex : 30j"
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: "Date de référence"
 *     responses:
 *       200:
 *         description: Taux de mortalité calculé
 */
router.get('/mortality-rate', async (req, res) => {
  try {
    const { pays, periode = '30j', date } = req.query;
    if (!pays || !date) {
      return res.status(400).json({ error: 'Paramètres pays et date requis' });
    }
    const windowSize = parseInt(periode);
    const refDate = new Date(date);
    // Récupère les données sur la période
    const donnees = await prisma.donneeHistorique.findMany({
      where: { country: pays, date: { lte: refDate },
        OR: [ { indicator: 'cases' }, { indicator: 'deaths' } ] },
      orderBy: { date: 'desc' },
      take: windowSize * 2 // pour être sûr d'avoir assez de points
    });
    // Trie par date croissante
    donnees.sort((a, b) => a.date - b.date);
    // Filtre la période
    const filtered = donnees.filter(d => d.date <= refDate && d.date >= new Date(refDate.getTime() - (windowSize-1)*24*3600*1000));
    let totalCases = 0, totalDeaths = 0;
    for (const d of filtered) {
      if (d.indicator === 'cases') totalCases += d.value ?? 0;
      if (d.indicator === 'deaths') totalDeaths += d.value ?? 0;
    }
    if (totalCases === 0) return res.status(400).json({ error: 'Aucun cas sur la période' });
    const taux = (totalDeaths / totalCases) * 100;
    res.json({ date: refDate, periode: windowSize, taux_mortalite: taux, totalCases, totalDeaths });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/donnees-historiques/geographic-spread:
 *   get:
 *     summary: Analyse de la propagation géographique
 *     tags: [DonneesHistoriques]
 *     parameters:
 *       - in: query
 *         name: indicator
 *         schema:
 *           type: string
 *         description: "Indicateur, ex : cases"
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: "Date de référence"
 *       - in: query
 *         name: k
 *         schema:
 *           type: integer
 *         description: "Nombre de groupes à former (clustering)"
 *     responses:
 *       200:
 *         description: Groupes de pays par pattern similaire
 */
router.get('/geographic-spread', async (req, res) => {
  try {
    const { indicator = 'cases', date, k = 5 } = req.query;
    if (!date) {
      return res.status(400).json({ error: 'Paramètre date requis' });
    }
    const refDate = new Date(date);
    const donnees = await prisma.donneeHistorique.findMany({
      where: { indicator, date: refDate },
    });
    const values = donnees.map(d => d.value ?? 0);
    const clusters = kMeans1D(values, parseInt(k));
    const result = donnees.map((d, i) => ({ country: d.country, value: d.value, cluster: clusters[i].cluster }));
    res.json({ date: refDate, indicator, clusters: result });
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

module.exports = router; 