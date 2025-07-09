# Choix et justification des algorithmes IA

---

## Introduction

Ce document détaille la démarche de sélection et de justification des algorithmes d’intelligence artificielle utilisés dans la plateforme de prédiction pandémique. L’objectif est de garantir la robustesse, la pertinence et la transparence des modèles retenus, en tenant compte des spécificités des données épidémiologiques (COVID-19, MPOX) et des besoins des utilisateurs finaux (chercheurs, décideurs, OMS).

Chaque choix est motivé par une analyse comparative, des tests sur données réelles, et une volonté de privilégier l’interprétabilité et la fiabilité des résultats.

---

## 1. Modèle de prédiction de la mortalité : Random Forest

**Pourquoi Random Forest ?**
- Robuste face au bruit et aux données manquantes
- Peu sensible à l’overfitting sur des séries tabulaires
- Interprétable (importance des variables)
- Facile à entraîner et à déployer

**Alternatives étudiées :**
- Régression linéaire/logistique : trop simpliste, moins performante sur des dynamiques complexes
- SVM, XGBoost : plus performants sur certains jeux de données, mais moins interprétables et plus sensibles au tuning

**Limites :**
- Moins performant sur des séries très séquentielles ou avec forte dépendance temporelle

**Exemple de résultat :**
> Prédiction du taux de mortalité sur 30 jours pour la France (COVID-19) :
> - Précision moyenne : 82%
> - Score R² : 0.78
> - Intervalle de confiance fourni pour chaque prédiction

---

## 2. Modèle de prédiction du taux de transmission (Rt) : LSTM

**Pourquoi LSTM ?**
- Excellente capacité à modéliser les dépendances temporelles longues
- Adapté aux séries temporelles épidémiques (Rt, cas, hospitalisations)
- Capable de capturer des tendances, des cycles, et des ruptures

**Alternatives étudiées :**
- ARIMA/SARIMA : performant sur des séries stationnaires, mais moins flexible sur des dynamiques complexes
- GRU, Transformer : plus puissants mais plus coûteux à entraîner, moins interprétables pour un MVP

**Limites :**
- Besoin de beaucoup de données pour bien généraliser
- Moins interprétable qu’un modèle classique

**Exemple de résultat :**
> Prédiction du Rt sur 14 jours pour l’Italie (MPOX) :
> - Précision moyenne : 68%
> - Score RMSE : 0.12
> - Détection automatique des phases d’extrapolation (confiance réduite)

---

## 3. Modèle de propagation géographique : Clustering KMeans

**Pourquoi KMeans ?**
- Permet de regrouper les pays selon la similarité de leur dynamique épidémique
- Simple à interpréter et à visualiser (groupes, centres)
- Rapide à calculer même sur de grands jeux de données

**Alternatives étudiées :**
- DBSCAN : plus adapté aux clusters de forme complexe, mais moins stable sur des séries bruitées
- Agglomératif : plus coûteux, moins scalable

**Limites :**
- Nécessite de fixer le nombre de clusters à l’avance
- Sensible à l’échelle des données (normalisation nécessaire)

**Exemple de résultat :**
> Clustering des pays européens sur la vague Omicron (COVID-19) :
> - 3 groupes principaux identifiés (dynamique rapide, modérée, lente)
> - Visualisation des clusters sur carte interactive

---

## 4. Métriques de performance utilisées

- **Précision (%)** : proportion de bonnes prédictions sur l’ensemble de test
- **Score R²** : qualité de la régression (proche de 1 = très bon)
- **RMSE/MAE** : erreur moyenne absolue ou quadratique
- **Intervalles de confiance** : pour chaque prédiction, niveau d’incertitude
- **Détection d’extrapolation** : alerte si la prédiction sort du domaine des données historiques

---

## 5. Liens utiles

- [Principes d’ergonomie et d’accessibilité](./ergonomie_accessibilite.md)
- [Documentation API IA (OpenAPI)](../AI_API/docs/openapi.yaml)
- [Guide conduite au changement](./conduite_changement_accessibilite.md) 