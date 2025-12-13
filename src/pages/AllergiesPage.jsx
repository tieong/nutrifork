import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const commonAllergies = [
  { id: 'gluten', name: 'Gluten', icon: '🌾' },
  { id: 'lactose', name: 'Lactose', icon: '🥛' },
  { id: 'nuts', name: 'Fruits à coque', icon: '🥜' },
  { id: 'eggs', name: 'Œufs', icon: '🥚' },
  { id: 'fish', name: 'Poisson', icon: '🐟' },
  { id: 'shellfish', name: 'Fruits de mer', icon: '🦐' },
  { id: 'soy', name: 'Soja', icon: '🫘' },
  { id: 'sesame', name: 'Sésame', icon: '🌰' },
]

function AllergiesPage() {
  const [selectedAllergies, setSelectedAllergies] = useState([])
  const navigate = useNavigate()

  const toggleAllergy = (allergyId) => {
    setSelectedAllergies(prev =>
      prev.includes(allergyId)
        ? prev.filter(id => id !== allergyId)
        : [...prev, allergyId]
    )
  }

  const handleContinue = () => {
    // Store allergies in localStorage
    localStorage.setItem('userAllergies', JSON.stringify(selectedAllergies))
    navigate('/map')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🍴 NutriFork
          </h1>
          <p className="text-gray-600">
            Sélectionnez vos allergies alimentaires
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {commonAllergies.map(allergy => (
            <button
              key={allergy.id}
              onClick={() => toggleAllergy(allergy.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedAllergies.includes(allergy.id)
                  ? 'border-emerald-500 bg-emerald-50 shadow-md scale-105'
                  : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <div className="text-3xl mb-2">{allergy.icon}</div>
              <div className="text-sm font-medium text-gray-700">
                {allergy.name}
              </div>
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleContinue}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors"
          >
            Trouver des restaurants
          </button>
          {selectedAllergies.length > 0 && (
            <p className="mt-4 text-sm text-gray-600">
              {selectedAllergies.length} allergie(s) sélectionnée(s)
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AllergiesPage
