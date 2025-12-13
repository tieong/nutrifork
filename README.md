# 🍴 NutriFork

Application web pour le hackathon "Hack the Fork" permettant de trouver des restaurants avec des plats végétariens adaptés à vos allergies alimentaires.

## 🎯 Fonctionnalités

- **Sélection d'allergies** : Choisissez vos allergies alimentaires parmi les plus courantes
- **Géolocalisation** : Détection automatique de votre position
- **Recherche de proximité** : Trouvez les restaurants dans un rayon de 1km via Google Places API
- **Carte interactive** : Visualisez les restaurants autour de vous sur une carte MapLibre avec tuiles Jawg
- **Menus réels** : Récupération automatique des menus des restaurants via Perplexity AI
- **Filtrage intelligent** : Affichez uniquement les plats végétariens sans vos allergènes
- **Détails des plats** : Consultez les menus avec descriptions, prix et allergènes au clic sur les marqueurs

## 🚀 Installation

1. Clonez le projet (déjà fait !)

2. Installez les dépendances :
```bash
npm install
```

3. Configurez vos clés API :
   - Copiez le fichier `.env.example` en `.env`
   - **Google Maps API** (pour la recherche de restaurants) : Obtenez une clé sur [Google Maps Platform](https://developers.google.com/maps/documentation/javascript/get-api-key)
   - **Jawg Maps** (pour les tuiles de carte) : Créez un compte gratuit sur [Jawg.io](https://www.jawg.io/) et obtenez un token d'accès
   - **Perplexity API** (pour récupérer les menus réels) : Obtenez une clé sur [Perplexity AI](https://www.perplexity.ai/settings/api)
   - Remplacez les valeurs dans le fichier `.env`

```bash
cp .env.example .env
# Éditez .env et ajoutez vos clés API :
# VITE_GOOGLE_MAPS_API_KEY=votre_clé_google
# VITE_JAWG_ACCESS_TOKEN=votre_token_jawg
# VITE_PERPLEXITY_API_KEY=votre_clé_perplexity
```

4. Lancez l'application :
```bash
npm run dev
```

5. Ouvrez votre navigateur sur `http://localhost:5173`

## 🎮 Utilisation

1. **Page d'accueil** : Sélectionnez vos allergies en cliquant sur les cartes
2. **Carte** : Cliquez sur "Trouver des restaurants" pour voir la carte
3. **Restaurants** : Cliquez sur les marqueurs verts pour voir les plats disponibles
4. **Plats** : Seuls les plats végétariens sans vos allergènes sont affichés

## 🛠️ Technologies utilisées

- **React 18** - Framework UI
- **Vite** - Build tool rapide
- **React Router** - Navigation
- **MapLibre GL JS** - Cartographie open-source
- **Jawg Maps** - Tuiles de carte vectorielles
- **Google Places API** - Recherche de restaurants
- **Perplexity AI** - Récupération intelligente des menus réels
- **Tailwind CSS** - Styling

## 📝 Mode démo

Si vous n'avez pas de clés API (Google Maps ou Jawg), l'application fonctionne en mode démo avec une liste de restaurants cliquables.

**Note sur Perplexity** : Si vous n'avez pas de clé Perplexity API, l'application utilisera des plats génériques comme fallback. Pour obtenir des menus réels, ajoutez votre clé API Perplexity dans le fichier `.env`.

## 🗺️ Structure du projet

```
nutrifork/
├── src/
│   ├── components/
│   │   └── RestaurantModal.jsx    # Modal d'affichage des plats
│   ├── data/
│   │   └── mockRestaurants.js     # Données de démo
│   ├── pages/
│   │   ├── AllergiesPage.jsx      # Page de sélection d'allergies
│   │   └── MapPage.jsx            # Page avec carte
│   ├── services/
│   │   └── perplexityService.js   # Service Perplexity AI pour menus
│   ├── App.jsx                     # Routing principal
│   ├── main.jsx                    # Point d'entrée
│   └── index.css                   # Styles Tailwind
├── index.html
├── package.json
└── vite.config.js
```

## 🎨 Allergies supportées

- Gluten 🌾
- Lactose 🥛
- Fruits à coque 🥜
- Œufs 🥚
- Poisson 🐟
- Fruits de mer 🦐
- Soja 🫘
- Sésame 🌰

## 🔮 Améliorations futures

- ✅ ~~Intégration avec des APIs de menus réels~~ (Implémenté avec Perplexity AI!)
- Recherche par adresse personnalisée
- Filtres supplémentaires (prix, distance personnalisée, note minimale)
- Sauvegarde des préférences utilisateur
- Mode sombre
- Partage de restaurants favoris
- Ajustement du rayon de recherche (actuellement fixé à 1km)
- Cache des menus pour éviter de refaire les mêmes requêtes Perplexity

## 📄 Licence

Projet créé pour le hackathon "Hack the Fork"

## 👥 Contribution

N'hésitez pas à proposer des améliorations !
