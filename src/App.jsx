import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import MapPage from './pages/MapPage'
import SplashScreen from './components/SplashScreen'

// ============================================
// APP - Simplifié pour la démo
// ============================================
// Flow: Arrivée directe sur la map
// Allergies gérées via le bouton settings (localStorage)
// ============================================

function App() {
  const [showSplash, setShowSplash] = useState(true)

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Routes>
          {/* Route principale - Map directe */}
          <Route
            path="/"
            element={<MapPage />}
          />
        </Routes>
      </Router>
    </>
  )
}

export default App
