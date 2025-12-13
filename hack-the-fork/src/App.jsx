import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import AllergySelection from './components/AllergySelection';
import RestaurantMap from './components/RestaurantMap';
import './App.css';

function App() {
  const [selectedAllergies, setSelectedAllergies] = useState([]);

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <h1>🍴 Hack The Fork</h1>
          <p>Trouvez des restaurants adaptés à vos allergies</p>
        </header>
        <Routes>
          <Route
            path="/"
            element={
              <AllergySelection
                selectedAllergies={selectedAllergies}
                setSelectedAllergies={setSelectedAllergies}
              />
            }
          />
          <Route
            path="/map"
            element={
              <RestaurantMap
                selectedAllergies={selectedAllergies}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
