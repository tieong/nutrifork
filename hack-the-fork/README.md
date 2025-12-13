# 🍴 Hack The Fork

Application web développée pour le hackathon Hack The Fork. Cette application aide les personnes avec des allergies alimentaires à trouver des restaurants avec des options végétariennes adaptées à leurs besoins.

## ✨ Fonctionnalités

- **Sélection d'allergies** : Interface intuitive pour choisir vos allergies parmi 12 allergènes courants
- **Carte interactive** : Visualisation des restaurants sur une carte avec Leaflet
- **Filtrage intelligent** : Affichage uniquement des plats végétariens sans vos allergènes
- **Design moderne** : Interface responsive et attractive avec animations fluides
- **Géolocalisation** : Centrage automatique sur votre position

## 🚀 Démarrage rapide

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173/`

### Build de production

```bash
npm run build
```

### Prévisualisation du build

```bash
npm run preview
```

## 🏗️ Technologies utilisées

- **React 18** : Framework UI
- **Vite** : Build tool ultra-rapide
- **React Router** : Navigation entre les pages
- **React Leaflet** : Intégration de cartes interactives
- **CSS3** : Animations et design moderne

## 📱 Structure de l'application

### Pages

1. **Page d'accueil** (`/`)
   - Sélection des allergies avec interface à cartes
   - 12 allergènes disponibles
   - Validation avant de continuer

2. **Page Carte** (`/map`)
   - Carte interactive avec marqueurs de restaurants
   - Liste filtrée des restaurants ayant des options adaptées
   - Clic sur marqueur pour voir les détails

3. **Modal Restaurant**
   - Affichage des plats végétariens disponibles
   - Filtrage automatique selon les allergies sélectionnées
   - Badges visuels pour identification rapide

## 🎨 Fonctionnement du filtrage

L'application filtre les plats selon deux critères :
1. **Plat végétarien** : Seuls les plats végétariens sont affichés
2. **Sans allergènes** : Les plats contenant vos allergies sont exclus

Exemple : Si vous sélectionnez "Gluten" et "Produits laitiers", seuls les plats végétariens sans gluten ni produits laitiers seront affichés.

## 📊 Données de démonstration

L'application utilise actuellement des données de démonstration avec 4 restaurants à Paris :
- Le Potager Bio
- Green Kitchen
- Jardin Secret
- La Table Verte

Chaque restaurant dispose de 5 plats avec différentes caractéristiques.

## 🔄 Évolutions possibles

- Intégration d'une API réelle de restaurants
- Ajout de filtres supplémentaires (prix, note, distance)
- Système de favoris
- Partage de restaurants
- Mode sombre
- Support multilingue
- Itinéraire vers le restaurant

## 👥 Contribution

Projet développé pour Hack The Fork 2024.

## 📄 Licence

MIT
