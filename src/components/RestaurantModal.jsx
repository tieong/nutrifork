import { useState, useEffect } from 'react'
import { getMockDishesWithDelay } from '../services/mockDishesService'
import carrotGoodSvg from '../assets/carrot-good-optimized.svg?raw'
import carrotBadSvg from '../assets/carrot-bad-optimized.svg?raw'

const USE_MOCK_DISHES = true

function RestaurantModal({ restaurant, onClose, userAllergies, isDarkMode = true }) {
  const [dishes, setDishes] = useState(restaurant?.dishes || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAlternatives, setShowAlternatives] = useState(false)

  useEffect(() => {
    if (!restaurant) return

    if (restaurant.dishes && restaurant.dishes.length > 0) {
      setDishes(restaurant.dishes)
      return
    }

    const loadMenu = async () => {
      setIsLoading(true)
      setError(null)

      try {
        if (USE_MOCK_DISHES) {
          const mockDishes = await getMockDishesWithDelay(restaurant, 600, userAllergies)
          setDishes(mockDishes)
        } else {
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
  }, [restaurant, userAllergies])

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

  // Déterminer si c'est un restaurant végé (>= 70% de plats végé)
  const isVeggieRestaurant = veggieScore >= 70
  const carrotIcon = isVeggieRestaurant ? carrotGoodSvg : carrotBadSvg

  // Calcul CO2 économisé
  // Moyenne : repas viande rouge = 7kg CO2, poulet = 3kg, végé = 1.5kg, vegan = 0.9kg
  const veganCount = dishes.filter(d => d.vegan).length
  const avgMeatCO2 = 5.0 // Moyenne entre viande rouge et poulet
  const avgVegetarianCO2 = 1.5
  const avgVeganCO2 = 0.9

  // Calculer les économies moyennes par repas
  let co2Saved = 0
  if (dishes.length > 0) {
    const veganRatio = veganCount / dishes.length
    const veggieRatio = (veggieCount - veganCount) / dishes.length
    const meatRatio = 1 - veggieRatio - veganRatio

    const avgRestaurantCO2 = (veganRatio * avgVeganCO2) + (veggieRatio * avgVegetarianCO2) + (meatRatio * avgMeatCO2)
    co2Saved = avgMeatCO2 - avgRestaurantCO2
  }

  // Déterminer si on doit afficher le bouton swap
  // Critères : score végé < 60 OU moins de 30% de plats végé
  const shouldShowSwap = veggieScore < 60 || (dishes.length > 0 && (veggieCount / dishes.length) < 0.3)

  // Suggestions de plats plant-based que le restaurant pourrait ajouter
  const suggestedDishes = [
    {
      name: 'Buddha Bowl',
      type: 'vegan',
      description: 'Quinoa, légumes rôtis, avocat, houmous',
      icon: '🥗',
      category: 'Plat principal',
      price: 12.90,
      savings: 3.00
    },
    {
      name: 'Burger Végétal',
      type: 'vegan',
      description: 'Steak de lentilles, légumes frais, sauce maison',
      icon: '🍔',
      category: 'Plat principal',
      price: 14.50,
      savings: 2.50
    },
    {
      name: 'Curry de Légumes',
      type: 'vegan',
      description: 'Lait de coco, légumes de saison, riz basmati',
      icon: '🍛',
      category: 'Plat principal',
      price: 13.90,
      savings: 4.00
    },
    {
      name: 'Poke Bowl Tofu',
      type: 'vegan',
      description: 'Tofu mariné, edamame, avocat, riz vinaigré',
      icon: '🥙',
      category: 'Plat principal',
      price: 15.50,
      savings: 2.00
    },
    {
      name: 'Pad Thaï Végé',
      type: 'vegetarian',
      description: 'Nouilles de riz, légumes sautés, cacahuètes',
      icon: '🍜',
      category: 'Plat principal',
      price: 11.90,
      savings: 3.50
    }
  ]

  // Calculer le nouveau score si le restaurant ajoutait ces plats
  const calculateNewScore = (numDishesToAdd) => {
    if (dishes.length === 0) return 0
    const newVeggieCount = veggieCount + numDishesToAdd
    const newTotal = dishes.length + numDishesToAdd
    return Math.round((newVeggieCount / newTotal) * 100)
  }

  // Sélectionner 3 plats suggérés aléatoirement
  const selectedSuggestions = shouldShowSwap
    ? suggestedDishes.sort(() => Math.random() - 0.5).slice(0, 3)
    : []

  const potentialNewScore = selectedSuggestions.length > 0
    ? calculateNewScore(selectedSuggestions.length)
    : veggieScore

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes dishFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes alternativeSlideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes swapButtonPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @media (max-width: 768px) {
          .restaurant-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          
          .restaurant-scrollbar::-webkit-scrollbar-track {
            background: ${isDarkMode ? '#1f2937' : '#f3f4f6'};
            border-radius: 10px;
          }
          
          .restaurant-scrollbar::-webkit-scrollbar-thumb {
            background: #ff7f00;
            border-radius: 10px;
          }
          
          .restaurant-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #e67300;
          }
        }
      `}</style>

      <div
        className="fixed inset-0 flex items-start justify-center pt-32 px-4 z-50"
        onClick={onClose}
        style={{ animation: 'slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        <div
          className={`w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🍽️</span>
                  <div>
                    <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {restaurant.name}
                    </h2>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {restaurant.type}
                    </p>
                  </div>
                </div>
                <p className={`text-sm flex items-center gap-2 mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {restaurant.address}
                </p>
                
                <div className="flex flex-col gap-2 mt-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Health Score */}
                    <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                      veggieScore >= 70
                        ? 'bg-orange-100 text-orange-600 border-2 border-orange-500'
                        : veggieScore >= 40
                          ? 'bg-yellow-100 text-yellow-600 border-2 border-yellow-500'
                          : 'bg-red-100 text-red-600 border-2 border-red-500'
                    }`}>
                      {veggieScore >= 70 ? '⭐' : veggieScore >= 40 ? '💫' : '⚠️'} {veggieScore}/100
                    </div>

                    {/* Rating */}
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                      isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <svg className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {restaurant.rating?.toFixed(1) || '4.0'}
                      </span>
                    </div>

                    {/* Match */}
                    <div className={`text-xs px-3 py-1.5 rounded-full ${
                      isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {safeCount}/{dishes.length} match
                    </div>
                  </div>

                  {/* CO2 Impact */}
                  {co2Saved > 0 && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                      isDarkMode ? 'bg-green-500/10 border border-green-500/30' : 'bg-green-50 border border-green-200'
                    }`}>
                      <span className="text-lg">🌍</span>
                      <div className="flex-1">
                        <div className={`text-xs font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                          Impact CO2 réduit
                        </div>
                        <div className={`text-xs ${isDarkMode ? 'text-green-300/80' : 'text-green-600'}`}>
                          -{co2Saved.toFixed(1)} kg CO2 par repas vs viande
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Swap Button - Suggestions pour améliorer le menu */}
                  {shouldShowSwap && selectedSuggestions.length > 0 && (
                    <button
                      onClick={() => setShowAlternatives(!showAlternatives)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                        isDarkMode
                          ? 'bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/40 text-orange-400'
                          : 'bg-orange-50 hover:bg-orange-100 border border-orange-300 text-orange-700'
                      }`}
                      style={{ animation: 'swapButtonPulse 2s ease-in-out infinite' }}
                    >
                      <span className="text-lg">💡</span>
                      <div className="flex-1 text-left">
                        <div className="font-bold">Peu d'options végé ?</div>
                        <div className={`text-xs ${isDarkMode ? 'text-orange-300/80' : 'text-orange-600'}`}>
                          Avec {selectedSuggestions.length} plats plant-based : {veggieScore}→{potentialNewScore}/100
                        </div>
                      </div>
                      <svg
                        className={`w-5 h-5 transition-transform ${showAlternatives ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  )}

                  {/* Suggestions de plats Display */}
                  {shouldShowSwap && showAlternatives && selectedSuggestions.length > 0 && (
                    <div className="space-y-2">
                      <div className={`text-xs px-3 py-2 rounded-lg ${
                        isDarkMode ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700'
                      }`}>
                        <span className="font-bold">💚 Suggestions pour {restaurant.name}</span>
                        <div className={`mt-1 ${isDarkMode ? 'text-green-300/80' : 'text-green-600'}`}>
                          En ajoutant ces plats, le score passerait de {veggieScore}/100 à {potentialNewScore}/100
                        </div>
                      </div>
                      {selectedSuggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border ${
                            isDarkMode
                              ? 'bg-gray-800/50 border-gray-700'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                          style={{
                            animation: `alternativeSlideIn 0.3s ease ${index * 0.1}s backwards`
                          }}
                        >
                          <span className="text-2xl">{suggestion.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5">
                              <div className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {suggestion.name}
                              </div>
                              <div className={`text-xs font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                                {suggestion.price.toFixed(2)}€
                              </div>
                            </div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {suggestion.description}
                            </div>
                            <div className={`text-xs mt-1 font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                              💰 -{suggestion.savings.toFixed(2)}€ vs équivalent viande
                            </div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap self-start ${
                            suggestion.type === 'vegan'
                              ? (isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600')
                              : (isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600')
                          }`}>
                            {suggestion.type === 'vegan' ? '🌱 Vegan' : '🥬 Végé'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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

          {/* Content */}
          <div className={`px-4 sm:px-6 py-4 sm:py-5 max-h-[55vh] overflow-y-auto restaurant-scrollbar ${
            isDarkMode ? 'bg-gray-900' : 'bg-white'
          }`}>
            {isLoading ? (
              <div className="text-center py-16">
                <div className="relative w-12 h-12 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Chargement du menu...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">😔</div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>{error}</p>
              </div>
            ) : dishes.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🍽️</div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Menu non disponible</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {sortedDishes.map((dish, index) => {
                  const isSafe = isDishSafe(dish)
                  return (
                    <div
                      key={dish.id || index}
                      className={`rounded-2xl p-3 sm:p-4 transition-all duration-200 border ${
                        isSafe
                          ? (isDarkMode
                              ? 'bg-orange-500/10 border-orange-500/30 hover:border-orange-500'
                              : 'bg-orange-50 border-orange-200 hover:border-orange-400 hover:shadow-md')
                          : (isDarkMode
                              ? 'bg-gray-800/50 border-gray-700/50 opacity-60'
                              : 'bg-gray-50 border-gray-200 opacity-60')
                      }`}
                      style={{
                        animation: `dishFadeIn 0.3s ease ${index * 0.03}s backwards`
                      }}
                    >
                      <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-1">
                          {isSafe && (
                            <span className="text-xs w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold">
                              ✓
                            </span>
                          )}
                          <h4 className={`font-semibold text-xs sm:text-sm leading-tight ${
                            isSafe
                              ? (isDarkMode ? 'text-white' : 'text-gray-900')
                              : (isDarkMode ? 'text-gray-500' : 'text-gray-400')
                          }`}>
                            {dish.name}
                          </h4>
                        </div>
                        <span className={`font-bold text-sm sm:text-base ml-2 shrink-0 ${
                          isSafe
                            ? 'text-orange-500'
                            : (isDarkMode ? 'text-gray-600' : 'text-gray-400')
                        }`}>
                          {dish.price?.toFixed(2) || '?'}€
                        </span>
                      </div>
                      
                      {dish.description && (
                        <p className={`text-xs mb-1.5 sm:mb-2 leading-relaxed line-clamp-2 ${
                          isSafe
                            ? (isDarkMode ? 'text-gray-400' : 'text-gray-600')
                            : (isDarkMode ? 'text-gray-600' : 'text-gray-400')
                        }`}>
                          {dish.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        {isSafe && dish.vegan && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'
                          }`}>
                            🌱 Vegan
                          </span>
                        )}
                        {isSafe && !dish.vegan && dish.vegetarian && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            isDarkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                          }`}>
                            🥬 Végé
                          </span>
                        )}
                        {!isSafe && !dish.vegetarian && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isDarkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                          }`}>
                            🍖 Non végé
                          </span>
                        )}
                        {!isSafe && dish.vegetarian && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
                          }`}>
                            ⚠️ Allergène
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
          <div className={`px-6 py-4 border-t flex gap-3 ${
            isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100'
          }`}>
            <button
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-full font-semibold text-sm transition-all ${
                isDarkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Fermer
            </button>
            <button
              className="flex-1 py-3 px-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Réserver une table
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default RestaurantModal
