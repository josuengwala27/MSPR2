# Livrables – Plateforme IA Prédiction Pandémies (OMS)

---

## 1. **Contexte et objectif du projet**

L’objectif de ce projet est de construire une **chaîne complète de traitement, d’analyse et de valorisation de données épidémiologiques** (COVID-19 et MPOX), en respectant les standards professionnels de la data science et du développement logiciel.  
Ce pipeline va de la collecte automatisée de données open data fiables, au nettoyage, à la transformation et au profiling avancés, jusqu’à la modélisation robuste d’une base analytique, l’entraînement de modèles IA, l’exposition des résultats via une API RESTful documentée, et la mise à disposition d’une interface utilisateur moderne, accessible et interactive.

Le projet s’inscrit dans une démarche d’innovation pour la santé publique, avec une attention particulière portée à l’**accessibilité** (standards WCAG), à la **scalabilité** et à la **transparence** des choix techniques.

---

## 2. **Livrable 1 – Documentation IA & Frontend (Choix algorithmes, ergonomie, accessibilité, performance)**

**Où le trouver ?**  
Dossier : [`docs/`](docs/)  
Fichiers principaux :  
- [`choix_algo_ia.md`](docs/choix_algo_ia.md)  
- [`ergonomie_accessibilite.md`](docs/ergonomie_accessibilite.md)  
- [`conduite_changement_accessibilite.md`](docs/conduite_changement_accessibilite.md)

**Ce que vous y trouverez :**  
- Le contexte, les objectifs et la problématique IA du projet.
- Le choix des algorithmes (Random Forest pour la mortalité, LSTM pour le taux de transmission, KMeans pour la propagation géographique), avec justification détaillée, alternatives écartées, avantages/inconvénients.
- Les principes d’ergonomie et d’accessibilité mis en œuvre dans l’interface utilisateur (WCAG, navigation clavier, contrastes, responsive, etc.).
- Les métriques de performance des modèles IA (précision, scores, exemples réels, limites).
- Un guide de conduite au changement pour l’adoption par des utilisateurs non techniques.

---

## 3. **Livrable 2 – Benchmark des solutions Front-end**

**Où le trouver ?**  
Dossier : [`frontend/docs/`](frontend/docs/)  
Fichier principal : [`benchmark_frontend.md`](frontend/docs/benchmark_frontend.md)

**Ce que vous y trouverez :**  
- Un tableau comparatif des principales solutions front-end (React, Vue, Angular, Svelte, etc.).
- Les critères de choix (accessibilité, scalabilité, communauté, intégration, etc.).
- La justification du choix de React pour ce projet, en lien avec les besoins de l’OMS.

---

## 4. **Livrable 3 – Application Front-end moderne et accessible**

**Où le trouver ?**  
Dossier : [`frontend/`](frontend/)  
Fichiers principaux :  
- [`frontend/README.md`](frontend/README.md) (présentation, installation, justification des technos)
- [`src/`](frontend/src/) (code source React, composants, pages, services)
- [`tests/`](frontend/tests/), [`coverage/`](frontend/coverage/) (tests automatisés et rapport de couverture)

**Ce que vous y trouverez :**  
- L’application React complète, conçue pour être accessible, responsive et intuitive, même pour des utilisateurs non techniques.
- L’utilisation de bibliothèques de visualisation modernes (Chart.js, D3, Plotly) pour des dashboards interactifs.
- Des composants et styles respectant les standards d’accessibilité (navigation clavier, contrastes, ARIA, etc.).
- Un README détaillé expliquant les choix techniques, la structure du projet, et les instructions d’utilisation.

---

## 5. **Livrable 4 – API IA Python (FastAPI)**

**Où le trouver ?**  
Dossier : [`AI_API/`](AI_API/)  
Fichiers principaux :  
- [`AI_API/README.md`](AI_API/README.md) (présentation, installation, endpoints, exemples)
- [`src/`](AI_API/src/) (code source FastAPI, modèles ML, services)
- [`docs/openapi.yaml`](AI_API/docs/openapi.yaml) (documentation OpenAPI/Swagger)

**Ce que vous y trouverez :**  
- L’API IA développée en Python avec FastAPI, intégrant les modèles ML pour la prédiction de la mortalité, du taux de transmission et de la propagation.
- La justification des choix technologiques (FastAPI, scikit-learn, numpy, etc.).
- La documentation OpenAPI générée automatiquement, accessible via `/docs`.
- Des exemples d’utilisation et de requêtes pour chaque endpoint.

---

## 6. **Livrable 5 – Documentation d’API (OpenAPI/Swagger)**

**Où le trouver ?**  
Fichier : [`AI_API/docs/openapi.yaml`](AI_API/docs/openapi.yaml)  
Ou accessible en ligne via `/docs` de l’API FastAPI.

**Ce que vous y trouverez :**  
- La description complète de tous les endpoints, paramètres, schémas de données, exemples réels de requêtes/réponses.
- Une documentation interactive pour faciliter l’intégration avec d’autres systèmes ou le test par des utilisateurs.

---

## 7. **Livrable 6 – Tests automatisés & rapport de couverture**

**Où le trouver ?**  
Dossiers : [`frontend/tests/`](frontend/tests/), [`frontend/coverage/`](frontend/coverage/)

**Ce que vous y trouverez :**  
- Les scripts de tests unitaires et E2E (Jest, React Testing Library, Cypress).
- Un rapport de couverture généré automatiquement (HTML, badge, etc.).
- Un [`README`](frontend/tests/README.md) expliquant la stratégie de test, les cas couverts, et comment lancer les tests.

---

## 8. **Livrable 7 – Documentation conduite au changement & accessibilité**

**Où le trouver ?**  
Fichier : [`docs/conduite_changement_accessibilite.md`](docs/conduite_changement_accessibilite.md)

**Ce que vous y trouverez :**  
- Un guide pour accompagner la prise en main de la plateforme par des utilisateurs non techniques.
- Les démarches d’accessibilité mises en œuvre, les supports de formation, et les bonnes pratiques pour une adoption réussie.

---

## 9. **Livrable 8 – Gestion de projet agile & jalons**

**Où le trouver ?**  
Fichier : [`docs/gestion_projet.md`](docs/gestion_projet.md)

**Ce que vous y trouverez :**  
- La roadmap du projet, les jalons atteints et à venir, le backlog évolutif.
- La méthodologie agile adoptée (Scrum/Kanban), les outils utilisés (Trello, GitHub Projects, etc.).
- Un reporting régulier pour les commanditaires, avec la possibilité d’adapter la gestion de projet en fonction des besoins de l’OMS.

---

## **Compléments et organisation**

- **Chaque sous-dossier** ([`frontend/`](frontend/), [`AI_API/`](AI_API/), [`docs/`](docs/), etc.) contient un [`README.md`](frontend/README.md) dédié pour l’installation, l’utilisation et la compréhension locale de la partie concernée.
- **Le présent document** donne la vue d’ensemble, le contexte, et le pipeline global du projet.
- **Des logs détaillés** sont générés à chaque étape (ETL, API, frontend) pour assurer la traçabilité et la qualité.
- **La documentation est structurée et professionnelle** à chaque niveau du projet, pour faciliter la prise en main par tout nouvel arrivant ou évaluateur.

---