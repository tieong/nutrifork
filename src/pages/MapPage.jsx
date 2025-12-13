import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api'
import RestaurantModal from '../components/RestaurantModal'

const mapContainerStyle = {
  width: '100%',
  height: '100vh'
}

const defaultCenter = {
  lat: 48.8566,
  lng: 2.3522
}

// Libraries to load for Google Maps
const libraries = ['places', 'marker']

// Helper function to generate mock dishes for a restaurant
const generateMockDishes = (restaurantName) => {
  const dishTemplates = [
    { name: 'Salade verte', price: 9.50, allergens: [], description: 'Salade fraîche de saison' },
    { name: 'Buddha Bowl', price: 12.50, allergens: ['sesame'], description: 'Quinoa, légumes, sauce tahini' },
    { name: 'Risotto aux champignons', price: 14.00, allergens: ['lactose'], description: 'Riz arborio, champignons, parmesan' },
    { name: 'Wrap végétarien', price: 10.00, allergens: ['gluten'], description: 'Tortilla, légumes grillés, houmous' },
    { name: 'Curry de légumes', price: 13.00, allergens: [], description: 'Légumes de saison, lait de coco, riz' },
    { name: 'Poke bowl', price: 13.50, allergens: ['soy', 'sesame'], description: 'Riz, tofu, avocat, edamame' },
    { name: 'Tarte aux légumes', price: 11.50, allergens: ['gluten', 'eggs'], description: 'Pâte feuilletée, légumes du soleil' },
    { name: 'Soupe de lentilles', price: 8.00, allergens: [], description: 'Lentilles corail, épices douces' },
  ]

  // Select 3-5 random dishes
  const numberOfDishes = 3 + Math.floor(Math.random() * 3)
  const shuffled = [...dishTemplates].sort(() => 0.5 - Math.random())
  const selectedDishes = shuffled.slice(0, numberOfDishes)

  return selectedDishes.map((dish, index) => ({
    id: `${restaurantName}-${index}`,
    ...dish,
    vegetarian: true
  }))
}

// Helper function to filter dishes based on user allergies
const filterDishesByAllergies = (dishes, userAllergies) => {
  if (!userAllergies || userAllergies.length === 0) {
    return dishes.filter(dish => dish.vegetarian)
  }

  return dishes.filter(dish => {
    if (!dish.vegetarian) return false
    const hasAllergen = dish.allergens.some(allergen =>
      userAllergies.includes(allergen)
    )
    return !hasAllergen
  })
}

function MapPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [userAllergies, setUserAllergies] = useState([])
  const [userLocation, setUserLocation] = useState(defaultCenter)
  const [restaurants, setRestaurants] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const navigate = useNavigate()

  // IMPORTANT: Replace with your own Google Maps API key
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

  // Load Google Maps API
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  })

  // Search for nearby restaurants using Google Places API
  const searchNearbyRestaurants = useCallback(async (location) => {
    if (!isLoaded || !window.google) return

    setIsSearching(true)
    try {
      // Import Places library
      const { Place, SearchNearbyRankPreference } = await window.google.maps.importLibrary('places')

      const request = {
        fields: ['displayName', 'location', 'formattedAddress', 'rating', 'types', 'businessStatus'],
        locationRestriction: {
          center: location,
          radius: 5000, // 5km radius
        },
        includedPrimaryTypes: ['restaurant'],
        maxResultCount: 20,
        rankPreference: SearchNearbyRankPreference.POPULARITY,
        language: 'fr',
        region: 'fr',
      }

      const { places } = await Place.searchNearby(request)

      if (places && places.length > 0) {
        // Transform places to match our restaurant structure
        const transformedRestaurants = places.map((place, index) => ({
          id: place.id || `restaurant-${index}`,
          name: place.displayName || 'Restaurant',
          position: {
            lat: place.location?.lat() || location.lat,
            lng: place.location?.lng() || location.lng
          },
          address: place.formattedAddress || 'Adresse non disponible',
          type: 'Restaurant',
          rating: place.rating || 4.0,
          dishes: generateMockDishes(place.displayName || `Restaurant ${index}`)
        }))

        setRestaurants(transformedRestaurants)
      } else {
        console.log('No restaurants found nearby')
        setRestaurants([])
      }
    } catch (error) {
      console.error('Error searching for restaurants:', error)
      setRestaurants([])
    } finally {
      setIsSearching(false)
    }
  }, [isLoaded])

  // Get user allergies from localStorage
  useEffect(() => {
    const allergies = JSON.parse(localStorage.getItem('userAllergies') || '[]')
    setUserAllergies(allergies)

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setUserLocation(newLocation)
        },
        (error) => {
          console.log('Error getting location:', error)
          // Use default location (Paris) if geolocation fails
        }
      )
    }
  }, [])

  // Search for restaurants when location changes and maps is loaded
  useEffect(() => {
    if (isLoaded && userLocation) {
      searchNearbyRestaurants(userLocation)
    }
  }, [isLoaded, userLocation, searchNearbyRestaurants])

  const handleMarkerClick = (restaurant) => {
    setSelectedRestaurant(restaurant)
  }

  const handleBackToAllergies = () => {
    navigate('/')
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Configuration requise
          </h2>
          <p className="text-gray-600 mb-6">
            Pour afficher la carte, vous devez ajouter votre clé API Google Maps.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm font-mono text-gray-700 mb-2">
              1. Créez un fichier <code className="bg-white px-2 py-1 rounded">.env</code> à la racine du projet
            </p>
            <p className="text-sm font-mono text-gray-700 mb-2">
              2. Ajoutez: <code className="bg-white px-2 py-1 rounded">VITE_GOOGLE_MAPS_API_KEY=votre_clé_api</code>
            </p>
            <p className="text-sm font-mono text-gray-700">
              3. Obtenez une clé sur: <a href="https://developers.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Maps Platform</a>
            </p>
          </div>

          {/* Demo mode with restaurant list */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Mode démo - Vue en liste
            </h3>
            {isSearching ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Recherche de restaurants...</p>
              </div>
            ) : restaurants.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {restaurants.map(restaurant => (
                  <button
                    key={restaurant.id}
                    onClick={() => setSelectedRestaurant(restaurant)}
                    className="w-full p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors text-left"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800">{restaurant.name}</h4>
                        <p className="text-sm text-gray-600">{restaurant.address}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span className="font-semibold text-gray-700">{restaurant.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🔍</div>
                <p>Aucun restaurant trouvé dans votre zone</p>
              </div>
            )}</div>

          <button
            onClick={handleBackToAllergies}
            className="mt-6 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Modifier mes allergies
          </button>
        </div>

        {selectedRestaurant && (
          <RestaurantModal
            restaurant={selectedRestaurant}
            onClose={() => setSelectedRestaurant(null)}
            userAllergies={userAllergies}
          />
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Header overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <div className="bg-white rounded-lg shadow-lg p-4 flex-1 mr-4">
          <h1 className="text-xl font-bold text-gray-800">🍴 NutriFork</h1>
          <p className="text-sm text-gray-600">
            {userAllergies.length > 0
              ? `${userAllergies.length} allergie(s) sélectionnée(s)`
              : 'Aucune allergie sélectionnée'}
          </p>
          <p className="text-sm text-emerald-600 font-medium mt-1">
            {isSearching ? (
              <span className="flex items-center">
                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Recherche en cours...
              </span>
            ) : (
              `${restaurants.length} restaurant(s) trouvé(s) à moins de 5km`
            )}
          </p>
        </div>
        <button
          onClick={handleBackToAllergies}
          className="bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-lg shadow-lg transition-colors"
        >
          ← Retour
        </button>
      </div>

      {/* Google Map */}
      {isLoaded && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={userLocation}
          zoom={14}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {/* User location marker */}
          <Marker
            position={userLocation}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#3B82F6',
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2,
            }}
          />

          {/* Restaurant markers */}
          {restaurants.map(restaurant => (
            <Marker
              key={restaurant.id}
              position={restaurant.position}
              onClick={() => handleMarkerClick(restaurant)}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="20" r="18" fill="#10B981" stroke="white" stroke-width="3"/>
                    <text x="20" y="27" text-anchor="middle" font-size="20">🍽️</text>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(40, 40),
              }}
            />
          ))}
        </GoogleMap>
      )}

      {/* Restaurant modal */}
      {selectedRestaurant && (
        <RestaurantModal
          restaurant={selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
          userAllergies={userAllergies}
        />
      )}
    </div>
  )
}

export default MapPage
