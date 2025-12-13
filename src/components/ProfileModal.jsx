import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

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

function ProfileModal({ isOpen, onClose, user, setUser }) {
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
      // Sync allergies to localStorage for the app
      if (data.allergies) {
        localStorage.setItem('userAllergies', JSON.stringify(data.allergies))
      }
    }
  }

  // Login with email/password
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

  // Sign up with email/password
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
      // Create profile in database
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

  // Login with Google
  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  // Login with GitHub
  const handleGitHubLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) setError(error.message)
    setLoading(false)
  }

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  // Allergies management
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

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-all z-10"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {!user ? (
          <>
            {/* Login/Signup Tabs */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => { setActiveTab('login'); setError(null); }}
                className={`flex-1 py-4 text-sm font-medium transition-all ${
                  activeTab === 'login' 
                    ? 'text-emerald-600 border-b-2 border-emerald-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setActiveTab('signup'); setError(null); }}
                className={`flex-1 py-4 text-sm font-medium transition-all ${
                  activeTab === 'signup' 
                    ? 'text-emerald-600 border-b-2 border-emerald-600' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Sign up
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'login' ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@email.com"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
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
                  
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-gray-400">or continue with</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="text-sm text-gray-600">Google</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={handleGitHubLogin}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                      <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z"/>
                      </svg>
                      <span className="text-sm text-gray-600">GitHub</span>
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Mary"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@email.com"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
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

                  <p className="text-xs text-center text-gray-400">
                    By creating an account, you agree to our{' '}
                    <a href="#" className="text-emerald-600 hover:underline">terms of use</a>
                  </p>
                </form>
              )}
            </div>
          </>
        ) : showAllergiesEditor ? (
          /* ALLERGIES EDITOR */
          <div className="p-6">
            <button
              onClick={() => setShowAllergiesEditor(false)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <h3 className="text-lg font-bold text-gray-800 mb-4">My allergies</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {commonAllergies.map(allergy => (
                <button
                  key={allergy.id}
                  onClick={() => toggleAllergy(allergy.id)}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                    tempAllergies.includes(allergy.id)
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-xl">{allergy.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{allergy.name}</span>
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
              <h2 className="text-xl font-bold text-gray-800">
                {profile?.name || user?.user_metadata?.name || 'User'}
              </h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-600">{profile?.allergies?.length || 0}</div>
                <div className="text-xs text-amber-700">Allergies</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">{profile?.favorites?.length || 0}</div>
                <div className="text-xs text-emerald-700">Favorites</div>
              </div>
            </div>

            {/* Menu items */}
            <div className="space-y-2 mb-6">
              <button 
                onClick={openAllergiesEditor}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <span>⚠️</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">My allergies</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                    <span>❤️</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Favorite restaurants</span>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-3 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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
