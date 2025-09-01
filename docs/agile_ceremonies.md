# Cérémonies Agiles - Projet IA OMS

## 🎯 Méthode Choisie : Scrum Adapté + Kanban

**Justification** : Projet complexe avec contraintes temps, équipe de 5 personnes, besoin de flexibilité et visibilité.

---

## 📅 Planning des Cérémonies

### 🗓️ Calendrier Hebdomadaire
```
LUNDI     : Sprint Planning (si début de sprint)
MARDI     : Daily Standup
MERCREDI  : Daily Standup + Refinement Backlog
JEUDI     : Daily Standup
VENDREDI  : Daily Standup + Review (si fin de sprint) + Rétrospective
```

---

## 🏃‍♂️ 1. DAILY STANDUP (Mêlée Quotidienne)

### ⏰ **Planning**
- **Fréquence** : Tous les jours ouvrés
- **Durée** : 15 minutes max
- **Horaire** : 9h00 (fuseau France)
- **Format** : Visioconférence + partage d'écran Kanban

### 👥 **Participants**
- ✅ Équipe développement (5 personnes)
- ✅ Product Owner (rotation)
- ❌ Stakeholders externes

### 📋 **Format Standard**
Chaque membre répond à 3 questions :
1. **Hier** : Qu'ai-je accompli ?
2. **Aujourd'hui** : Sur quoi vais-je travailler ?
3. **Blockers** : Quels obstacles m'empêchent d'avancer ?

### 📝 **Exemple de Daily**
```
🕐 9h00 - 9h15 | Daily Standup Sprint 2

👨‍💻 Alex (Dev IA):
Hier: Finalisation modèle mortalité, tests unitaires
Aujourd'hui: Démarrage modèle R(t), documentation
Blockers: Données Suisse manquantes

👩‍💻 Sarah (Dev Backend):
Hier: Routes API pays, middleware auth
Aujourd'hui: Finaliser API indicateurs historiques
Blockers: RAS

👨‍💻 Thomas (Dev Frontend):
Hier: Composants graphiques, responsive design
Aujourd'hui: Intégration API pour visualisations
Blockers: API pas encore ready (dépend Sarah)

👩‍🔬 Marie (QA):
Hier: Tests ETL, documentation test cases
Aujourd'hui: Tests d'intégration multi-services
Blockers: RAS

👨‍💼 Aziz (DevOps/PM):
Hier: Configuration CI/CD, Docker optimisations
Aujourd'hui: Finaliser pipeline automatisation
Blockers: Credentials Docker Hub
```

### 🎯 **Résultats Daily**
- ✅ Mise à jour tableau Kanban en direct
- ✅ Identification blockers → actions immédiates
- ✅ Synchronisation équipe
- ✅ Ajustements planning jour

---

## 📋 2. SPRINT PLANNING

### ⏰ **Planning**
- **Fréquence** : Début de chaque sprint (toutes les 2 semaines)
- **Durée** : 4 heures (2h matin + 2h après-midi)
- **Format** : Présentiel ou visio longue

### 👥 **Participants**
- ✅ Toute l'équipe de développement
- ✅ Product Owner
- ✅ Stakeholders clés (début de session)

### 📋 **Agenda Détaillé**

#### **Partie 1 : Objectifs Sprint (2h matin)**
```
9h00-9h30   | Review vélocité sprint précédent
9h30-10h00  | Priorisation backlog avec PO
10h00-10h15 | Pause
10h15-11h00 | Sélection user stories pour le sprint
```

#### **Partie 2 : Planification Détaillée (2h après-midi)**
```
14h00-14h30 | Découpage tâches techniques
14h30-15h00 | Estimation effort (Planning Poker)
15h00-15h15 | Pause
15h15-16h00 | Attribution tâches + définition "Done"
```

### 🎯 **Livrables Sprint Planning**
- ✅ **Sprint Goal** : Objectif clair et mesurable
- ✅ **Sprint Backlog** : Tâches sélectionnées et estimées
- ✅ **Definition of Done** : Critères de qualité
- ✅ **Capacity Planning** : Répartition charge équipe

