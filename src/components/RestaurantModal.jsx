function RestaurantModal({ restaurant, onClose, userAllergies }) {
  if (!restaurant) return null

  // Filter dishes based on user allergies
  const filterDishesByAllergies = (dishes, allergies) => {
    if (!allergies || allergies.length === 0) {
      return dishes.filter(dish => dish.vegetarian)
    }

    return dishes.filter(dish => {
      if (!dish.vegetarian) return false
      const hasAllergen = dish.allergens.some(allergen =>
        allergies.includes(allergen)
      )
      return !hasAllergen
    })
  }

  const availableDishes = filterDishesByAllergies(restaurant.dishes, userAllergies)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-green-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">{restaurant.name}</h2>
              <p className="text-emerald-100 text-sm">{restaurant.address}</p>
              <div className="flex items-center mt-2">
                <span className="text-yellow-300 mr-1">★</span>
                <span className="font-semibold">{restaurant.rating}</span>
                <span className="mx-2">•</span>
                <span className="text-emerald-100">{restaurant.type}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              🥗 Plats végétariens disponibles
            </h3>
            {userAllergies && userAllergies.length > 0 && (
              <p className="text-sm text-gray-600">
                Filtrés selon vos allergies
              </p>
            )}
          </div>

          {availableDishes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">😔</div>
              <p>Aucun plat disponible avec vos restrictions</p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableDishes.map(dish => (
                <div
                  key={dish.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">{dish.name}</h4>
                    <span className="text-emerald-600 font-bold">{dish.price.toFixed(2)}€</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{dish.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      🌱 Végétarien
                    </span>
                    {dish.allergens.length === 0 ? (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        ✓ Sans allergènes
                      </span>
                    ) : (
                      dish.allergens.map(allergen => (
                        <span
                          key={allergen}
                          className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                        >
                          Contient: {allergen}
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
        <div className="bg-gray-50 p-4 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}

export default RestaurantModal
