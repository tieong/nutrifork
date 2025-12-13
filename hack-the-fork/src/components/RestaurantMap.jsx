import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import RestaurantDetail from './RestaurantDetail';
import 'leaflet/dist/leaflet.css';
import './RestaurantMap.css';
import L from 'leaflet';

// Fix pour les icônes Leaflet dans Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Données de démonstration - restaurants à Paris
const DEMO_RESTAURANTS = [
  {
    id: 1,
    name: 'Le Potager Bio',
    lat: 48.8566,
    lng: 2.3522,
    address: '15 Rue de Rivoli, Paris',
    dishes: [
      { id: 1, name: 'Salade Quinoa', vegetarian: true, allergens: [] },
      { id: 2, name: 'Buddha Bowl', vegetarian: true, allergens: ['sesame'] },
      { id: 3, name: 'Curry de Légumes', vegetarian: true, allergens: ['nuts'] },
      { id: 4, name: 'Pâtes Carbonara', vegetarian: false, allergens: ['eggs', 'dairy'] },
      { id: 5, name: 'Risotto aux Champignons', vegetarian: true, allergens: ['dairy'] },
    ],
  },
  {
    id: 2,
    name: 'Green Kitchen',
    lat: 48.8606,
    lng: 2.3376,
    address: '42 Avenue des Champs-Élysées, Paris',
    dishes: [
      { id: 6, name: 'Wrap Végétarien', vegetarian: true, allergens: ['gluten'] },
      { id: 7, name: 'Soupe de Lentilles', vegetarian: true, allergens: [] },
      { id: 8, name: 'Burger Végétal', vegetarian: true, allergens: ['gluten', 'soy'] },
      { id: 9, name: 'Tartine Avocat', vegetarian: true, allergens: ['gluten'] },
      { id: 10, name: 'Pizza Margherita', vegetarian: true, allergens: ['gluten', 'dairy'] },
    ],
  },
  {
    id: 3,
    name: 'Jardin Secret',
    lat: 48.8529,
    lng: 2.3499,
    address: '8 Rue du Louvre, Paris',
    dishes: [
      { id: 11, name: 'Assiette Végétale', vegetarian: true, allergens: [] },
      { id: 12, name: 'Taboulé Maison', vegetarian: true, allergens: ['gluten'] },
      { id: 13, name: 'Falafels', vegetarian: true, allergens: ['sesame'] },
      { id: 14, name: 'Houmous Platter', vegetarian: true, allergens: ['sesame'] },
      { id: 15, name: 'Couscous Végétarien', vegetarian: true, allergens: ['gluten'] },
    ],
  },
  {
    id: 4,
    name: 'La Table Verte',
    lat: 48.8584,
    lng: 2.2945,
    address: '23 Avenue Kléber, Paris',
    dishes: [
      { id: 16, name: 'Gratin Dauphinois', vegetarian: true, allergens: ['dairy'] },
      { id: 17, name: 'Ratatouille', vegetarian: true, allergens: [] },
      { id: 18, name: 'Omelette aux Légumes', vegetarian: true, allergens: ['eggs'] },
      { id: 19, name: 'Salade Niçoise', vegetarian: false, allergens: ['eggs', 'fish'] },
      { id: 20, name: 'Smoothie Bowl', vegetarian: true, allergens: ['nuts'] },
    ],
  },
];

function RestaurantMap({ selectedAllergies }) {
  const navigate = useNavigate();
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 48.8566, lng: 2.3522 });

  useEffect(() => {
    if (selectedAllergies.length === 0) {
      navigate('/');
    }
  }, [selectedAllergies, navigate]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          console.log('Using default location (Paris)');
        }
      );
    }
  }, []);

  const filterDishes = (dishes) => {
    return dishes.filter(
      (dish) =>
        dish.vegetarian &&
        !dish.allergens.some((allergen) => selectedAllergies.includes(allergen))
    );
  };

  const getRestaurantsWithValidDishes = () => {
    return DEMO_RESTAURANTS.map((restaurant) => ({
      ...restaurant,
      availableDishes: filterDishes(restaurant.dishes),
    })).filter((restaurant) => restaurant.availableDishes.length > 0);
  };

  const restaurants = getRestaurantsWithValidDishes();

  return (
    <div className="restaurant-map">
      <div className="map-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Modifier les allergies
        </button>
        <div className="selected-allergies">
          <strong>Allergies sélectionnées:</strong>
          {selectedAllergies.join(', ')}
        </div>
      </div>

      <div className="map-container">
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {restaurants.map((restaurant) => (
            <Marker
              key={restaurant.id}
              position={[restaurant.lat, restaurant.lng]}
              eventHandlers={{
                click: () => setSelectedRestaurant(restaurant),
              }}
            >
              <Popup>
                <strong>{restaurant.name}</strong>
                <br />
                {restaurant.address}
                <br />
                <button
                  onClick={() => setSelectedRestaurant(restaurant)}
                  style={{
                    marginTop: '8px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                  }}
                >
                  Voir les plats
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {selectedRestaurant && (
        <RestaurantDetail
          restaurant={selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
        />
      )}

      <div className="restaurant-count">
        {restaurants.length} restaurant{restaurants.length > 1 ? 's' : ''} trouvé
        {restaurants.length > 1 ? 's' : ''}
      </div>
    </div>
  );
}

export default RestaurantMap;
