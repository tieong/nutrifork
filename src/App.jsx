import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import AllergiesPage from './pages/AllergiesPage'
import MapPage from './pages/MapPage'
import WelcomeScreen from './components/WelcomeScreen'

// ============================================
// APP - Routing & Auth Flow
// ============================================
// Flow:
// - Non connecté: AllergiesPage → MapPage (+ bouton signup)
// - Connecté: WelcomeScreen → MapPage direct (+ bouton settings)
// ============================================

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Timeout de sécurité - max 3 secondes de loading
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 3000)

    // Check current session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        
        // Get user name from profile (avec try/catch)
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', session.user.id)
            .single()
          
          const name = profile?.name || session.user.email?.split('@')[0] || 'friend'
          setUserName(name)
          
          // Show welcome screen for returning users
          setShowWelcome(true)
        } catch (err) {
          console.error('Error loading profile:', err)
          setUserName(session.user.email?.split('@')[0] || 'friend')
          setShowWelcome(true)
        }
      }
      clearTimeout(timeout)
      setLoading(false)
    }).catch(err => {
      console.error('Error getting session:', err)
      clearTimeout(timeout)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        // If user just signed in with OAuth, create/update profile
        if (event === 'SIGNED_IN' && session?.user) {
          try {
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
          } catch (err) {
            console.error('Error with profile:', err)
          }
        }
      }
    )

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  // Handle welcome screen completion
  const handleWelcomeComplete = () => {
    setShowWelcome(false)
  }

  // Loading state
  if (loading) {
    return (
      <div className="loading-screen">
        <style>{`
          .loading-screen {
            min-height: 100vh;
            background: #0a0f0d;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading-spinner {
            width: 48px;
            height: 48px;
            border: 3px solid rgba(34, 197, 94, 0.2);
            border-top-color: #22c55e;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="loading-spinner"></div>
      </div>
    )
  }

  // Welcome screen for returning users
  if (showWelcome && user) {
    return <WelcomeScreen userName={userName} onComplete={handleWelcomeComplete} />
  }

  return (
    <Router>
      <Routes>
        {/* Home route */}
        <Route 
          path="/" 
          element={
            user 
              ? <Navigate to="/map" replace /> 
              : <AllergiesPage user={user} setUser={setUser} />
          } 
        />
        
        {/* Map route */}
        <Route 
          path="/map" 
          element={<MapPage user={user} setUser={setUser} />} 
        />
      </Routes>
    </Router>
  )
}

export default App