### 📊 **Exemple Sprint Goal**
```
Sprint 2 Goal:
"Livrer des modèles IA fonctionnels et une API REST complète 
permettant aux utilisateurs de consulter les indicateurs historiques 
et d'obtenir des prédictions de base via l'interface web."

Success Criteria:
- Modèles IA retournent des prédictions valides
- API gère 95% des cas d'usage définis
- Frontend affiche graphiques interactifs
- Tests couvrent >80% du code
```

---

## 🔍 3. SPRINT REVIEW (Revue de Sprint)

### ⏰ **Planning**
- **Fréquence** : Fin de chaque sprint (vendredi)
- **Durée** : 2 heures
- **Format** : Démo + feedback

### 👥 **Participants**
- ✅ Équipe de développement
- ✅ Product Owner
- ✅ Stakeholders OMS
- ✅ Utilisateurs finaux (si possible)

### 📋 **Agenda Review**
```
14h00-14h15 | Rappel objectifs sprint
14h15-15h00 | Démo fonctionnalités développées
15h00-15h15 | Pause
15h15-15h45 | Feedback stakeholders
15h45-16h00 | Planification actions suite aux retours
```

### 🎯 **Format Démo**
1. **Contexte** : Rappel user stories traitées
2. **Démo Live** : Présentation fonctionnalités
3. **Métriques** : Performance, qualité, tests
4. **Challenges** : Difficultés rencontrées et solutions

### 📝 **Exemple Script Review**
```
🎯 Sprint 2 Review - Projet IA OMS

📊 Métriques Atteintes:
- Vélocité: 28/35 points (80%)
- Tests: 82% couverture
- Bugs: 2 critiques résolus

🚀 Fonctionnalités Démo:
1. API indicateurs historiques (filtres pays/dates)
2. Modèle IA mortalité (prédictions COVID)
3. Interface graphiques interactifs
4. Pipeline CI/CD automatisé

🔄 Feedback Stakeholders:
- Demande filtre par région (France métropole vs DOM-TOM)
- Besoin export PDF des graphiques
- Suggestion amélioration performance graphiques

📋 Actions Suivantes:
- Ajout user story "filtres régionaux" au backlog
- Investigation performance frontend
- Planification export PDF Sprint 3
```

---

## 🔄 4. RETROSPECTIVE

### ⏰ **Planning**
- **Fréquence** : Fin de chaque sprint (après review)
- **Durée** : 1h30
- **Format** : Équipe uniquement (safe space)

### 👥 **Participants**
- ✅ Équipe de développement uniquement
- ❌ Stakeholders externes (confidentialité)

### 📋 **Format : Start/Stop/Continue**

#### **Start (Commencer à faire)**
```
💡 Actions à démarrer:
- Pair programming pour tâches complexes
- Tests automatisés sur chaque PR
- Documentation technique au fil de l'eau
```

#### **Stop (Arrêter de faire)**
```
🛑 Actions à abandonner:
- Meetings trop longs (max 1h)
- Commits sans tests
- Développement sans validation PO
```

#### **Continue (Continuer à faire)**
```
✅ Actions à maintenir:
- Daily standups efficaces
- Revues de code systématiques
- Communication proactive sur blockers
```

### 🎯 **Actions d'Amélioration**
Chaque rétrospective produit 2-3 actions concrètes :
```
📋 Actions Sprint 3:
1. Mettre en place pair programming pour modèles IA complexes
2. Créer checklist PR avec critères qualité
3. Organiser session formation Docker pour toute l'équipe

🎯 Responsables:
- Action 1: Alex + Sarah
- Action 2: Marie (QA)
- Action 3: Aziz (DevOps)

📅 Suivi: Review à la prochaine rétro
```

---

## 📚 5. BACKLOG REFINEMENT (Affinage)

### ⏰ **Planning**
- **Fréquence** : Milieu de sprint (mercredi)
- **Durée** : 1 heure
- **Participants** : Équipe + PO

### 🎯 **Objectifs**
- Préparer les user stories pour prochains sprints
- Estimer nouvelles fonctionnalités
- Clarifier critères d'acceptation
- Prioriser selon feedback utilisateurs

