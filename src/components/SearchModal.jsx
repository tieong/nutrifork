import { useState, useEffect, useRef } from 'react'

function SearchModal({ isOpen, onClose, onLocationSelect, isDarkMode = true }) {
  const [searchValue, setSearchValue] = useState('')
  const [predictions, setPredictions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef(null)
  const autocompleteServiceRef = useRef(null)
  const placesServiceRef = useRef(null)

  // Initialize Google Places Autocomplete Service
  useEffect(() => {
    if (isOpen && window.google?.maps?.places) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()
      placesServiceRef.current = new window.google.maps.places.PlacesService(
        document.createElement('div')
      )

      // Focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  // Fetch predictions when search value changes
  useEffect(() => {
    if (!searchValue || searchValue.length < 3) {
      setPredictions([])
      return
    }

    if (!autocompleteServiceRef.current) return

    setIsLoading(true)

    const request = {
      input: searchValue,
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: 'fr' }
    }

    autocompleteServiceRef.current.getPlacePredictions(request, (results, status) => {
      setIsLoading(false)
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        setPredictions(results)
      } else {
        setPredictions([])
      }
    })
  }, [searchValue])

  const handleSelectPlace = async (placeId) => {
    if (!placesServiceRef.current) return

    const request = {
      placeId,
      fields: ['name', 'geometry', 'formatted_address', 'types', 'rating', 'business_status']
    }

    placesServiceRef.current.getDetails(request, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        // Check if this is a restaurant
        const types = place.types || []
        const isRestaurant = types.some(type =>
          ['restaurant', 'food', 'cafe', 'meal_takeaway', 'meal_delivery',
           'vegan_restaurant', 'vegetarian_restaurant', 'bakery', 'bar'].includes(type)
        )

        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          name: place.name,
          address: place.formatted_address,
          isRestaurant,
          types,
          rating: place.rating || 4.0,
          placeId
        }

        onLocationSelect(location)
        setSearchValue('')
        setPredictions([])
        onClose()
      }
    })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <>
      <style>{`
        @keyframes searchModalSlideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes predictionFadeIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <div
        className="fixed inset-0 flex items-start justify-center pt-32 px-4 z-50"
        onClick={onClose}
        style={{ animation: 'searchModalSlideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        <div
          className={`w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔍</span>
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Search address
                </h2>
              </div>

              <button
                onClick={onClose}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isDarkMode
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className={`px-6 py-5 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter an address, restaurant, or place..."
                className={`w-full px-5 py-4 pr-12 rounded-2xl text-base font-medium transition-all border-2 focus:outline-none ${
                  isDarkMode
                    ? 'bg-gray-800 text-white placeholder-gray-500 border-gray-700 focus:border-orange-500'
                    : 'bg-gray-50 text-gray-900 placeholder-gray-400 border-gray-200 focus:border-orange-500'
                }`}
              />
              {isLoading && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Predictions List */}
            {predictions.length > 0 && (
              <div className={`mt-4 rounded-2xl overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                {predictions.map((prediction, index) => (
                  <button
                    key={prediction.place_id}
                    onClick={() => handleSelectPlace(prediction.place_id)}
                    className={`w-full text-left px-5 py-4 transition-all border-b last:border-b-0 ${
                      isDarkMode
                        ? 'border-gray-700 hover:bg-gray-700/50'
                        : 'border-gray-200 hover:bg-white'
                    }`}
                    style={{
                      animation: `predictionFadeIn 0.2s ease ${index * 0.05}s backwards`
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl mt-0.5">📍</span>
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-sm mb-1 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {prediction.structured_formatting.main_text}
                        </div>
                        <div className={`text-xs truncate ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {prediction.structured_formatting.secondary_text}
                        </div>
                      </div>
                      <svg
                        className={`w-5 h-5 flex-shrink-0 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {searchValue.length >= 3 && !isLoading && predictions.length === 0 && (
              <div className={`text-center py-8 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <div className="text-4xl mb-2">🤷</div>
                <p>No results found</p>
              </div>
            )}

            {/* Instructions */}
            {searchValue.length === 0 && (
              <div className={`mt-4 text-center text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                <p>Start typing to search for an address or place</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default SearchModal
