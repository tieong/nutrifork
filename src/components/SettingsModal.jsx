import { useState, useEffect } from 'react'

// ============================================
// SETTINGS MODAL - Édition des préférences
// ============================================

const commonAllergies = [
  { id: 'gluten', name: 'Gluten', icon: '🌾' },
  { id: 'lait', name: 'Lactose', icon: '🥛' },
  { id: 'fruits à coques', name: 'Fruits à coque', icon: '🥜' },
  { id: 'oeufs', name: 'Œufs', icon: '🥚' },
  { id: 'poisson', name: 'Poisson', icon: '🐟' },
  { id: 'crustacés', name: 'Crustacés', icon: '🦐' },
  { id: 'soja', name: 'Soja', icon: '🫘' },
  { id: 'sésame', name: 'Sésame', icon: '🌰' },
]

function SettingsModal({ isOpen, onClose, userAllergies, onAllergiesUpdate }) {
  const [selectedAllergies, setSelectedAllergies] = useState(userAllergies || [])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setSelectedAllergies(userAllergies || [])
  }, [userAllergies, isOpen])

  const toggleAllergy = (allergyId) => {
    setSelectedAllergies(prev =>
      prev.includes(allergyId)
        ? prev.filter(id => id !== allergyId)
        : [...prev, allergyId]
    )
  }

  const handleSave = () => {
    setSaving(true)

    // Save to localStorage
    localStorage.setItem('userAllergies', JSON.stringify(selectedAllergies))

    onAllergiesUpdate(selectedAllergies)
    setSaving(false)
    onClose()
  }

  if (!isOpen) return null

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
      `}</style>

      <div 
        className="fixed inset-0 flex items-start justify-center pt-32 px-4 z-50"
        onClick={onClose}
        style={{ animation: 'slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        <div 
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex flex-col">
            {/* Header */}
            <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍽️</span>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Allergies & Préférences</h2>
                  <p className="text-xs text-gray-500">Sélectionnez vos restrictions alimentaires</p>
                </div>
              </div>
              <button 
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all" 
                onClick={onClose}
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {commonAllergies.map((allergy) => {
                  const isSelected = selectedAllergies.includes(allergy.id)
                  return (
                    <button
                      key={allergy.id}
                      className={`rounded-2xl p-3 transition-all duration-200 ${
                        isSelected 
                          ? 'bg-orange-50 border-2 border-orange-500 shadow-sm' 
                          : 'bg-gray-50 border-2 border-transparent hover:border-gray-200 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleAllergy(allergy.id)}
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <span className="text-2xl">{allergy.icon}</span>
                        <span className={`text-xs font-semibold text-center leading-tight ${
                          isSelected ? 'text-orange-600' : 'text-gray-700'
                        }`}>
                          {allergy.name}
                        </span>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-orange-500' 
                            : 'bg-white border-2 border-gray-300'
                        }`}>
                          {isSelected && (
                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-gray-100 flex gap-2.5">
              <button
                className="flex-1 py-2.5 px-4 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-all"
                onClick={onClose}
              >
                Annuler
              </button>
              <button
                className="flex-1 py-2.5 px-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Sauvegarde...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SettingsModal
