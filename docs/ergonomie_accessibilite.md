# Ergonomie et Accessibilité du Frontend

## 1. Contexte et Objectifs

L’accessibilité et l’ergonomie sont au cœur du frontend de la plateforme OMS, afin de :
- Permettre à tous les utilisateurs (y compris en situation de handicap) d’accéder aux prédictions et visualisations.
- Respecter les standards WCAG 2.1 (niveau AA minimum).
- Offrir une expérience fluide, intuitive et responsive, sur tous supports.

## 2. Principes Appliqués

### a. Conformité WCAG
- **Contrastes élevés** : couleurs testées pour garantir la lisibilité (ex : #222 sur #fff, boutons avec fond accentué).
- **Navigation clavier** : tous les éléments interactifs (menus, boutons, formulaires) sont accessibles via Tab/Entrée/Espace.
- **Alternatives textuelles** : toutes les images et icônes ont un attribut `alt` descriptif.
- **Structure sémantique** : usage des balises HTML5 (`header`, `nav`, `main`, `footer`, `section`, etc.) pour une navigation assistée.
- **Focus visible** : styles CSS dédiés pour indiquer le focus clavier.

### b. Ergonomie générale
- **Responsive design** : mise en page adaptative (Flexbox, media queries), testée sur mobile, tablette, desktop.
- **Composants réutilisables** : boutons, formulaires, cartes, conçus pour la cohérence et la facilité d’utilisation.
- **Feedback utilisateur** : messages d’erreur, chargement, validation explicites.
- **Taille et espacement** : zones cliquables suffisamment grandes, marges et paddings pour éviter les erreurs.

## 3. Exemples Concrets dans le Projet

- **Navigation clavier** :
  - Le menu principal (`Navbar.jsx`) est accessible par Tabulation, avec focus visible.
  - Les boutons de prédiction et de téléchargement sont activables au clavier.
- **Contrastes** :
  - Palette testée avec des outils comme [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/).
  - Ex : boutons principaux en bleu foncé sur fond blanc, textes noirs sur fonds clairs.
- **Composants accessibles** :
  - Utilisation d’`aria-label` sur les icônes (ex : bouton d’export CSV).
  - Tableaux de résultats avec balises `<thead>`, `<tbody>`, `<caption>`.
- **Responsive** :
  - Dashboard et graphiques adaptatifs, testés sur Chrome DevTools (mobile/tablette).
- **Feedback** :
  - Messages d’erreur en cas de saisie invalide, loaders animés pendant les calculs IA.

## 4. Bonnes Pratiques Mises en Œuvre

| Principe                | Mise en œuvre dans le projet                |
|------------------------|---------------------------------------------|
| Contraste              | Palette testée, boutons accentués           |
| Navigation clavier     | Tab/Entrée sur tous les éléments interactifs|
| Focus visible          | Styles CSS dédiés (outline, background)     |
| Alternatives textuelles| `alt`, `aria-label` sur images/icônes       |
| Responsive             | Flexbox, media queries, tests multi-support |
| Feedback utilisateur   | Messages, loaders, validations              |
| Structure sémantique   | Balises HTML5, titres hiérarchisés          |

## 5. Références et Ressources

- [WCAG 2.1 (W3C)](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Checklist accessibilité RGAA](https://accessibilite.numerique.gouv.fr/methode/criteres/)
- [React a11y](https://reactjs.org/docs/accessibility.html)

---