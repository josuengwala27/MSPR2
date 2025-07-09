<!--
Ce document présente la stratégie de test du frontend React de la plateforme OMS : outils, organisation, instructions d’exécution, et intégration de l’accessibilité dans la démarche qualité.
-->

# Stratégie de Test Frontend

## 1. Objectifs
- Garantir la fiabilité des fonctionnalités critiques (prédictions, visualisations, navigation).
- Assurer la conformité aux standards d’accessibilité (WCAG 2.1 AA).
- Permettre une évolution rapide et sécurisée du code.

## 2. Outils Utilisés
- **Jest** : Framework de test unitaire pour React.
- **React Testing Library** : Tests orientés utilisateur, vérification du rendu et des interactions.
- **Cypress** : Tests end-to-end (E2E) pour simuler des parcours réels.
- **axe-core** : Audit automatisé de l’accessibilité (intégré dans Cypress).

## 3. Organisation des Tests
- `src/__tests__/` : Tests unitaires des composants et services.
- `src/pages/*.test.js[x]` : Tests spécifiques aux pages principales.
- `tests/e2e/` : Scénarios E2E Cypress (navigation, prédictions, accessibilité).

## 4. Lancer les Tests

### Tests unitaires (Jest + RTL)
```bash
npm test
```
- Exécution de tous les tests unitaires.
- Relance automatique en mode développement.

### Rapport de couverture
```bash
npm run test:coverage
```
- Génère un rapport HTML dans `coverage/`.
- Ouvre `coverage/lcov-report/index.html` pour visualiser les résultats.

### Tests E2E (Cypress)
```bash
npm run cypress:open   # Mode interactif
npm run cypress:run    # Mode headless
```
- Les scénarios sont dans `tests/e2e/`.
- Les résultats s’affichent dans la console ou l’interface Cypress.

## 5. Accessibilité et Qualité
- **Tests automatiques** : Vérification des contrastes, navigation clavier, ARIA, via axe-core et Cypress.
- **Tests manuels** : Utilisation de lecteurs d’écran (NVDA, VoiceOver), navigation sans souris.
- **Critères WCAG** : Tous les composants critiques sont testés pour la conformité AA.

## 6. Bonnes Pratiques
- Écrire des tests pour chaque nouvelle fonctionnalité ou correction.
- Prioriser les tests orientés utilisateur (ce que voit/fait l’utilisateur).
- Vérifier l’accessibilité à chaque Pull Request.
- Maintenir une couverture >80% sur les composants clés.

## 7. Ressources
- [Jest](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress](https://www.cypress.io/)
- [axe-core](https://www.deque.com/axe/)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)

---

*Document rédigé pour garantir la robustesse, l’accessibilité et la maintenabilité du frontend OMS.* 