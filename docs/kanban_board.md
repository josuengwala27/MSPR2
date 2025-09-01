# Tableau Kanban - Projet IA OMS

## 🗂️ Configuration GitHub Projects

### Colonnes du Tableau Kanban

```
📋 BACKLOG → ⏳ À FAIRE → 🔄 EN COURS → 👀 REVIEW → ✅ TERMINÉ
```

---

## 📊 Vue Actuelle du Tableau (Sprint 2)

### 📋 BACKLOG (Priorisé)
| Priorité | Tâche | Assigné | Estimation | Labels |
|----------|-------|---------|------------|--------|
| 🔴 Haute | Modèle clustering géographique | @dev-ia | 8h | `ai`, `ml` |
| 🔴 Haute | API routes pays avec filtres | @dev-backend | 6h | `api`, `backend` |
| 🟡 Moyenne | Tests d'intégration multi-services | @dev-qa | 12h | `test`, `integration` |
| 🟡 Moyenne | Composant graphiques interactifs | @dev-frontend | 10h | `frontend`, `ui` |
| 🟢 Basse | Documentation API OpenAPI | @dev-backend | 4h | `docs`, `api` |

### ⏳ À FAIRE (Sprint Actuel)
| Tâche | Assigné | Deadline | Dépendances |
|-------|---------|----------|-------------|
| Finaliser modèle mortalité | @dev-ia | 2024-01-15 | ETL données |
| Routes indicateurs historiques | @dev-backend | 2024-01-16 | Schéma BDD |
| Pages de visualisation | @dev-frontend | 2024-01-18 | API routes |
| Tests unitaires IA | @dev-qa | 2024-01-17 | Modèles IA |

### 🔄 EN COURS (WIP Limit: 4)
| Tâche | Assigné | Début | Progression | Blockers |
|-------|---------|-------|-------------|----------|
| Modèle R(t) épidémiologique | @dev-ia | 2024-01-10 | 70% | ⚠️ Données manquantes Suisse |
| Middleware authentification | @dev-backend | 2024-01-12 | 45% | - |
| Composants Layout responsifs | @dev-frontend | 2024-01-11 | 60% | - |
| Configuration CI/CD GitHub Actions | @devops | 2024-01-13 | 30% | ⚠️ Credentials Docker |

### 👀 REVIEW (Code Review)
| Tâche | Auteur | Reviewer | Créé le | Statut |
|-------|--------|----------|---------|---------|
| Pipeline ETL optimisé | @dev-data | @dev-backend | 2024-01-14 | ✅ Approuvé |
| API routes pays | @dev-backend | @dev-lead | 2024-01-14 | 🔄 Changements demandés |
| Tests ETL automatisés | @dev-qa | @dev-data | 2024-01-13 | ⏳ En attente |

### ✅ TERMINÉ (Sprint 2)
| Tâche | Assigné | Terminé le | Effort Réel |
|-------|---------|------------|-------------|
| ✅ Schéma Prisma multi-pays | @dev-backend | 2024-01-10 | 6h |
| ✅ Scripts Docker optimisés | @devops | 2024-01-11 | 4h |
| ✅ Extraction données Mpox | @dev-data | 2024-01-12 | 8h |
| ✅ Setup React + routing | @dev-frontend | 2024-01-13 | 5h |

---

## 📈 Métriques du Tableau

### Cycle Time (Temps de cycle)
- **Backlog → À Faire** : 2 jours
- **À Faire → En Cours** : 1 jour
- **En Cours → Review** : 3 jours
- **Review → Terminé** : 1 jour
- **Cycle Total Moyen** : 7 jours

### Work In Progress (WIP)
- **Limite WIP "En Cours"** : 4 tâches max
- **WIP Actuel** : 4/4 (100% - attention !)
- **Blockers Actifs** : 2

### Vélocité de l'Équipe
```
Sprint 1: 32 points ████████████████████████████████░░░░░░░░
Sprint 2: 28 points ████████████████████████████░░░░░░░░░░░░ (en cours)
Prévision Sprint 3: 35 points
```

---

## 🏷️ Système de Labels

### Par Composant
- 🤖 `ai` - Intelligence Artificielle
- 🗄️ `backend` - API Express.js
- 🎨 `frontend` - Interface React
- 📊 `data` - ETL et base de données
- 🧪 `test` - Tests et qualité
- 📚 `docs` - Documentation

### Par Priorité
- 🔴 `priority-high` - Bloquant pour le sprint
- 🟡 `priority-medium` - Important mais flexible
- 🟢 `priority-low` - Nice to have

### Par Type
- 🐛 `bug` - Correction de bug
- ✨ `feature` - Nouvelle fonctionnalité
- 🔧 `enhancement` - Amélioration
- 📖 `documentation` - Documentation
- 🧪 `test` - Tests

### Par Pays (Configuration)
- 🇺🇸 `country-us` - Spécifique États-Unis
- 🇫🇷 `country-france` - Spécifique France
- 🇨🇭 `country-switzerland` - Spécifique Suisse

---

## 📋 Templates de Tâches

### 🆕 Nouvelle Fonctionnalité
```markdown
## Description
Description claire de la fonctionnalité

## Critères d'Acceptation
- [ ] Critère 1
- [ ] Critère 2
- [ ] Tests unitaires
- [ ] Documentation mise à jour

## Estimation
- Complexité: [Low/Medium/High]
- Effort: [X heures]

## Dépendances
- Dépend de: #issue-number
```

### 🐛 Bug Report
```markdown
## Description du Bug
Description du problème

## Étapes pour Reproduire
1. Étape 1
2. Étape 2
3. Voir l'erreur

## Comportement Attendu
Ce qui devrait se passer

## Environnement
- OS: [Windows/Linux/Mac]
- Version: [version]
```

---

## 🔄 Processus de Workflow

### 1. Planification (Début de Sprint)
- Product Owner priorise le backlog
- Équipe estime les tâches
- Sprint planning: sélection des tâches

### 2. Exécution
- WIP limité à 4 tâches "En Cours"
- Daily standup: mise à jour du tableau
- Mouvement des cartes selon progression

### 3. Review
- Code review obligatoire
- Tests automatisés passent
- Validation des critères d'acceptation

### 4. Rétrospective
- Analyse des métriques
- Identification des améliorations
- Ajustement du processus

---

## 🎯 Objectifs d'Amélioration Continue

### Sprint Actuel (2)
- [ ] Réduire le cycle time à 6 jours
- [ ] Augmenter la vélocité à 35 points
- [ ] Éliminer les blockers

### Sprint Suivant (3)
- [ ] Automatiser le déplacement des cartes
- [ ] Intégrer les métriques en temps réel
- [ ] Améliorer la prédictibilité des estimations

