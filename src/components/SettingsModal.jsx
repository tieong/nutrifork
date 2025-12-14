import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ============================================
// SETTINGS MODAL - Édition des préférences
// ============================================

const commonAllergies = [
  { id: 'gluten', name: 'Gluten', icon: '🌾' },
  { id: 'lait', name: 'Lactose', icon: '🥛' },
  { id: 'fruits à coques', name: 'Fruits à coque', icon: '🥜' },
  { id: 'oeufs', name: 'Œufs', icon: '🥚' },
  { id: 'poisson', name: 'Poisson', icon: '🐟' },
  { id: 'crustacés', name: 'Crustacés', icon: '🦐' },
  { id: 'soja', name: 'Soja', icon: '🫘' },
  { id: 'sésame', name: 'Sésame', icon: '🌰' },
]

function SettingsModal({ isOpen, onClose, user, userAllergies, onAllergiesUpdate }) {
  const [selectedAllergies, setSelectedAllergies] = useState(userAllergies || [])
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('allergies')

  useEffect(() => {
    setSelectedAllergies(userAllergies || [])
  }, [userAllergies, isOpen])

  const toggleAllergy = (allergyId) => {
    setSelectedAllergies(prev =>
      prev.includes(allergyId)
        ? prev.filter(id => id !== allergyId)
        : [...prev, allergyId]
    )
  }

  const handleSave = async () => {
    setSaving(true)
    
    // Save to localStorage
    localStorage.setItem('userAllergies', JSON.stringify(selectedAllergies))
    
    // Save to Supabase if logged in
    if (user) {
      await supabase
        .from('profiles')
        .update({ allergies: selectedAllergies })
        .eq('id', user.id)
    }

    onAllergiesUpdate(selectedAllergies)
    setSaving(false)
    onClose()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('userAllergies')
    window.location.href = '/'
  }

  if (!isOpen) return null

  return (
    <>
      <style>{`
        .settings-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: settingsOverlayIn 0.3s ease-out;
        }

        @keyframes settingsOverlayIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .settings-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .settings-modal {
          position: relative;
          width: 100%;
          max-width: 440px;
          max-height: 85vh;
          background: linear-gradient(165deg, rgba(30, 35, 32, 0.98) 0%, rgba(20, 25, 22, 0.98) 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 28px;
          overflow: hidden;
          animation: settingsModalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
        }

        @keyframes settingsModalIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .settings-header {
          padding: 24px 24px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .settings-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .settings-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%);
          border: 1px solid rgba(34, 197, 94, 0.3);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }

        .settings-title h2 {
          color: white;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }

        .settings-title p {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.8rem;
          margin: 2px 0 0;
        }

        .settings-close {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .settings-close:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        /* Tabs */
        .settings-tabs {
          display: flex;
          gap: 8px;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .settings-tab {
          flex: 1;
          padding: 10px 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.5);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .settings-tab:hover {
          background: rgba(255, 255, 255, 0.06);
        }

        .settings-tab.active {
          background: rgba(34, 197, 94, 0.15);
          border-color: rgba(34, 197, 94, 0.3);
          color: #4ade80;
        }

        /* Content */
        .settings-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
        }

        .settings-section-title {
          color: rgba(255, 255, 255, 0.4);
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
        }

        /* Allergies Grid */
        .allergies-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .allergy-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .allergy-item:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .allergy-item.selected {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.4);
        }

        .allergy-icon {
          font-size: 1.5rem;
        }

        .allergy-name {
          flex: 1;
          color: rgba(255, 255, 255, 0.8);
          font-size: 13px;
          font-weight: 500;
        }

        .allergy-item.selected .allergy-name {
          color: white;
        }

        .allergy-check {
          width: 22px;
          height: 22px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .allergy-item.selected .allergy-check {
          background: #22c55e;
          border-color: #22c55e;
        }

        .allergy-check svg {
          width: 12px;
          height: 12px;
          color: white;
          opacity: 0;
          transform: scale(0.5);
          transition: all 0.2s ease;
        }

        .allergy-item.selected .allergy-check svg {
          opacity: 1;
          transform: scale(1);
        }

        /* Account Section */
        .account-section {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .account-info {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          margin-bottom: 16px;
        }

        .account-avatar {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .account-details h3 {
          color: white;
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 4px;
        }

        .account-details p {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.8rem;
          margin: 0;
        }

        .logout-btn {
          width: 100%;
          padding: 14px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          color: #f87171;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: rgba(239, 68, 68, 0.3);
        }

        /* Footer */
        .settings-footer {
          padding: 20px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          gap: 12px;
        }

        .settings-btn {
          flex: 1;
          padding: 14px 20px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .settings-btn-cancel {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
        }

        .settings-btn-cancel:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .settings-btn-save {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          border: none;
          color: white;
          box-shadow: 0 10px 30px -10px rgba(34, 197, 94, 0.5);
        }

        .settings-btn-save:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px -10px rgba(34, 197, 94, 0.6);
        }

        .settings-btn-save:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>

      <div className="settings-overlay">
        <div className="settings-backdrop" onClick={onClose}></div>
        
        <div className="settings-modal">
          {/* Header */}
          <div className="settings-header">
            <div className="settings-title">
              <div className="settings-icon">⚙️</div>
              <div>
                <h2>Préférences</h2>
                <p>Personnalisez votre expérience</p>
              </div>
            </div>
            <button className="settings-close" onClick={onClose}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="settings-tabs">
            <button 
              className={`settings-tab ${activeTab === 'allergies' ? 'active' : ''}`}
              onClick={() => setActiveTab('allergies')}
            >
              <span>⚠️</span>
              Allergies
            </button>
            <button 
              className={`settings-tab ${activeTab === 'account' ? 'active' : ''}`}
              onClick={() => setActiveTab('account')}
            >
              <span>👤</span>
              Compte
            </button>
          </div>

          {/* Content */}
          <div className="settings-content">
            {activeTab === 'allergies' && (
              <>
                <div className="settings-section-title">Sélectionnez vos allergies</div>
                <div className="allergies-grid">
                  {commonAllergies.map((allergy) => {
                    const isSelected = selectedAllergies.includes(allergy.id)
                    return (
                      <button
                        key={allergy.id}
                        className={`allergy-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleAllergy(allergy.id)}
                      >
                        <span className="allergy-icon">{allergy.icon}</span>
                        <span className="allergy-name">{allergy.name}</span>
                        <div className="allergy-check">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {activeTab === 'account' && (
              <>
                {user ? (
                  <>
                    <div className="settings-section-title">Votre compte</div>
                    <div className="account-info">
                      <div className="account-avatar">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="account-details">
                        <h3>{user.user_metadata?.name || user.email?.split('@')[0]}</h3>
                        <p>{user.email}</p>
                      </div>
                    </div>
                    
                    <button className="logout-btn" onClick={handleLogout}>
                      <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Se déconnecter
                    </button>
                  </>
                ) : (
                  <>
                    <div className="settings-section-title">Pas encore de compte</div>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '16px' }}>
                      Connectez-vous pour sauvegarder vos préférences et retrouver vos restaurants favoris.
                    </p>
                  </>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {activeTab === 'allergies' && (
            <div className="settings-footer">
              <button className="settings-btn settings-btn-cancel" onClick={onClose}>
                Annuler
              </button>
              <button 
                className="settings-btn settings-btn-save" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default SettingsModal
