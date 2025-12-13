import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { supabase } from './lib/supabase'
import AllergiesPage from './pages/AllergiesPage'
import MapPage from './pages/MapPage'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        // If user just signed in with OAuth, create/update profile
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single()
          
          if (!existingProfile) {
            // Create new profile for OAuth users
            await supabase.from('profiles').insert({
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0],
              email: session.user.email,
              allergies: JSON.parse(localStorage.getItem('userAllergies') || '[]'),
              favorites: []
            })
          }
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AllergiesPage user={user} setUser={setUser} />} />
        <Route path="/map" element={<MapPage user={user} setUser={setUser} />} />
      </Routes>
    </Router>
  )
}

export default App
