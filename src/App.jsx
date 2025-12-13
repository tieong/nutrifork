import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AllergiesPage from './pages/AllergiesPage'
import MapPage from './pages/MapPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AllergiesPage />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </Router>
  )
}

export default App
