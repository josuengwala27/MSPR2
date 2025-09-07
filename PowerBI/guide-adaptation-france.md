# Guide d'adaptation PowerBI pour l'architecture France

## 🎯 Objectif
Adapter votre dashboard PowerBI existant (MSPR1) pour qu'il fonctionne avec l'architecture France (MSPR3) en respectant la conformité RGPD.

---

## 🚀 Étape 1 : Démarrage architecture France

### Lancer l'environnement France
```bash
# Déploiement complet France
cd /Users/berdan/Ecoles/MSPR2
./scripts/france/deploy-france.sh

# Vérifier que PostgreSQL France fonctionne
./scripts/france/monitor-france.sh database
```

**Résultat attendu :**
- PostgreSQL France disponible sur port 5433
- Base `pandemies_db_france` créée
- Données ETL importées

---

## 🔌 Étape 2 : Connexion PowerBI → PostgreSQL France

### Dans PowerBI Desktop

1. **Nouvelle source de données**
   - `Accueil` > `Obtenir des données` > `PostgreSQL`

2. **Paramètres de connexion**
   ```
   Serveur : localhost:5433
   Base de données : pandemies_db_france
   ```

3. **Authentification**
   ```
   Mode : Base de données  
   Nom d'utilisateur : postgres_fr
   Mot de passe : [Voir .env.france]
   ```

4. **Requête SQL France** (copier depuis `connection-france.txt`)
   ```sql
   SELECT 
       id_donnee, date, country, value, indicator, source, iso_code,
       CASE 
           WHEN population IS NOT NULL 
           THEN ROUND(population / 1000.0, 0) * 1000 
           ELSE NULL 
       END as population_rgpd,
       unit, cases_per_100k, deaths_per_100k, incidence_7j, growth_rate
   FROM donnee_historique
   WHERE date >= '2020-01-01'
   AND country IN ('France', 'Germany', 'Italy', 'Spain', 'Belgium', 'Netherlands')
   ORDER BY date DESC
   LIMIT 100000;
   ```

---

## 📊 Étape 3 : Remplacement des mesures DAX

### Sauvegarder votre fichier PowerBI actuel
```
Fichier > Enregistrer sous > [NOM_PROJET]_BACKUP.pbix
```

### Remplacer les mesures existantes

1. **Aller dans** `Données` > `Nouvelle mesure`

2. **Remplacer Total_Cas par :**
   ```dax
   Total_Cas_France = 
   CALCULATE(
       ROUND(SUM('Query1'[value]), -2),
       'Query1'[indicator] = "cases"
   )
   ```

3. **Remplacer Total_Deces par :**
   ```dax
   Total_Deces_France = 
   CALCULATE(
       ROUND(SUM('Query1'[value]), -1),
       'Query1'[indicator] = "deaths"
   )
   ```

4. **Ajouter les nouvelles mesures RGPD** (copier depuis `mesures-dax-france.txt`)

### Mise à jour des visuels

1. **Remplacer** toutes les références `Total_Cas` par `Total_Cas_France`
2. **Remplacer** toutes les références `Total_Deces` par `Total_Deces_France`
3. **Ajouter** `[Conformite_RGPD]` sur chaque page

---

## 🇫🇷 Étape 4 : Adaptation pages France

### Page "Vue d'ensemble mondiale" → "Vue d'ensemble Europe"

1. **Carte des cas par pays**
   - Filtrer sur pays européens uniquement
   - Ajouter `[Conformite_RGPD]` comme indicateur

2. **KPI en haut**
   - Remplacer par `[Total_Cas_France]`, `[Total_Deces_France]`
   - Ajouter `[Nb_Pays_Europe]`

3. **Titre dynamique**
   - Remplacer par `[Titre_Principal_France]`
   - Ajouter sous-titre `[Sous_Titre_Periode]`

### Page "Analyse par pays" → "Analyse pays Europe"

1. **Slicer pays**
   - Limiter aux pays européens
   - Ajouter filtre "France par défaut"

2. **Indicateurs normalisés**
   - Utiliser `[Cas_100k_RGPD]` au lieu de `[Cas_100k]`
   - Utiliser `[Deces_100k_RGPD]` au lieu de `[Deces_100k]`

### Page "Export des données" → "Export RGPD"

