import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MapPage from './pages/MapPage'

// ============================================
// APP - Simplifié pour la démo
// ============================================
// Flow: Arrivée directe sur la map
// Allergies gérées via le bouton settings (localStorage)
// ============================================

function App() {
  return (
    <Router>
      <Routes>
        {/* Route principale - Map directe */}
        <Route
          path="/"
          element={<MapPage />}
        />
      </Routes>
    </Router>
  )
}

export default App
