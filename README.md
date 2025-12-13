# 🍴 NutriFork

Application web pour le hackathon "Hack the Fork" permettant de trouver des restaurants avec des plats végétariens adaptés à vos allergies alimentaires.

## 🎯 Fonctionnalités

- **Sélection d'allergies** : Choisissez vos allergies alimentaires parmi les plus courantes
- **Géolocalisation** : Détection automatique de votre position
- **Recherche de proximité** : Trouvez les restaurants dans un rayon de 5km via Google Places API
- **Carte interactive** : Visualisez les restaurants autour de vous sur Google Maps avec des marqueurs
- **Filtrage intelligent** : Affichez uniquement les plats végétariens sans vos allergènes
- **Détails des plats** : Consultez les menus avec descriptions et allergènes au clic sur les marqueurs

## 🚀 Installation

1. Clonez le projet (déjà fait !)

2. Installez les dépendances :
```bash
npm install
```

3. Configurez votre clé API Google Maps :
   - Copiez le fichier `.env.example` en `.env`
   - Obtenez une clé API sur [Google Maps Platform](https://developers.google.com/maps/documentation/javascript/get-api-key)
   - Remplacez `your_google_maps_api_key_here` par votre clé

```bash
cp .env.example .env
# Éditez .env et ajoutez votre clé API
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
- **Google Maps API** - Cartographie
- **Tailwind CSS** - Styling
- **@react-google-maps/api** - Intégration Google Maps

## 📝 Mode démo

Si vous n'avez pas de clé API Google Maps, l'application fonctionne en mode démo avec une liste de restaurants cliquables.

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

- Intégration avec des APIs de menus réels (actuellement les plats sont générés aléatoirement)
- Recherche par adresse personnalisée
- Filtres supplémentaires (prix, distance personnalisée, note minimale)
- Sauvegarde des préférences utilisateur
- Mode sombre
- Partage de restaurants favoris
- Ajustement du rayon de recherche (actuellement fixé à 5km)

## 📄 Licence

Projet créé pour le hackathon "Hack the Fork"

## 👥 Contribution

N'hésitez pas à proposer des améliorations !
