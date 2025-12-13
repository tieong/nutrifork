import './RestaurantDetail.css';

function RestaurantDetail({ restaurant, onClose }) {
  return (
    <div className="restaurant-detail-overlay" onClick={onClose}>
      <div className="restaurant-detail" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <h2>{restaurant.name}</h2>
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="detail-content">
          <p className="address">📍 {restaurant.address}</p>

          <div className="dishes-section">
            <h3>🥗 Plats végétariens disponibles</h3>
            <p className="dishes-subtitle">
              Sans vos allergènes sélectionnés
            </p>

            {restaurant.availableDishes.length > 0 ? (
              <div className="dishes-list">
                {restaurant.availableDishes.map((dish) => (
                  <div key={dish.id} className="dish-card">
                    <div className="dish-info">
                      <span className="dish-name">{dish.name}</span>
                      <span className="vegetarian-badge">🌱 Végétarien</span>
                    </div>
                    {dish.allergens.length === 0 && (
                      <span className="allergen-free-badge">
                        ✓ Sans allergènes
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-dishes">
                Aucun plat végétarien disponible sans vos allergènes.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantDetail;
