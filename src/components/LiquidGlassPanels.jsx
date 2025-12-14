import { useState, useEffect } from 'react'

// ============================================
// LIQUID GLASS PANEL - ALLERGIES (Bottom Left)
// ============================================
export function AllergiesPanel({ allergies, onAllergiesUpdate, isDarkMode }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [tempAllergies, setTempAllergies] = useState([...allergies])

  const handleToggle = () => {
    setIsAnimating(true)
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
      setIsEditing(false)
      setTempAllergies([...allergies])
    }
    setTimeout(() => setIsAnimating(false), 500)
  }

  const handleStartEdit = () => {
    setIsEditing(true)
    setTempAllergies([...allergies])
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setTempAllergies([...allergies])
  }

  const handleSaveEdit = () => {
    onAllergiesUpdate(tempAllergies)
    localStorage.setItem('userAllergies', JSON.stringify(tempAllergies))
    setIsEditing(false)
  }

  const toggleAllergy = (allergyKey) => {
    setTempAllergies(prev => {
      if (prev.includes(allergyKey)) {
        return prev.filter(a => a !== allergyKey)
      } else {
        return [...prev, allergyKey]
      }
    })
  }

  const allergenIcons = {
    gluten: '🌾',
    lait: '🥛',
    oeufs: '🥚',
    poisson: '🐟',
    crustacés: '🦐',
    arachides: '🥜',
    soja: '🫘',
    fruits_a_coques: '🌰',
    céleri: '🥬',
    moutarde: '🟡',
    sésame: '⚪',
    sulfites: '🍷',
    lupin: '🌸',
    mollusques: '🦪'
  }

  const allergenNames = {
    gluten: 'Gluten',
    lait: 'Lait',
    oeufs: 'Œufs',
    poisson: 'Poisson',
    crustacés: 'Crustacés',
    arachides: 'Arachides',
    soja: 'Soja',
    fruits_a_coques: 'Fruits à coques',
    céleri: 'Céleri',
    moutarde: 'Moutarde',
    sésame: 'Sésame',
    sulfites: 'Sulfites',
    lupin: 'Lupin',
    mollusques: 'Mollusques'
  }

  // Toutes les allergies disponibles
  const allAllergens = Object.keys(allergenNames)

  return (
    <div 
      className={`
        liquid-glass-panel allergies-panel
        ${isExpanded ? 'expanded' : 'collapsed'}
        ${isAnimating ? 'animating' : ''}
        ${isDarkMode ? 'dark' : 'light'}
      `}
      onClick={!isExpanded ? handleToggle : undefined}
    >
      {/* Animated background effects */}
      <div className="liquid-glass-bg">
        <div className="liquid-blob blob-1"></div>
        <div className="liquid-blob blob-2"></div>
        <div className="liquid-shimmer"></div>
      </div>

      {/* Content */}
      <div className="liquid-glass-content">
        {!isExpanded ? (
          // Collapsed state - just icon and count
          <div className="collapsed-content">
            <div className="panel-icon allergies-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="panel-count">{allergies.length}</span>
            <span className="panel-label">allergies</span>
            <div className="expand-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        ) : (
          // Expanded state - full details
          <div className="expanded-content">
            <div className="panel-header">
              <div className="header-title">
                <div className="panel-icon allergies-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <span>{isEditing ? 'Modifier' : 'Mes Allergies'}</span>
              </div>
              <button className="close-btn" onClick={handleToggle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>

            {!isEditing ? (
              // Mode visualisation
              <>
                <div className="allergies-list">
                  {allergies.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-icon">✨</span>
                      <span>Aucune allergie configurée</span>
                    </div>
                  ) : (
                    allergies.map((allergy, index) => (
                      <div
                        key={allergy}
                        className="allergy-tag"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <span className="allergy-icon">{allergenIcons[allergy] || '⚠️'}</span>
                        <span className="allergy-name">{allergenNames[allergy] || allergy}</span>
                      </div>
                    ))
                  )}
                </div>

                <button className="edit-btn" onClick={handleStartEdit}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Modifier</span>
                </button>
              </>
            ) : (
              // Mode édition
              <>
                <div className="allergies-edit-grid">
                  {allAllergens.map((allergyKey, index) => {
                    const isSelected = tempAllergies.includes(allergyKey)
                    return (
                      <button
                        key={allergyKey}
                        onClick={() => toggleAllergy(allergyKey)}
                        className={`allergy-checkbox ${isSelected ? 'selected' : ''}`}
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <span className="allergy-icon">{allergenIcons[allergyKey]}</span>
                        <span className="allergy-name">{allergenNames[allergyKey]}</span>
                        {isSelected && (
                          <svg className="check-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="edit-actions">
                  <button className="cancel-btn" onClick={handleCancelEdit}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Annuler</span>
                  </button>
                  <button className="save-btn" onClick={handleSaveEdit}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Enregistrer</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// LIQUID GLASS PANEL - RANKING (Bottom Right)
// ============================================
export function RankingPanel({ restaurants, onSelectRestaurant, isDarkMode }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleToggle = () => {
    setIsAnimating(true)
    setIsExpanded(!isExpanded)
    setTimeout(() => setIsAnimating(false), 500)
  }

  // Sort restaurants by veggie score
  const sortedRestaurants = [...restaurants]
    .sort((a, b) => (b.veggieScore || 0) - (a.veggieScore || 0))
    .slice(0, 5)

  const topScore = sortedRestaurants[0]?.veggieScore || 0

  return (
    <div 
      className={`
        liquid-glass-panel ranking-panel
        ${isExpanded ? 'expanded' : 'collapsed'}
        ${isAnimating ? 'animating' : ''}
        ${isDarkMode ? 'dark' : 'light'}
      `}
      onClick={!isExpanded ? handleToggle : undefined}
    >
      {/* Animated background effects */}
      <div className="liquid-glass-bg">
        <div className="liquid-blob blob-1"></div>
        <div className="liquid-blob blob-2"></div>
        <div className="liquid-shimmer"></div>
      </div>

      {/* Content */}
      <div className="liquid-glass-content">
        {!isExpanded ? (
          // Collapsed state
          <div className="collapsed-content">
            <div className="panel-icon ranking-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="panel-count">{topScore}%</span>
            <span className="panel-label">top score</span>
            <div className="expand-hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        ) : (
          // Expanded state
          <div className="expanded-content">
            <div className="panel-header">
              <div className="header-title">
                <div className="panel-icon ranking-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span>Top Veggie</span>
              </div>
              <button className="close-btn" onClick={handleToggle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>

            <div className="ranking-list">
              {sortedRestaurants.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">🔍</span>
                  <span>Aucun restaurant trouvé</span>
                </div>
              ) : (
                sortedRestaurants.map((restaurant, index) => (
                  <div 
                    key={restaurant.id || index} 
                    className="ranking-item"
                    style={{ animationDelay: `${index * 60}ms` }}
                    onClick={() => {
                      onSelectRestaurant(restaurant)
                      handleToggle()
                    }}
                  >
                    <div className="rank-badge" data-rank={index + 1}>
                      {index === 0 && <span className="medal">🥇</span>}
                      {index === 1 && <span className="medal">🥈</span>}
                      {index === 2 && <span className="medal">🥉</span>}
                      {index > 2 && <span className="rank-num">{index + 1}</span>}
                    </div>
                    <div className="restaurant-info">
                      <span className="restaurant-name">{restaurant.name}</span>
                      <span className="restaurant-type">
                        {restaurant.isVeggie && <span className="veggie-badge">🌱</span>}
                        {restaurant.types?.[0] || 'Restaurant'}
                      </span>
                    </div>
                    <div className="score-badge">
                      <div 
                        className="score-fill" 
                        style={{ width: `${restaurant.veggieScore || 0}%` }}
                      ></div>
                      <span className="score-text">{restaurant.veggieScore || 0}%</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default { AllergiesPanel, RankingPanel }