1. **Ajouter contrôles RGPD**
   - Indicateur `[Volume_Export_RGPD]`
   - Message d'avertissement si > 10k lignes

2. **Table d'export**
   - Limiter à 10000 lignes maximum
   - Ajouter colonne `population_rgpd` (anonymisée)

3. **Ajouter disclaimer RGPD**
   ```
   "⚠️ Export conforme RGPD : Données anonymisées, 
   population arrondie au millier, pays européens uniquement"
   ```

---

## 🛡️ Étape 5 : Ajout page conformité RGPD

### Nouvelle page "Conformité RGPD"

1. **Créer nouvelle page**
   - Nom : "🛡️ Conformité RGPD"

2. **Indicateurs de conformité**
   ```
   - [Conformite_RGPD]
   - [Volume_Export_RGPD] 
   - [Periode_RGPD]
   - [Nb_Pays_Europe]
   ```

3. **Tableau de contrôle**
   | Critère RGPD | Statut | Valeur |
   |--------------|--------|---------|
   | Anonymisation | ✅ | Population arrondie |
   | Limitation géographique | ✅ | Europe uniquement |
   | Limitation volume | ✅ | < 100k lignes |
   | Rétention | ✅ | Depuis 2020 |

4. **Graphique évolution données**
   - Nombre de lignes par mois
   - Seuils RGPD en ligne de référence

---

## ✅ Étape 6 : Tests et validation

### Tests de fonctionnement

1. **Test connexion**
   ```bash
   ./scripts/france/monitor-france.sh health
   ```

2. **Test PowerBI**
   - Actualiser toutes les données
   - Vérifier que tous les visuels fonctionnent
   - Tester tous les filtres

3. **Test conformité RGPD**
   - Page "Conformité RGPD" → Tous indicateurs ✅
   - Export < 10k lignes
   - Pas de données personnelles visibles

### Validation des mesures

1. **Comparer avec l'ancien dashboard**
   - Les totaux doivent être cohérents (arrondis)
   - Les tendances identiques

2. **Vérifier l'anonymisation**
   - Population : multiples de 1000 uniquement
   - Cas : arrondis à la centaine
   - Décès : arrondis à la dizaine

---

## 📋 Étape 7 : Documentation et livraison

### Documenter les changements

1. **Créer fichier CHANGELOG_FRANCE.md**
   ```markdown
   # Changements PowerBI France - MSPR3
   
   ## Modifications apportées
   - Connexion PostgreSQL France (port 5433)
   - Mesures DAX anonymisées RGPD
   - Limitation pays européens
   - Page conformité RGPD
   
   ## Nouvelles mesures
   - Total_Cas_France (anonymisé)
   - Total_Deces_France (anonymisé) 
   - Conformite_RGPD
   ```

2. **Enregistrer le fichier France**
   ```
   Fichier > Enregistrer sous > Dashboard_Pandemies_FRANCE_v1.pbix
   ```

### Publier (optionnel)

1. **PowerBI Service**
   - `Publier` vers workspace "MSPR3 France"
   - Configurer actualisation automatique

2. **Paramètres de sécurité**
   - Accès limité aux utilisateurs européens
   - Chiffrement activé

---

## 🚨 Troubleshooting

### Erreur de connexion PostgreSQL
```bash
# Vérifier que le service France est démarré
./scripts/france/monitor-france.sh status

# Redémarrer si nécessaire  
./scripts/france/deploy-france.sh
```

### Mesures DAX en erreur
1. Vérifier les noms de colonnes dans la requête SQL
2. S'assurer que `Query1` correspond au nom de votre table
3. Tester chaque mesure individuellement

### Données manquantes
```bash
# Vérifier le contenu de la base France
./scripts/france/monitor-france.sh database
```

### Performance lente
1. Réduire la plage de dates dans les filtres
2. Limiter à quelques pays dans les tests
3. Utiliser les agrégations au lieu des détails

---

## 📞 Support

**En cas de problème :**
1. Consulter les logs : `./scripts/france/monitor-france.sh logs`
2. Vérifier la connectivité : `./scripts/france/monitor-france.sh health`
3. Contacter le support RGPD : dpo@sante-france.fr

---

**🇫🇷 Votre dashboard PowerBI est maintenant adapté à l'architecture France avec conformité RGPD !**

*Guide d'adaptation PowerBI France - MSPR3 - Version 1.0.0*