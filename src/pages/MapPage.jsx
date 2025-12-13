import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import RestaurantModal from '../components/RestaurantModal'

const defaultCenter = {
  lat: 48.8566,
  lng: 2.3522
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

// ============================================
// HEADER COMPONENT WITH DARK/LIGHT TOGGLE
// ============================================
function MapHeader({ allergiesCount, restaurantsCount, veggieCount, isSearching, onBack, isDarkMode, onToggleTheme }) {
  return (
    <div className="absolute top-4 left-4 z-20 animate-slide-down">
      <div className={`header-glass ${isDarkMode ? 'header-dark' : 'header-light'} px-4 py-3 flex items-center gap-3`}>
        
        {/* Back button */}
        <button
          onClick={onBack}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group
            ${isDarkMode 
              ? 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800'
            }`}
          title="Modifier mes allergies"
        >
          <svg 
            className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Divider */}
        <div className={`w-px h-8 ${isDarkMode ? 'bg-white/20' : 'bg-gray-300'}`}></div>

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-md shadow-emerald-500/25">
            <span className="text-lg">🌱</span>
          </div>
          <div className="flex flex-col">
            <span className={`font-bold text-base tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              NutriFork
            </span>
            <span className={`text-[9px] uppercase tracking-wider font-medium ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>
              Veggie Finder
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className={`w-px h-8 ${isDarkMode ? 'bg-white/20' : 'bg-gray-300'}`}></div>

        {/* Stats */}
        <div className="flex items-center gap-2">
          {/* Veggie restaurants badge - PRIORITÉ */}
          {veggieCount > 0 && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
              ${isDarkMode 
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                : 'bg-emerald-100 text-emerald-700 border-emerald-200'
              }`}
            >
              <span>🌱</span>
              <span>{veggieCount} végé</span>
            </div>
          )}
          
          {/* Allergies badge */}
          {allergiesCount > 0 && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
              ${isDarkMode 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{allergiesCount}</span>
            </div>
          )}

          {/* Restaurants count */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
            ${isDarkMode 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
            }`}>
            {isSearching ? (
              <>
                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>...</span>
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{restaurantsCount}</span>
              </>
            )}
          </div>

          {/* Distance indicator */}
          <span className={`text-[10px] font-medium ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>&lt;1km</span>
        </div>

        {/* Divider */}
        <div className={`w-px h-8 ${isDarkMode ? 'bg-white/20' : 'bg-gray-300'}`}></div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300
            ${isDarkMode 
              ? 'bg-white/10 hover:bg-white/20 text-yellow-300' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
            }`}
          title={isDarkMode ? 'Mode clair' : 'Mode sombre'}
        >
          {isDarkMode ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}

// ============================================
// ANIMATED USER MARKER COMPONENT
// ============================================
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

// ============================================
// ANIMATED RESTAURANT MARKER COMPONENT
// ============================================
function createRestaurantMarker(restaurant, index) {
  const rating = restaurant.rating || 4.0
  const isVeggie = restaurant.isVeggie || false
  
  // Classes selon le type
  const markerClass = isVeggie ? 'veggie-marker' : 
    (rating >= 4.5 ? 'rating-excellent' : rating >= 4.0 ? 'rating-high' : 'rating-medium')
  
  // Icône selon le type
  const icon = isVeggie ? '🌱' : '🍽️'
  
  const container = document.createElement('div')
  container.className = 'marker-container'
  container.style.animationDelay = `${index * 60}ms`
  
  container.innerHTML = `
    <div class="restaurant-marker ${markerClass}">
      <div class="restaurant-marker-glow"></div>
      <div class="restaurant-marker-inner">
        <span class="restaurant-marker-icon">${icon}</span>
      </div>
      <div class="restaurant-marker-rating">
        <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
        <span>${rating.toFixed(1)}</span>
      </div>
      ${isVeggie ? '<div class="veggie-badge">VÉGÉ</div>' : ''}
    </div>
  `
  
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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('nutrifork-theme')
    return saved ? saved === 'dark' : true // Dark by default
  })
  const navigate = useNavigate()
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
  // PRIORITÉ : Restos vegan/végétariens d'abord, puis les autres
  const searchNearbyRestaurants = useCallback(async (location) => {
    if (!isLoaded || !window.google) return

    setIsSearching(true)
    try {
      const { Place, SearchNearbyRankPreference } = await window.google.maps.importLibrary('places')

      const baseRequest = {
        fields: ['displayName', 'location', 'formattedAddress', 'rating', 'types', 'businessStatus', 'primaryType'],
        locationRestriction: {
          center: location,
          radius: 1500,
        },
        maxResultCount: 20,
        rankPreference: SearchNearbyRankPreference.POPULARITY,
        language: 'fr',
        region: 'fr',
      }

      // 1️⃣ D'abord : chercher les restos VEGAN et VÉGÉTARIENS
      const veggieRequest = {
        ...baseRequest,
        includedPrimaryTypes: [
          'vegan_restaurant',
          'vegetarian_restaurant'
        ],
      }

      let veggieResults = []
      try {
        const veggieResponse = await Place.searchNearby(veggieRequest)
        veggieResults = veggieResponse.places || []
        console.log('🌱 Restos végé/vegan trouvés:', veggieResults.length)
      } catch (e) {
        console.log('Pas de restos végé trouvés, recherche classique...')
      }

      // 2️⃣ Ensuite : chercher les autres restos pour compléter
      const otherRequest = {
        ...baseRequest,
        includedPrimaryTypes: [
          'restaurant',
          'cafe',
          'bakery',
          'meal_takeaway'
        ],
      }

      const otherResponse = await Place.searchNearby(otherRequest)
      const otherResults = otherResponse.places || []
      console.log('🍽️ Autres restos trouvés:', otherResults.length)

      // 3️⃣ Merger : végé d'abord, puis les autres (sans doublons)
      const veggieIds = new Set(veggieResults.map(p => p.id))
      const allPlaces = [
        ...veggieResults,
        ...otherResults.filter(p => !veggieIds.has(p.id))
      ]

      if (allPlaces.length > 0) {
        const excludedTypes = ['museum', 'park', 'tourist_attraction', 'art_gallery', 'library',
                               'gym', 'spa', 'church', 'mosque', 'synagogue', 'school', 'hospital',
                               'amusement_park', 'aquarium', 'zoo', 'stadium', 'shopping_mall',
                               'store', 'clothing_store', 'book_store', 'night_club']

        const transformedRestaurants = allPlaces
          .filter(place => {
            const placeTypes = place.types || []
            const hasExcludedType = placeTypes.some(type => excludedTypes.includes(type))
            return !hasExcludedType && place.businessStatus === 'OPERATIONAL'
          })
          .map(place => {
            const primaryType = place.primaryType || place.types?.[0] || 'restaurant'
            const isVeggie = primaryType === 'vegan_restaurant' || 
                            primaryType === 'vegetarian_restaurant' ||
                            veggieIds.has(place.id)
            
            const typeLabels = {
              'vegan_restaurant': '🌿 Vegan',
              'vegetarian_restaurant': '🌱 Végétarien',
              'restaurant': 'Restaurant',
              'cafe': 'Café',
              'bar': 'Bar',
              'bakery': 'Boulangerie',
              'meal_takeaway': 'À emporter',
              'food': 'Restaurant'
            }

            return {
              id: place.id || `place-${Math.random()}`,
              name: place.displayName || 'Restaurant',
              address: place.formattedAddress || '',
              position: {
                lat: place.location?.lat() || location.lat,
                lng: place.location?.lng() || location.lng,
              },
              rating: place.rating || 4.0,
              type: typeLabels[primaryType] || 'Restaurant',
              primaryType: primaryType,
              isVeggie: isVeggie, // Flag pour identifier les restos végé
              dishes: [],
              isLoading: false,
              menuFetched: false
            }
          })

        setRestaurants(transformedRestaurants)
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
        anchor: 'center'
      })
        .setLngLat([restaurant.position.lng, restaurant.position.lat])
        .addTo(mapRef.current)
      
      markersRef.current.push(marker)
    })
  }, [restaurants, userLocation, mapLoaded])

  const handleBackToAllergies = () => {
    navigate('/')
  }

  // No API keys - show setup screen
  if (!JAWG_ACCESS_TOKEN || !GOOGLE_MAPS_API_KEY) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-[#0a0f1a]' : 'bg-gray-100'}`}>
        <div className={`max-w-2xl w-full rounded-3xl shadow-2xl p-8 text-center border ${isDarkMode ? 'bg-[#111827] border-white/5' : 'bg-white border-gray-200'}`}>
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Configuration requise
          </h2>
          <p className={`mb-6 ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>
            Pour afficher la carte, vous devez ajouter vos clés API.
          </p>
          <button
            onClick={handleBackToAllergies}
            className="text-emerald-500 hover:text-emerald-400 font-medium transition-colors"
          >
            ← Modifier mes allergies
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative w-full h-screen overflow-hidden ${isDarkMode ? 'bg-[#0a0f1a]' : 'bg-gray-100'}`}>
      {/* Dark mode overlays */}
      {isDarkMode && (
        <>
          <div className="absolute inset-0 pointer-events-none z-10 vignette-overlay"></div>
          <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-10 bg-gradient-to-b from-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none z-10 bg-gradient-to-t from-black/30 to-transparent"></div>
        </>
      )}

      {/* Header with theme toggle */}
      <MapHeader 
        allergiesCount={userAllergies.length}
        restaurantsCount={restaurants.length}
        veggieCount={restaurants.filter(r => r.isVeggie).length}
        isSearching={isSearching}
        onBack={handleBackToAllergies}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* MapLibre Map */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full"
        style={{ background: isDarkMode ? '#0a0f1a' : '#f1f5f9' }}
      />

      {/* Restaurant count floating badge */}
      {!isSearching && restaurants.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 animate-fade-up">
          <div className={`header-glass ${isDarkMode ? 'header-dark' : 'header-light'} px-4 py-2 flex items-center gap-2`}>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-white/80' : 'text-gray-800'}`}>
              {restaurants.length} restaurants végé à proximité
            </span>
          </div>
        </div>
      )}

      {/* Restaurant modal */}
      {selectedRestaurant && (
        <RestaurantModal
          restaurant={selectedRestaurant}
          onClose={() => setSelectedRestaurant(null)}
          userAllergies={userAllergies}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  )
}

export default MapPage
