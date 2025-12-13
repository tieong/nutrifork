import { useNavigate } from 'react-router-dom';
import './AllergySelection.css';

const ALLERGIES = [
  { id: 'gluten', label: 'Gluten', icon: '🌾' },
  { id: 'dairy', label: 'Produits laitiers', icon: '🥛' },
  { id: 'eggs', label: 'Œufs', icon: '🥚' },
  { id: 'nuts', label: 'Fruits à coque', icon: '🥜' },
  { id: 'peanuts', label: 'Arachides', icon: '🥜' },
  { id: 'shellfish', label: 'Fruits de mer', icon: '🦐' },
  { id: 'fish', label: 'Poisson', icon: '🐟' },
  { id: 'soy', label: 'Soja', icon: '🫘' },
  { id: 'sesame', label: 'Sésame', icon: '🌱' },
  { id: 'mustard', label: 'Moutarde', icon: '🌭' },
  { id: 'celery', label: 'Céleri', icon: '🥬' },
  { id: 'sulfites', label: 'Sulfites', icon: '🍷' },
];

function AllergySelection({ selectedAllergies, setSelectedAllergies }) {
  const navigate = useNavigate();

  const toggleAllergy = (allergyId) => {
    setSelectedAllergies((prev) =>
      prev.includes(allergyId)
        ? prev.filter((id) => id !== allergyId)
        : [...prev, allergyId]
    );
  };

  const handleContinue = () => {
    navigate('/map');
  };

  return (
    <div className="allergy-selection">
      <div className="selection-container">
        <h2>Sélectionnez vos allergies</h2>
        <p className="subtitle">
          Nous vous aiderons à trouver des restaurants avec des options adaptées
        </p>

        <div className="allergy-grid">
          {ALLERGIES.map((allergy) => (
            <button
              key={allergy.id}
              className={`allergy-card ${
                selectedAllergies.includes(allergy.id) ? 'selected' : ''
              }`}
              onClick={() => toggleAllergy(allergy.id)}
            >
              <span className="allergy-icon">{allergy.icon}</span>
              <span className="allergy-label">{allergy.label}</span>
              {selectedAllergies.includes(allergy.id) && (
                <span className="check-mark">✓</span>
              )}
            </button>
          ))}
        </div>

        <div className="action-buttons">
          <button
            className="continue-button"
            onClick={handleContinue}
            disabled={selectedAllergies.length === 0}
          >
            Voir les restaurants
            <span className="arrow">→</span>
          </button>
          {selectedAllergies.length === 0 && (
            <p className="hint">Sélectionnez au moins une allergie pour continuer</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllergySelection;
