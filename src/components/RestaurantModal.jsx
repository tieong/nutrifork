import { useState, useEffect } from 'react'
import { getMockDishesWithDelay } from '../services/mockDishesService'

// Set to true to use mock dishes, false to use Perplexity API
const USE_MOCK_DISHES = true

function RestaurantModal({ restaurant, onClose, userAllergies, isDarkMode = true }) {
  const [dishes, setDishes] = useState(restaurant?.dishes || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!restaurant) return

    // Si les plats sont déjà chargés, les utiliser
    if (restaurant.dishes && restaurant.dishes.length > 0) {
      setDishes(restaurant.dishes)
      return
    }

    const loadMenu = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        if (USE_MOCK_DISHES) {
          // Utiliser les plats mock
          const mockDishes = await getMockDishesWithDelay(restaurant, 600)
          setDishes(mockDishes)
        } else {
          // Utiliser Perplexity (quand on aura l'API)
          const { fetchRestaurantMenu } = await import('../services/perplexityService')
          const menuData = await fetchRestaurantMenu(restaurant.name, restaurant.address)
          if (menuData && menuData.dishes) {
            setDishes(menuData.dishes)
          }
        }
      } catch (err) {
        console.error('Error fetching menu:', err)
        setError('Impossible de charger le menu')
      } finally {
        setIsLoading(false)
      }
    }

    loadMenu()
  }, [restaurant])

  if (!restaurant) return null

  // Vérifie si un plat est "safe" pour l'utilisateur (végétarien + sans allergènes)
  const isDishSafe = (dish) => {
    if (!dish.vegetarian) return false
    
    if (userAllergies && userAllergies.length > 0) {
      const dishAllergens = (dish.allergens || []).map(a => a.toLowerCase())
      const userAllergensList = userAllergies.map(a => a.toLowerCase())
      const hasAllergen = dishAllergens.some(allergen => 
        userAllergensList.some(userAllergen => 
          allergen.includes(userAllergen) || userAllergen.includes(allergen)
        )
      )
      if (hasAllergen) return false
    }
    
    return true
  }

  // Trier les plats : safe en premier, puis le reste
  const sortedDishes = [...dishes].sort((a, b) => {
    const aIsSafe = isDishSafe(a)
    const bIsSafe = isDishSafe(b)
    if (aIsSafe && !bIsSafe) return -1
    if (!aIsSafe && bIsSafe) return 1
    return 0
  })

  // Calculer le score végé (% de plats végétariens, indépendamment des allergies)
  const veggieCount = dishes.filter(d => d.vegetarian).length
  const veggieScore = dishes.length > 0 ? Math.round((veggieCount / dishes.length) * 100) : 0

  // Compter les plats safe (végétariens sans allergènes) pour info
  const safeCount = dishes.filter(d => isDishSafe(d)).length

  return (
    <div 
      className={`fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50 ${isDarkMode ? 'bg-black/70' : 'bg-black/40'}`}
      onClick={onClose}
    >
      <div 
        className={`rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden border
          ${isDarkMode 
            ? 'bg-[#111827] border-white/10 shadow-black/50' 
            : 'bg-white border-gray-200 shadow-black/10'
          }`}
        onClick={e => e.stopPropagation()}
        style={{
          animation: 'modal-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {/* Header */}
        <div className={`relative overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-emerald-600/20 to-green-600/10' : 'bg-gradient-to-br from-emerald-50 to-green-50'}`}>
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-200/30'}`}></div>
          
          <div className="relative p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                    <span className="text-2xl">🍽️</span>
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold leading-tight ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {restaurant.name}
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>{restaurant.type}</p>
                  </div>
                </div>
                <p className={`text-sm flex items-center gap-1.5 mt-3 ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {restaurant.address}
                </p>
                
                {/* Rating badge */}
                <div className="flex items-center gap-3 mt-4">
                  {/* Score végé - basé sur le % de plats compatibles */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border
                    ${veggieScore >= 50 
                      ? (isDarkMode ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-emerald-100 border-emerald-200')
                      : veggieScore >= 25
                        ? (isDarkMode ? 'bg-amber-500/20 border-amber-500/30' : 'bg-amber-100 border-amber-200')
                        : (isDarkMode ? 'bg-red-500/20 border-red-500/30' : 'bg-red-100 border-red-200')
                    }`}>
                    <span className="text-base">🌱</span>
                    <span className={`font-bold ${
                      veggieScore >= 50 
                        ? (isDarkMode ? 'text-emerald-300' : 'text-emerald-700')
                        : veggieScore >= 25
                          ? (isDarkMode ? 'text-amber-300' : 'text-amber-700')
                          : (isDarkMode ? 'text-red-300' : 'text-red-700')
                    }`}>
                      {veggieScore}%
                    </span>
                  </div>
                  
                  {/* Note Google */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border
                    ${isDarkMode ? 'bg-white/10 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                    <svg className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {restaurant.rating?.toFixed(1) || '4.0'}
                    </span>
                  </div>
                  
                  {/* Compteur plats safe */}
                  <span className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>
                    {safeCount}/{dishes.length} pour vous
                  </span>
                </div>
              </div>
              
              {/* Close button */}
              <button
                onClick={onClose}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                  ${isDarkMode 
                    ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white' 
                    : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-400 hover:text-gray-600 shadow-sm'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className={`absolute inset-0 rounded-full blur-xl animate-pulse ${isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}></div>
                <div className={`relative w-16 h-16 border-4 rounded-full animate-spin ${isDarkMode ? 'border-emerald-500/30 border-t-emerald-500' : 'border-emerald-100 border-t-emerald-500'}`}></div>
              </div>
              <p className={isDarkMode ? 'text-white/40' : 'text-gray-400'}>Loading menu...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">😔</div>
              <p className={isDarkMode ? 'text-white/60' : 'text-gray-500'}>{error}</p>
            </div>
          ) : dishes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🍽️</div>
              <p className={`mb-2 ${isDarkMode ? 'text-white/60' : 'text-gray-600'}`}>Menu not available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedDishes.map((dish, index) => {
                const isSafe = isDishSafe(dish)
                return (
                  <div
                    key={dish.id || index}
                    className={`rounded-2xl p-4 transition-all duration-300 border
                      ${isSafe 
                        ? (isDarkMode 
                            ? 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40' 
                            : 'bg-emerald-50 border-emerald-200 hover:border-emerald-300')
                        : (isDarkMode 
                            ? 'bg-white/5 border-white/5 opacity-50' 
                            : 'bg-gray-50 border-gray-100 opacity-50')
                      }`}
                    style={{ animation: `fade-in 0.3s ease ${index * 0.04}s backwards` }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {isSafe && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                            ${isDarkMode ? 'bg-emerald-500/30 text-emerald-300' : 'bg-emerald-200 text-emerald-800'}`}>
                            ✓
                          </span>
                        )}
                        <h4 className={`font-semibold ${isSafe 
                          ? (isDarkMode ? 'text-white' : 'text-gray-800')
                          : (isDarkMode ? 'text-white/60' : 'text-gray-500')
                        }`}>
                          {dish.name}
                        </h4>
                      </div>
                      <span className={`font-bold text-lg ml-4 shrink-0 ${isSafe 
                        ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600')
                        : (isDarkMode ? 'text-white/40' : 'text-gray-400')
                      }`}>
                        {dish.price?.toFixed(2) || '?'}€
                      </span>
                    </div>
                    
                    {dish.description && (
                      <p className={`text-sm mb-3 leading-relaxed ${isSafe
                        ? (isDarkMode ? 'text-white/60' : 'text-gray-600')
                        : (isDarkMode ? 'text-white/30' : 'text-gray-400')
                      }`}>
                        {dish.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-1.5">
                      {/* Badge végé/vegan pour les plats safe */}
                      {isSafe && dish.vegan && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                          ${isDarkMode ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'}`}>
                          🌿 Vegan
                        </span>
                      )}
                      {isSafe && !dish.vegan && dish.vegetarian && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                          ${isDarkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}`}>
                          🌱 Vegetarian
                        </span>
                      )}
                      {isSafe && dish.allergens?.length === 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                          ${isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                          No allergens
                        </span>
                      )}

                      {/* Badge pour les plats non-safe */}
                      {!isSafe && !dish.vegetarian && (
                        <span className={`text-xs px-2 py-0.5 rounded-full
                          ${isDarkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-600'}`}>
                          🍖 Not veggie
                        </span>
                      )}
                      {!isSafe && dish.vegetarian && (
                        <span className={`text-xs px-2 py-0.5 rounded-full
                          ${isDarkMode ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-600'}`}>
                          ⚠️ Contains allergen
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-white/5 bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
          <button
            onClick={onClose}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
          >
            <span className="relative z-10">Close</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modal-appear {
          0% { opacity: 0; transform: scale(0.95) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default RestaurantModal
