import { useState, useEffect } from 'react'
import { fetchRestaurantMenu } from '../services/perplexityService'

function RestaurantModal({ restaurant, onClose, userAllergies }) {
  const [dishes, setDishes] = useState(restaurant?.dishes || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!restaurant) return

    // If dishes already loaded, use them
    if (restaurant.dishes && restaurant.dishes.length > 0) {
      setDishes(restaurant.dishes)
      return
    }

    // Otherwise fetch from Perplexity
    const loadMenu = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const menuData = await fetchRestaurantMenu(restaurant.name, restaurant.address)
        if (menuData && menuData.dishes) {
          setDishes(menuData.dishes)
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

  // Filter dishes based on user allergies
  const filterDishesByAllergies = (dishes, allergies) => {
    if (!allergies || allergies.length === 0) {
      return dishes
    }

    return dishes.filter(dish => {
      const hasAllergen = dish.allergens?.some(allergen =>
        allergies.includes(allergen)
      )
      return !hasAllergen
    })
  }

  const availableDishes = filterDishesByAllergies(dishes, userAllergies)

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-[#111827] rounded-3xl shadow-2xl shadow-black/50 max-w-2xl w-full max-h-[85vh] overflow-hidden border border-white/10 animate-modal-appear"
        onClick={e => e.stopPropagation()}
        style={{
          animation: 'modal-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {/* Header with gradient */}
        <div className="relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-green-600/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <span className="text-2xl">🍽️</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white leading-tight">{restaurant.name}</h2>
                    <p className="text-white/50 text-sm">{restaurant.type}</p>
                  </div>
                </div>
                <p className="text-white/40 text-sm flex items-center gap-1.5 mt-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {restaurant.address}
                </p>
                
                {/* Rating badge */}
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                    <svg className="w-4 h-4 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span className="font-bold text-white">{restaurant.rating?.toFixed(1) || '4.0'}</span>
                  </div>
                  
                  {userAllergies && userAllergies.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-full text-xs font-medium border border-amber-500/30">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Filtré ({userAllergies.length})</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all duration-300"
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
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider">
              Menu disponible
            </h3>
            {!isLoading && availableDishes.length > 0 && (
              <span className="text-xs text-emerald-400 font-medium">
                {availableDishes.length} plat{availableDishes.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-white/40">Chargement du menu...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">😔</div>
              <p className="text-white/60">{error}</p>
            </div>
          ) : availableDishes.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🥬</div>
              <p className="text-white/60 mb-2">Aucun plat disponible</p>
              <p className="text-white/40 text-sm">avec vos restrictions alimentaires</p>
            </div>
          ) : (
            <div className="space-y-3">
              {availableDishes.map((dish, index) => (
                <div
                  key={dish.id || index}
                  className="group bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl p-4 transition-all duration-300"
                  style={{
                    animation: `fade-in 0.3s ease ${index * 0.05}s backwards`
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-white group-hover:text-emerald-300 transition-colors">
                      {dish.name}
                    </h4>
                    <span className="text-emerald-400 font-bold text-lg ml-4 shrink-0">
                      {dish.price?.toFixed(2) || '?'}€
                    </span>
                  </div>
                  {dish.description && (
                    <p className="text-white/50 text-sm mb-3 leading-relaxed">
                      {dish.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {dish.vegetarian && (
                      <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1 rounded-full border border-emerald-500/30 font-medium">
                        🌱 Végétarien
                      </span>
                    )}
                    {dish.vegan && (
                      <span className="bg-green-500/20 text-green-300 text-xs px-2.5 py-1 rounded-full border border-green-500/30 font-medium">
                        🌿 Vegan
                      </span>
                    )}
                    {dish.allergens && dish.allergens.length === 0 ? (
                      <span className="bg-blue-500/20 text-blue-300 text-xs px-2.5 py-1 rounded-full border border-blue-500/30 font-medium">
                        ✓ Sans allergènes
                      </span>
                    ) : (
                      dish.allergens?.map(allergen => (
                        <span
                          key={allergen}
                          className="bg-white/5 text-white/50 text-xs px-2.5 py-1 rounded-full border border-white/10"
                        >
                          {allergen}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <button
            onClick={onClose}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
          >
            <span className="relative z-10">Fermer</span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modal-appear {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default RestaurantModal