### 📋 **Processus Refinement**
```
1. Review backlog items (15min)
2. Ajout nouvelles user stories (15min)
3. Estimation Planning Poker (20min)
4. Priorisation avec PO (10min)
```

### 📊 **Critères de "Ready"**
Une user story est "Ready" si :
- ✅ Critères d'acceptation clairs
- ✅ Estimée par l'équipe
- ✅ Dépendances identifiées
- ✅ Testable
- ✅ Apporte de la valeur utilisateur

---

## 🛠️ 6. OUTILS ET CONFIGURATION

### **GitHub Projects Configuration**

#### **Colonnes Kanban**
```
📋 PRODUCT BACKLOG → 🔄 SPRINT BACKLOG → ⏳ TO DO → 🚧 IN PROGRESS → 👀 REVIEW → ✅ DONE
```

#### **Automatisations GitHub**
```yaml
# .github/workflows/project-automation.yml
name: Project Board Automation

on:
  pull_request:
    types: [opened, reopened]
  issues:
    types: [opened, assigned]

jobs:
  move-cards:
    runs-on: ubuntu-latest
    steps:
      - name: Move to In Progress
        uses: alex-page/github-project-automation-plus@v0.8.3
        with:
          project: Projet IA OMS
          column: In Progress
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```

#### **Labels Automatiques**
- 🏷️ `sprint-1`, `sprint-2`, etc.
- 🏷️ `priority-high`, `priority-medium`, `priority-low`
- 🏷️ `ai`, `backend`, `frontend`, `data`, `devops`
- 🏷️ `country-us`, `country-france`, `country-switzerland`

### **Métriques et Reporting**

#### **Dashboard Vélocité**
```
📊 Vélocité Équipe:
Sprint 1: ████████████████████████████████░░░░░░░░ 32 pts
Sprint 2: ████████████████████████████░░░░░░░░░░░░ 28 pts (en cours)
Sprint 3: ██████████████████████████████████████░░ 35 pts (prévu)

Moyenne: 31.7 points par sprint
Tendance: Stable avec pic prévu Sprint 3
```

#### **Burndown Chart Automatique**
```python
# Script de génération burndown (intégré CI/CD)
def generate_burndown():
    remaining_points = calculate_remaining_work()
    ideal_line = calculate_ideal_burndown()
    actual_line = get_actual_progress()
    
    create_chart(remaining_points, ideal_line, actual_line)
    upload_to_project_board()
```

---

## 📈 7. MÉTRIQUES DE PERFORMANCE

### **KPIs Équipe**
| Métrique | Objectif | Sprint 1 | Sprint 2 | Tendance |
|----------|----------|----------|----------|----------|
| Vélocité | 30-35 pts | 32 pts | 28 pts | ↘️ |
| Cycle Time | <7 jours | 8 jours | 6 jours | ↗️ |
| Code Coverage | >80% | 78% | 82% | ↗️ |
| Bugs en Prod | <5 | 3 | 2 | ↗️ |
| Satisfaction Équipe | >8/10 | 8.2 | 8.5 | ↗️ |

### **Actions d'Amélioration**
- 🎯 **Vélocité** : Réduire scope Sprint 2, mieux estimer
- 🎯 **Cycle Time** : Continuer réduction, très bon progrès
- 🎯 **Coverage** : Objectif atteint, maintenir niveau
- 🎯 **Bugs** : Excellente tendance, focus prévention
- 🎯 **Satisfaction** : Équipe motivée, maintenir dynamique

---

## 🎯 8. ADAPTATION CONTINUE

### **Expérimentations en Cours**
1. **Mob Programming** : Sessions 2h pour tâches complexes
2. **Async Standups** : Tests format asynchrone si contraintes horaires
3. **Stakeholder Reviews** : Sessions mensuelles avec utilisateurs finaux

### **Évolutions Prévues**
- **Sprint 3** : Intégration stakeholders OMS dans reviews
- **Sprint 4** : Mise en place monitoring temps réel
- **Post-MVP** : Transition vers Kanban pur pour maintenance

Cette approche agile adaptée garantit la flexibilité, la qualité et la satisfaction de toutes les parties prenantes du projet IA OMS ! 🚀

