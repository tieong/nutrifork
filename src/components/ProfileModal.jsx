import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const commonAllergies = [
  { id: 'gluten', name: 'Gluten', icon: '🌾' },
  { id: 'lactose', name: 'Dairy', icon: '🥛' },
  { id: 'nuts', name: 'Tree Nuts', icon: '🥜' },
  { id: 'eggs', name: 'Eggs', icon: '🥚' },
  { id: 'fish', name: 'Fish', icon: '🐟' },
  { id: 'shellfish', name: 'Shellfish', icon: '🦐' },
  { id: 'soy', name: 'Soy', icon: '🫘' },
  { id: 'sesame', name: 'Sesame', icon: '🌰' },
]

function ProfileModal({ isOpen, onClose, user, setUser, isDarkMode }) {
  const [activeTab, setActiveTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [showAllergiesEditor, setShowAllergiesEditor] = useState(false)
  const [tempAllergies, setTempAllergies] = useState([])
  const [profile, setProfile] = useState(null)

  // Load user profile when user changes
  useEffect(() => {
    if (user) {
      loadProfile()
    } else {
      setProfile(null)
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (data) {
      setProfile(data)
      if (data.allergies) {
        localStorage.setItem('userAllergies', JSON.stringify(data.allergies))
      }
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (error) {
      setError(error.message)
    } else {
      setUser(data.user)
      setFormData({ name: '', email: '', password: '' })
    }
    setLoading(false)
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          name: formData.name,
        }
      }
    })

    if (error) {
      setError(error.message)
    } else {
      const currentAllergies = JSON.parse(localStorage.getItem('userAllergies') || '[]')
      
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name: formData.name,
        email: formData.email,
        allergies: currentAllergies,
        favorites: []
      })
      
      setUser(data.user)
      setFormData({ name: '', email: '', password: '' })
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const toggleAllergy = (allergyId) => {
    setTempAllergies(prev =>
      prev.includes(allergyId)
        ? prev.filter(id => id !== allergyId)
        : [...prev, allergyId]
    )
  }

  const saveAllergies = async () => {
    if (!user) return
    
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({ allergies: tempAllergies })
      .eq('id', user.id)
    
    if (!error) {
      setProfile({ ...profile, allergies: tempAllergies })
      localStorage.setItem('userAllergies', JSON.stringify(tempAllergies))
      setShowAllergiesEditor(false)
    }
    setLoading(false)
  }

  const openAllergiesEditor = () => {
    setTempAllergies(profile?.allergies || [])
    setShowAllergiesEditor(true)
  }

  if (!isOpen) return null

  // Theme-aware classes
  const modalBg = isDarkMode 
    ? 'bg-[#1a1f1c] border border-white/10' 
    : 'bg-white'
  
  const textPrimary = isDarkMode ? 'text-white' : 'text-gray-800'
  const textSecondary = isDarkMode ? 'text-white/60' : 'text-gray-500'
  const textMuted = isDarkMode ? 'text-white/40' : 'text-gray-400'
  
  const inputBg = isDarkMode 
    ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-emerald-500 focus:ring-emerald-500/20' 
    : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:ring-emerald-500/20'
  
  const labelColor = isDarkMode ? 'text-white/80' : 'text-gray-700'
  
  const tabActive = 'text-emerald-500 border-b-2 border-emerald-500'
  const tabInactive = isDarkMode ? 'text-white/40 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'
  
  const borderColor = isDarkMode ? 'border-white/10' : 'border-gray-100'
  
  const hoverBg = isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'
  
  const cardBg = isDarkMode ? 'bg-white/5' : ''

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className={`${modalBg} rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative`}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full ${hoverBg} transition-all z-10`}
        >
          <svg className={`w-5 h-5 ${textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Error message */}
        {error && (
          <div className={`mx-6 mt-4 p-3 rounded-xl text-sm ${isDarkMode ? 'bg-red-500/20 border border-red-500/30 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
            {error}
          </div>
        )}

        {!user ? (
          <>
            {/* Login/Signup Tabs */}
            <div className={`flex border-b ${borderColor}`}>
              <button
                onClick={() => { setActiveTab('login'); setError(null); }}
                className={`flex-1 py-4 text-sm font-medium transition-all ${
                  activeTab === 'login' ? tabActive : tabInactive
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setActiveTab('signup'); setError(null); }}
                className={`flex-1 py-4 text-sm font-medium transition-all ${
                  activeTab === 'signup' ? tabActive : tabInactive
                }`}
              >
                Sign up
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${labelColor} mb-1`}>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@email.com"
                      required
                      className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:ring-2 outline-none transition-all`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${labelColor} mb-1`}>Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:ring-2 outline-none transition-all`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {loading && (
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    Sign in
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${labelColor} mb-1`}>First name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Mary"
                      required
                      className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:ring-2 outline-none transition-all`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${labelColor} mb-1`}>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@email.com"
                      required
                      className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:ring-2 outline-none transition-all`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${labelColor} mb-1`}>Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className={`w-full px-4 py-3 rounded-xl border ${inputBg} focus:ring-2 outline-none transition-all`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {loading && (
                      <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    Create account
                  </button>
                </form>
              )}
            </div>
          </>
        ) : showAllergiesEditor ? (
          /* ALLERGIES EDITOR */
          <div className="p-6">
            <button
              onClick={() => setShowAllergiesEditor(false)}
              className={`flex items-center gap-2 ${textSecondary} ${hoverBg} px-2 py-1 rounded-lg mb-4`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>My allergies</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {commonAllergies.map(allergy => (
                <button
                  key={allergy.id}
                  onClick={() => toggleAllergy(allergy.id)}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                    tempAllergies.includes(allergy.id)
                      ? 'border-emerald-500 bg-emerald-500/20'
                      : isDarkMode 
                        ? 'border-white/10 hover:border-emerald-500/50' 
                        : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-xl">{allergy.icon}</span>
                  <span className={`text-sm font-medium ${textPrimary}`}>{allergy.name}</span>
                </button>
              ))}
            </div>
            
            <button
              onClick={saveAllergies}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 rounded-xl transition-all"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        ) : (
          /* PROFILE VIEW */
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center mx-auto mb-3 text-white text-2xl font-bold shadow-lg shadow-emerald-500/30">
                {(profile?.name || user?.email)?.charAt(0).toUpperCase() || '?'}
              </div>
              <h2 className={`text-xl font-bold ${textPrimary}`}>
                {profile?.name || user?.user_metadata?.name || 'User'}
              </h2>
              <p className={`text-sm ${textSecondary}`}>{user?.email}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className={`rounded-xl p-4 text-center ${isDarkMode ? 'bg-amber-500/20' : 'bg-amber-50'}`}>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                  {profile?.allergies?.length || 0}
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-amber-400/70' : 'text-amber-700'}`}>Allergies</div>
              </div>
              <div className={`rounded-xl p-4 text-center ${isDarkMode ? 'bg-emerald-500/20' : 'bg-emerald-50'}`}>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {profile?.favorites?.length || 0}
                </div>
                <div className={`text-xs ${isDarkMode ? 'text-emerald-400/70' : 'text-emerald-700'}`}>Favorites</div>
              </div>
            </div>

            {/* Menu items */}
            <div className="space-y-2 mb-6">
              <button 
                onClick={openAllergiesEditor}
                className={`w-full flex items-center justify-between p-3 rounded-xl ${hoverBg} transition-all`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-amber-500/20' : 'bg-amber-100'}`}>
                    <span>⚠️</span>
                  </div>
                  <span className={`text-sm font-medium ${textPrimary}`}>My allergies</span>
                </div>
                <svg className={`w-5 h-5 ${textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button className={`w-full flex items-center justify-between p-3 rounded-xl ${hoverBg} transition-all`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-rose-500/20' : 'bg-rose-100'}`}>
                    <span>❤️</span>
                  </div>
                  <span className={`text-sm font-medium ${textPrimary}`}>Favorite restaurants</span>
                </div>
                <svg className={`w-5 h-5 ${textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <button
              onClick={handleLogout}
              className={`w-full py-3 text-sm rounded-xl transition-all ${isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:text-red-600 hover:bg-red-50'}`}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileModal
