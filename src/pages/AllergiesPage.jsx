import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ProfileModal from '../components/ProfileModal'

const commonAllergies = [
  { id: 'gluten', name: 'Gluten', icon: '🌾' },
  { id: 'lactose', name: 'Lactose', icon: '🥛' },
  { id: 'nuts', name: 'Nuts', icon: '🥜' },
  { id: 'eggs', name: 'Eggs', icon: '🥚' },
  { id: 'fish', name: 'Fish', icon: '🐟' },
  { id: 'shellfish', name: 'Shellfish', icon: '🦐' },
  { id: 'soy', name: 'Soy', icon: '🫘' },
  { id: 'sesame', name: 'Sesame', icon: '🌰' },
]

function AllergiesPage({ user, setUser }) {
  const [selectedAllergies, setSelectedAllergies] = useState([])
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()

  // Load profile and allergies
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        // Load from Supabase
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (data) {
          setProfile(data)
          if (data.allergies?.length > 0) {
            setSelectedAllergies(data.allergies)
            localStorage.setItem('userAllergies', JSON.stringify(data.allergies))
          }
        }
      } else {
        // Load from localStorage
        const savedAllergies = localStorage.getItem('userAllergies')
        if (savedAllergies) {
          setSelectedAllergies(JSON.parse(savedAllergies))
        }
        setProfile(null)
      }
    }
    loadData()
  }, [user, showProfileModal])

  const toggleAllergy = (allergyId) => {
    setSelectedAllergies(prev =>
      prev.includes(allergyId)
        ? prev.filter(id => id !== allergyId)
        : [...prev, allergyId]
    )
  }

  const handleContinue = async () => {
    // Store allergies in localStorage
    localStorage.setItem('userAllergies', JSON.stringify(selectedAllergies))
    
    // Also update profile in Supabase if logged in
    if (user) {
      await supabase
        .from('profiles')
        .update({ allergies: selectedAllergies })
        .eq('id', user.id)
    }
    
    navigate('/map')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 relative">
        
        {/* Profile Button - Top Right */}
        <button
          onClick={() => setShowProfileModal(true)}
          className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all group"
        >
          {user ? (
            <>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-500/20">
                {(profile?.name || user?.email)?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-sm text-gray-600 group-hover:text-gray-800 hidden sm:inline">
                {profile?.name || 'My profile'}
              </span>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-sm text-gray-500 group-hover:text-gray-700 hidden sm:inline">
                Login
              </span>
            </>
          )}
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <img src="/mascott.webp" alt="NutriFork Mascot" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            NutriFork
          </h1>
          <p className="text-gray-500">
            Find veggie dishes adapted to your allergies
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
          >
            Find restaurants
          </button>
          {selectedAllergies.length > 0 && (
            <p className="mt-4 text-sm text-gray-500">
              {selectedAllergies.length} allerg{selectedAllergies.length > 1 ? 'ies' : 'y'} selected
            </p>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)}
        user={user}
        setUser={setUser}
      />
    </div>
  )
}

export default AllergiesPage
