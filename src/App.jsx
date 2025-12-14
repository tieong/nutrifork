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
  )
}

export default App
