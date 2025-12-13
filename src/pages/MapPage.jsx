import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import RestaurantModal from '../components/RestaurantModal'
import { fetchRestaurantMenu } from '../services/perplexityService'

const defaultCenter = {
  lat: 48.8566,
  lng: 2.3522
}

// Libraries to load for Google Places API
const libraries = ['places']

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
  const [isLoaded, setIsLoaded] = useState(false)
  const navigate = useNavigate()
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])

  // API Keys
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  const JAWG_ACCESS_TOKEN = import.meta.env.VITE_JAWG_ACCESS_TOKEN || ''

  // Load Google Places API script
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setIsLoaded(true)
      return
    }

    const loadGooglePlaces = () => {
      if (window.google?.maps?.importLibrary) {
        setIsLoaded(true)
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&v=weekly`
      script.async = true
      script.defer = true
      script.onload = () => setIsLoaded(true)
      document.head.appendChild(script)
    }

    loadGooglePlaces()
  }, [GOOGLE_MAPS_API_KEY])

  // Search for nearby restaurants using Google Places API
  const searchNearbyRestaurants = useCallback(async (location) => {
    if (!isLoaded || !window.google) return

    setIsSearching(true)
    try {
      // Import Places library
      const { Place, SearchNearbyRankPreference } = await window.google.maps.importLibrary('places')

      const request = {
        fields: ['displayName', 'location', 'formattedAddress', 'rating', 'types', 'businessStatus', 'primaryType'],
        locationRestriction: {
          center: location,
          radius: 1000, // 1km radius
        },
        // Filter for restaurants, cafes, and food establishments only
        // Up to 5 types can be specified to ensure we only get food/drink places
        includedPrimaryTypes: [
          'restaurant',
          'cafe',
          'bar',
          'bakery',
          'meal_takeaway'
        ],
        maxResultCount: 20, // Maximum autorisé par l'API
        rankPreference: SearchNearbyRankPreference.POPULARITY,
        language: 'fr',
        region: 'fr',
      }

      const { places } = await Place.searchNearby(request)

      if (places && places.length > 0) {
        console.log('Places found:', places.length)

        // List of types to exclude (non-food/drink establishments)
        const excludedTypes = ['museum', 'park', 'tourist_attraction', 'art_gallery', 'library',
                               'gym', 'spa', 'church', 'mosque', 'synagogue', 'school', 'hospital',
                               'amusement_park', 'aquarium', 'zoo', 'stadium', 'shopping_mall',
                               'store', 'clothing_store', 'book_store', 'night_club']

        // Transform places to match our restaurant structure (without dishes initially)
        const transformedRestaurants = places
          .filter(place => {
            // Log for debugging
            console.log('Checking place:', place.displayName, 'Primary type:', place.primaryType, 'All types:', place.types)

            // Get all types (both primary and secondary)
            const placeTypes = place.types || []

            // Exclude if ANY type is in the excluded list (museums, parks, etc.)
            const hasExcludedType = placeTypes.some(type => excludedTypes.includes(type))
            if (hasExcludedType) {
              console.log('❌ Excluding (has excluded type):', place.displayName, placeTypes)
              return false
            }

            // If it passed the API filters (includedPrimaryTypes) and doesn't have excluded types, include it
            console.log('✅ Including:', place.displayName, 'Type:', place.primaryType)
            return true
          })
          .map((place, index) => {
            // Get a user-friendly type name
            const primaryType = place.primaryType || 'restaurant'
            let typeDisplay = 'Restaurant'
            if (primaryType.includes('cafe')) typeDisplay = 'Café'
            else if (primaryType.includes('bar')) typeDisplay = 'Bar'
            else if (primaryType.includes('bakery')) typeDisplay = 'Boulangerie'
            else if (primaryType.includes('vegetarian')) typeDisplay = 'Restaurant végétarien'
            else if (primaryType.includes('vegan')) typeDisplay = 'Restaurant vegan'

            return {
              id: place.id || `restaurant-${index}`,
              name: place.displayName || 'Restaurant',
              position: {
                lat: place.location?.lat() || location.lat,
                lng: place.location?.lng() || location.lng
              },
              address: place.formattedAddress || 'Adresse non disponible',
              type: typeDisplay,
              rating: place.rating || 4.0,
              dishes: [], // Will be fetched from Perplexity
              isLoadingMenu: true // Flag to show loading state
            }
          })

        setRestaurants(transformedRestaurants)

        // Fetch menus from Perplexity for each restaurant
        console.log('🔍 Fetching menus from Perplexity for', transformedRestaurants.length, 'restaurants...')

        // Fetch menus sequentially with delay to avoid rate limiting
        for (let i = 0; i < transformedRestaurants.length; i++) {
          const restaurant = transformedRestaurants[i]

          try {
            console.log(`Fetching menu for ${restaurant.name}...`)
            const dishes = await fetchRestaurantMenu(restaurant.name, restaurant.address)

            // Update the specific restaurant with fetched dishes
            setRestaurants(prevRestaurants =>
              prevRestaurants.map(r =>
                r.id === restaurant.id
                  ? { ...r, dishes, isLoadingMenu: false }
                  : r
              )
            )

            console.log(`✅ Menu fetched for ${restaurant.name}: ${dishes.length} dishes`)

            // Add delay between requests to respect rate limits (1 second)
            if (i < transformedRestaurants.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          } catch (error) {
            console.error(`Failed to fetch menu for ${restaurant.name}:`, error)
            // Mark as finished loading even on error (fallback dishes will be used)
            setRestaurants(prevRestaurants =>
              prevRestaurants.map(r =>
                r.id === restaurant.id
                  ? { ...r, isLoadingMenu: false }
                  : r
              )
            )
          }
        }

        console.log('✅ All menus fetched!')
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
          console.log('🔴 Votre position détectée:', newLocation)
          setUserLocation(newLocation)
        },
        (error) => {
          console.error('❌ Erreur de géolocalisation:', error)
          console.log('📍 Utilisation de la position par défaut (Paris):', defaultCenter)
          // Use default location (Paris) if geolocation fails
        }
      )
    } else {
      console.log('⚠️ Géolocalisation non disponible, utilisation de Paris')
    }
  }, [])

  // Search for restaurants when location changes and maps is loaded
  useEffect(() => {
    if (isLoaded && userLocation) {
      searchNearbyRestaurants(userLocation)
    }
  }, [isLoaded, userLocation, searchNearbyRestaurants])

  // Initialize MapLibre map
  useEffect(() => {
    if (!mapContainerRef.current || !JAWG_ACCESS_TOKEN) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: `https://api.jawg.io/styles/jawg-streets.json?access-token=${JAWG_ACCESS_TOKEN}`,
      center: [userLocation.lng, userLocation.lat],
      zoom: 14
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    mapRef.current = map

    return () => {
      map.remove()
    }
  }, [JAWG_ACCESS_TOKEN]) // Only run once on mount

  // Update map center when user location changes
  useEffect(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.setCenter([userLocation.lng, userLocation.lat])
    }
  }, [userLocation])

  // Update markers when restaurants change
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []

    // Add user location marker
    const userMarkerEl = document.createElement('div')
    userMarkerEl.style.width = '30px'
    userMarkerEl.style.height = '30px'
    userMarkerEl.style.borderRadius = '50%'
    userMarkerEl.style.backgroundColor = '#FF0000'
    userMarkerEl.style.border = '4px solid white'
    userMarkerEl.style.cursor = 'pointer'
    userMarkerEl.style.display = 'flex'
    userMarkerEl.style.alignItems = 'center'
    userMarkerEl.style.justifyContent = 'center'
    userMarkerEl.style.fontSize = '16px'
    userMarkerEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)'
    userMarkerEl.innerHTML = '📍'
    userMarkerEl.title = '📍 Vous êtes ici'
    userMarkerEl.addEventListener('click', () => {
      console.log('🔴 Clicked user marker at:', userLocation)
      alert('Votre position: ' + JSON.stringify(userLocation))
    })

    const userMarker = new maplibregl.Marker({ element: userMarkerEl })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(mapRef.current)
    markersRef.current.push(userMarker)

    // Add restaurant markers
    restaurants.forEach(restaurant => {
      const el = document.createElement('div')
      el.style.width = '40px'
      el.style.height = '40px'
      el.style.cursor = 'pointer'
      el.innerHTML = `
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="18" fill="#10B981" stroke="white" stroke-width="3"/>
          <text x="20" y="27" text-anchor="middle" font-size="20">🍽️</text>
        </svg>
      `
      el.title = restaurant.name
      el.addEventListener('click', () => {
        setSelectedRestaurant(restaurant)
      })

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([restaurant.position.lng, restaurant.position.lat])
        .addTo(mapRef.current)
      markersRef.current.push(marker)
    })
  }, [restaurants, userLocation])

  const handleMarkerClick = (restaurant) => {
    setSelectedRestaurant(restaurant)
  }

  const handleBackToAllergies = () => {
    navigate('/')
  }

  if (!GOOGLE_MAPS_API_KEY || !JAWG_ACCESS_TOKEN) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Configuration requise
          </h2>
          <p className="text-gray-600 mb-6">
            Pour afficher la carte, vous devez ajouter vos clés API.
          </p>
          <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left">
            <p className="text-sm font-mono text-gray-700 mb-2">
              1. Créez un fichier <code className="bg-white px-2 py-1 rounded">.env</code> à la racine du projet
            </p>
            <p className="text-sm font-mono text-gray-700 mb-2">
              2. Ajoutez: <code className="bg-white px-2 py-1 rounded">VITE_GOOGLE_MAPS_API_KEY=votre_clé_api</code>
            </p>
            <p className="text-sm font-mono text-gray-700 mb-2">
              3. Ajoutez: <code className="bg-white px-2 py-1 rounded">VITE_JAWG_ACCESS_TOKEN=votre_token_jawg</code>
            </p>
            <p className="text-sm font-mono text-gray-700 mb-2">
              4. Clé Google Maps: <a href="https://developers.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Google Maps Platform</a>
            </p>
            <p className="text-sm font-mono text-gray-700">
              5. Token Jawg: <a href="https://www.jawg.io/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Jawg Maps</a>
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
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{restaurant.name}</h4>
                        <p className="text-xs text-emerald-600 font-medium mb-1">{restaurant.type}</p>
                        <p className="text-sm text-gray-600">{restaurant.address}</p>
                      </div>
                      <div className="flex items-center ml-2">
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
              `${restaurants.length} restaurant(s) trouvé(s) à moins de 1km`
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

      {/* MapLibre Map with Jawg tiles */}
      {JAWG_ACCESS_TOKEN && (
        <div ref={mapContainerRef} style={{ width: '100%', height: '100vh' }} />
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
