import { useState, useEffect, useCallback, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import RestaurantModal from '../components/RestaurantModal'
import SettingsModal from '../components/SettingsModal'
import SearchModal from '../components/SearchModal'
import PillNavbar from '../components/PillNavbar'
import carroteGood from '../assets/carrote-good.svg'
import carroteBad from '../assets/carrote-bad.svg'
import { getMockDishesForRestaurant } from '../services/mockDishesService'

const defaultCenter = {
  lat: 48.8965,
  lng: 2.3183
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

// Helper function to calculate veggie score for a restaurant
const calculateVeggieScore = (restaurant) => {
  const dishes = getMockDishesForRestaurant(restaurant)
  if (!dishes || dishes.length === 0) return 0

  const veggieCount = dishes.filter(dish => dish.vegetarian).length
  return Math.round((veggieCount / dishes.length) * 100)
}

function createUserMarker() {
  const container = document.createElement('div')
  container.className = 'marker-container'
  container.innerHTML = `
    <div class="user-marker">
      <div class="user-marker-pulse"></div>
      <div class="user-marker-pulse" style="animation-delay: 0.5s"></div>
      <div class="user-marker-pulse" style="animation-delay: 1s"></div>
      <div class="user-marker-dot"></div>
    </div>
  `
  return container
}

function createRestaurantMarker(restaurant, index) {
  const veggieScore = restaurant.veggieScore || 0
  const isVeggie = restaurant.isVeggie || false
  const carroteSrc = isVeggie ? carroteGood : carroteBad

  const container = document.createElement('div')
  container.className = 'carrote-marker-container'
  container.style.animationDelay = `${index * 60}ms`

  container.innerHTML = `
    <div class="carrote-marker ${isVeggie ? 'carrote-good' : 'carrote-bad'}" style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
      <img src="${carroteSrc}" alt="${isVeggie ? 'Veggie restaurant' : 'Restaurant'}" class="carrote-icon" />
      <div class="carrote-rating" style="display: flex !important; visibility: visible !important; opacity: 1 !important; position: relative !important;">
        <svg viewBox="0 0 20 20" fill="currentColor" style="width: 11px; height: 11px; color: #fbbf24;"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
        <span style="font-size: 10px; font-weight: 700;">${veggieScore}%</span>
      </div>
    </div>
  `

  console.log('🔍 Marker created:', { veggieScore, isVeggie, restaurant: restaurant.name })

  return container
}

function MapPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const [userAllergies, setUserAllergies] = useState([])
  const [userLocation, setUserLocation] = useState(defaultCenter)
  const [restaurants, setRestaurants] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('nutrifork-theme')
    return saved ? saved === 'dark' : false // Light by default
  })

  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])

  // API Keys
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  const JAWG_ACCESS_TOKEN = import.meta.env.VITE_JAWG_ACCESS_TOKEN || ''

  // Toggle theme
  const handleToggleTheme = () => {
    setIsDarkMode(prev => {
      const newValue = !prev
      localStorage.setItem('nutrifork-theme', newValue ? 'dark' : 'light')
      return newValue
    })
  }

  // Handle location selection from search
  const handleLocationSelect = (location) => {
    console.log('📍 Location selected:', location)

    // Update user location
    setUserLocation({
      lat: location.lat,
      lng: location.lng
    })

    // Update map center
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [location.lng, location.lat],
        zoom: 15,
        duration: 2000,
        essential: true
      })
    }

    // If it's a restaurant, open the restaurant modal
    if (location.isRestaurant) {
      console.log('🍽️ Opening restaurant modal for:', location.name)

      // Determine restaurant type
      const primaryType = location.types.find(type =>
        ['vegan_restaurant', 'vegetarian_restaurant', 'restaurant', 'cafe', 'bar'].includes(type)
      ) || 'restaurant'

      const isVeggie = primaryType === 'vegan_restaurant' || primaryType === 'vegetarian_restaurant'

      // Calculate estimated score based on type
      let estimatedScore = 50
      if (primaryType === 'vegan_restaurant') {
        estimatedScore = 95
      } else if (primaryType === 'vegetarian_restaurant') {
        estimatedScore = 80
      } else if (isVeggie) {
        estimatedScore = 75
      } else {
        estimatedScore = Math.min(60, Math.round(location.rating * 10))
      }

      // Create restaurant object compatible with RestaurantModal
      const restaurant = {
        id: location.placeId || `search-${Date.now()}`,
        name: location.name,
        address: location.address,
        position: {
          lat: location.lat,
          lng: location.lng
        },
        rating: location.rating,
        type: primaryType === 'vegan_restaurant' ? '🌿 Vegan'
              : primaryType === 'vegetarian_restaurant' ? '🌱 Vegetarian'
              : primaryType === 'cafe' ? 'Café'
              : 'Restaurant',
        primaryType,
        isVeggie,
        veggieScore: estimatedScore,
        dishes: [],
        isLoading: false,
        menuFetched: false
      }

      // Open restaurant modal
      setSelectedRestaurant(restaurant)
    }
  }

  // Update map style when theme changes
  useEffect(() => {
    if (mapRef.current && mapLoaded) {
      const style = isDarkMode 
        ? `https://api.jawg.io/styles/jawg-dark.json?access-token=${JAWG_ACCESS_TOKEN}`
        : `https://api.jawg.io/styles/jawg-streets.json?access-token=${JAWG_ACCESS_TOKEN}`
      
      mapRef.current.setStyle(style)
    }
  }, [isDarkMode, mapLoaded, JAWG_ACCESS_TOKEN])

  // Load Google Places API script
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setIsLoaded(true)
      return
    }

    const loadGooglePlaces = () => {
      // Check if Google Maps is already fully loaded
      if (window.google?.maps?.importLibrary) {
        setIsLoaded(true)
        return
      }

      // Check if script is already being loaded or exists
      const existingScript = document.querySelector(
        `script[src*="maps.googleapis.com/maps/api/js"]`
      )

      if (existingScript) {
        // Script already exists, wait for it to load completely
        const checkLoaded = () => {
          if (window.google?.maps?.importLibrary) {
            setIsLoaded(true)
          } else {
            setTimeout(checkLoaded, 100)
          }
        }
        checkLoaded()
        return
      }

      // Load script with callback - this is the recommended way to avoid async warnings
      window.initMap = function() {
        setIsLoaded(true)
        delete window.initMap
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async&libraries=places&callback=initMap`
      script.async = true
      script.defer = true
      script.onerror = () => {
        console.error('Failed to load Google Maps API')
        setIsLoaded(false)
        delete window.initMap
      }
      document.head.appendChild(script)
    }

    loadGooglePlaces()
  }, [GOOGLE_MAPS_API_KEY])

  // Search for nearby restaurants using Google Places API
  // PRIORITÉ : Restos vegan/veggietariens d'abord, puis les autres
  // STRATÉGIE : Faire plusieurs requêtes pour obtenir plus de 20 résultats
  const searchNearbyRestaurants = useCallback(async (location) => {
    if (!isLoaded || !window.google?.maps?.importLibrary) return

    setIsSearching(true)
    try {
      // Import the Places library
      const { Place, SearchNearbyRankPreference } = await window.google.maps.importLibrary('places')

      const baseRequest = {
        fields: ['displayName', 'location', 'formattedAddress', 'rating', 'types', 'businessStatus', 'primaryType'],
        locationRestriction: {
          center: location,
          radius: 2500, // 2.5km pour avoir plus de restos végé
        },
        maxResultCount: 20,
        rankPreference: SearchNearbyRankPreference.DISTANCE, // Trier par distance, pas popularité
        language: 'fr',
        region: 'fr',
      }

      // Liste de requêtes ciblées (limitées pour la démo)
      const searchQueries = [
        // 1️⃣ Restos VEGAN (priorité absolue)
        {
          request: {
            ...baseRequest,
            maxResultCount: 20,
            includedPrimaryTypes: ['vegan_restaurant']
          },
          label: '🌿 Vegan'
        },
        // 2️⃣ Restos VEGETARIAN (haute priorité)
        {
          request: {
            ...baseRequest,
            maxResultCount: 20,
            includedPrimaryTypes: ['vegetarian_restaurant']
          },
          label: '🌱 Vegetarian'
        },
        // 3️⃣ Restaurants génériques
        {
          request: {
            ...baseRequest,
            maxResultCount: 20,
            includedPrimaryTypes: ['restaurant']
          },
          label: '🍽️ Restaurants'
        }
        // Cafés exclus volontairement
      ]

      // Exécuter toutes les requêtes en parallèle
      console.log('🔍 Lancement de', searchQueries.length, 'requêtes en parallèle...')
      const allResults = await Promise.allSettled(
        searchQueries.map(async (queryConfig) => {
          try {
            const response = await Place.searchNearby(queryConfig.request)
            const places = response.places || []
            console.log(`  ${queryConfig.label}: ${places.length} résultats`)
            return places
          } catch (error) {
            console.log(`  ${queryConfig.label}: erreur (${error.message})`)
            return []
          }
        })
      )

      // Fusionner tous les résultats en évitant les doublons
      const seenIds = new Set()
      const allPlaces = []

      allResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          result.value.forEach(place => {
            if (!seenIds.has(place.id)) {
              seenIds.add(place.id)
              allPlaces.push(place)
            }
          })
        }
      })

      console.log('✅ Total unique:', allPlaces.length, 'restaurants trouvés')

      if (allPlaces.length > 0) {
        const excludedTypes = ['museum', 'park', 'tourist_attraction', 'art_gallery', 'library',
                               'gym', 'spa', 'church', 'mosque', 'synagogue', 'school', 'hospital',
                               'amusement_park', 'aquarium', 'zoo', 'stadium', 'shopping_mall',
                               'store', 'clothing_store', 'book_store', 'night_club',
                               'cafe', 'coffee_shop', 'breakfast_restaurant', 'brunch_restaurant']

        const transformedRestaurants = allPlaces
          .filter(place => {
            // Vérifier que le place a une location valide
            if (!place.location) return false

            const placeTypes = place.types || []
            const hasExcludedType = placeTypes.some(type => excludedTypes.includes(type))
            return !hasExcludedType && place.businessStatus === 'OPERATIONAL'
          })
          .map(place => {
            const primaryType = place.primaryType || place.types?.[0] || 'restaurant'
            const isVeggie = primaryType === 'vegan_restaurant' ||
                            primaryType === 'vegetarian_restaurant'

            const typeLabels = {
              'vegan_restaurant': '🌿 Vegan',
              'vegetarian_restaurant': '🌱 Vegetarian',
              'restaurant': 'Restaurant',
              'cafe': 'Café',
              'bar': 'Bar',
              'bakery': 'Bakery',
              'meal_takeaway': 'Takeaway',
              'fast_food_restaurant': 'Fast Food',
              'food': 'Restaurant'
            }

            // Gérer location de manière robuste
            let lat = location.lat
            let lng = location.lng

            try {
              if (place.location && typeof place.location.lat === 'function') {
                lat = place.location.lat()
                lng = place.location.lng()
              } else if (place.location && typeof place.location.lat === 'number') {
                lat = place.location.lat
                lng = place.location.lng
              }
            } catch (e) {
              console.warn('Error getting location for place:', place.displayName, e)
            }

            // Créer un ID stable basé sur le nom + position pour le cache
            const stableId = `${place.displayName || 'Restaurant'}-${lat.toFixed(6)}-${lng.toFixed(6)}`

            const restaurant = {
              id: place.id || stableId,
              stableId: stableId, // ID stable pour le cache des menus
              name: place.displayName || 'Restaurant',
              address: place.formattedAddress || '',
              position: {
                lat,
                lng,
              },
              rating: place.rating || 4.0,
              type: typeLabels[primaryType] || 'Restaurant',
              primaryType: primaryType,
              isVeggie: isVeggie, // Flag pour identifier les restos veggie
              dishes: [],
              isLoading: false,
              menuFetched: false
            }

            // Calculer le score végé pour chaque restaurant
            restaurant.veggieScore = calculateVeggieScore(restaurant)

            return restaurant
          })

        // Trier : veggie d'abord, puis par score végé
        const sortedRestaurants = transformedRestaurants.sort((a, b) => {
          if (a.isVeggie && !b.isVeggie) return -1
          if (!a.isVeggie && b.isVeggie) return 1
          return (b.veggieScore || 0) - (a.veggieScore || 0)
        })

        // Limiter à 30 restaurants max pour la démo
        const limitedRestaurants = sortedRestaurants.slice(0, 30)

        console.log('🌱', limitedRestaurants.filter(r => r.isVeggie).length, 'restos veggie sur', limitedRestaurants.length, 'total')
        setRestaurants(limitedRestaurants)
      } else {
        setRestaurants([])
      }
    } catch (error) {
      console.error('Error searching restaurants:', error)
      setRestaurants([])
    } finally {
      setIsSearching(false)
    }
  }, [isLoaded])

  // Load user allergies from localStorage
  useEffect(() => {
    const savedAllergies = localStorage.getItem('userAllergies')
    if (savedAllergies) {
      setUserAllergies(JSON.parse(savedAllergies))
    }
  }, [])

  // Get user location
  useEffect(() => {
    // Pour la démo : toujours utiliser l'école 42 comme position
    // Si tu veux activer la géolocalisation réelle, décommente le code ci-dessous
    setUserLocation(defaultCenter)

    /*
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
          console.log('Geolocation error:', error)
          setUserLocation(defaultCenter)
        }
      )
    }
    */
  }, [])

  // Search restaurants when location changes
  useEffect(() => {
    if (isLoaded && userLocation) {
      searchNearbyRestaurants(userLocation)
    }
  }, [isLoaded, userLocation, searchNearbyRestaurants])

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || !JAWG_ACCESS_TOKEN) return

    const style = isDarkMode 
      ? `https://api.jawg.io/styles/jawg-dark.json?access-token=${JAWG_ACCESS_TOKEN}`
      : `https://api.jawg.io/styles/jawg-streets.json?access-token=${JAWG_ACCESS_TOKEN}`

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      attributionControl: false,
      style: style,
      center: [userLocation.lng, userLocation.lat],
      zoom: 15,
      pitch: isDarkMode ? 45 : 0,
      bearing: isDarkMode ? -10 : 0,
      antialias: true
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right')

    map.on('load', () => {
      setMapLoaded(true)
    })

    mapRef.current = map

    return () => {
      map.remove()
    }
  }, [JAWG_ACCESS_TOKEN])

  // Update map center when user location changes
  useEffect(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        duration: 1500,
        essential: true
      })
    }
  }, [userLocation])

  // Update markers when restaurants change
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return

    // Clear existing markers
    markersRef.current.forEach(marker => {
      marker.getElement().style.opacity = '0'
      setTimeout(() => marker.remove(), 300)
    })
    markersRef.current = []

    // Add user location marker
    const userMarkerEl = createUserMarker()
    const userMarker = new maplibregl.Marker({ 
      element: userMarkerEl,
      anchor: 'center'
    })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(mapRef.current)
    markersRef.current.push(userMarker)

    // Add restaurant markers
    restaurants.forEach((restaurant, index) => {
      const el = createRestaurantMarker(restaurant, index)
      
      el.addEventListener('click', () => {
        setSelectedRestaurant(restaurant)
      })

      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'center',
        offset: [0, -10]
      })
        .setLngLat([restaurant.position.lng, restaurant.position.lat])
        .addTo(mapRef.current)
      
      markersRef.current.push(marker)
    })
  }, [restaurants, userLocation, mapLoaded])

  // Handler pour la mise à jour des allergies depuis SettingsModal
  const handleAllergiesUpdate = (newAllergies) => {
    setUserAllergies(newAllergies)
  }

  // No API keys - show setup screen
  if (!JAWG_ACCESS_TOKEN || !GOOGLE_MAPS_API_KEY) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-[#141414]'}`}>
        <div className={`max-w-2xl w-full rounded-3xl shadow-2xl p-8 text-center border ${isDarkMode ? 'bg-[#0a0a0a] border-brand-gold/20' : 'bg-[#141414] border-brand-gold/25'}`}>
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Configuration required
          </h2>
          <p className={`mb-6 ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
            To display the map, you need to add your API keys in .env file.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative w-full h-screen overflow-hidden ${isDarkMode ? 'bg-[#0a0a0a] dark-theme' : 'bg-[#141414] light-theme'}`}>
      {/* Dark mode overlays */}
      {isDarkMode && (
        <>
          <div className="absolute inset-0 pointer-events-none z-10 vignette-overlay"></div>
          <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-10 bg-gradient-to-b from-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-10 bg-gradient-to-t from-black/30 to-transparent"></div>
        </>
      )}

      {/* Pill Navbar */}
      <PillNavbar
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        onSearch={() => setShowSearchModal(true)}
        onSettings={() => setShowSettingsModal(prev => !prev)}
        allergiesCount={userAllergies.length}
      />

      {/* MapLibre Map */}
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ background: isDarkMode ? '#0a0a0a' : '#141414' }}
      />

      {/* Restaurant modal */}
      {selectedRestaurant && (
        <RestaurantModal
          restaurant={selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
          userAllergies={userAllergies}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Settings modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        userAllergies={userAllergies}
        onAllergiesUpdate={handleAllergiesUpdate}
        onClose={() => setShowSettingsModal(false)}
        isDarkMode={isDarkMode}
      />

      {/* Search modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onLocationSelect={handleLocationSelect}
        isDarkMode={isDarkMode}
      />
    </div>
  )
}

export default MapPage
