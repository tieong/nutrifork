import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ProfileModal from '../components/ProfileModal'

// ============================================
// NUTRIFORK - ALLERGIES PAGE
// Design: Premium with synced theme toggle
// ============================================

const commonAllergies = [
  { id: 'gluten', name: 'Gluten', icon: '🌾' },
  { id: 'lait', name: 'Dairy', icon: '🥛' },
  { id: 'fruits à coques', name: 'Tree Nuts', icon: '🥜' },
  { id: 'oeufs', name: 'Eggs', icon: '🥚' },
  { id: 'poisson', name: 'Fish', icon: '🐟' },
  { id: 'crustacés', name: 'Shellfish', icon: '🦐' },
  { id: 'soja', name: 'Soy', icon: '🫘' },
  { id: 'sésame', name: 'Sesame', icon: '🌰' },
]

function AllergiesPage({ user, setUser }) {
  const [selectedAllergies, setSelectedAllergies] = useState([])
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profile, setProfile] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('nutrifork-theme')
    return saved ? saved === 'dark' : false // Light by default
  })
  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
  }, [])

  // Sync theme with localStorage
  const handleToggleTheme = () => {
    setIsDarkMode(prev => {
      const newValue = !prev
      localStorage.setItem('nutrifork-theme', newValue ? 'dark' : 'light')
      return newValue
    })
  }

  useEffect(() => {
    const loadData = async () => {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (data) {
          setProfile(data)
          if (data.allergies?.length > 0) {
            setSelectedAllergies(data.allergies)
            localStorage.setItem('userAllergies', JSON.stringify(data.allergies))
          }
        }
      } else {
        const savedAllergies = localStorage.getItem('userAllergies')
        if (savedAllergies) {
          setSelectedAllergies(JSON.parse(savedAllergies))
        }
        setProfile(null)
      }
    }
    loadData()
  }, [user, showProfileModal])

  const toggleAllergy = (allergyId) => {
    setSelectedAllergies(prev =>
      prev.includes(allergyId)
        ? prev.filter(id => id !== allergyId)
        : [...prev, allergyId]
    )
  }

  const handleContinue = async () => {
    localStorage.setItem('userAllergies', JSON.stringify(selectedAllergies))
    
    if (user) {
      await supabase
        .from('profiles')
        .update({ allergies: selectedAllergies })
        .eq('id', user.id)
    }
    
    navigate('/map')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        
        .allergies-root {
          --font-display: 'Playfair Display', Georgia, serif;
          --font-body: 'DM Sans', system-ui, sans-serif;
        }

        .allergies-root.dark {
          --color-bg: #0a0f0d;
          --color-bg-alt: #0d1510;
          --color-surface: rgba(255, 255, 255, 0.03);
          --color-surface-hover: rgba(255, 255, 255, 0.06);
          --color-border: rgba(255, 255, 255, 0.08);
          --color-text: #ffffff;
          --color-text-secondary: rgba(255, 255, 255, 0.6);
          --color-text-muted: rgba(255, 255, 255, 0.4);
          --color-primary: #22c55e;
          --color-primary-glow: rgba(34, 197, 94, 0.4);
          --orb-opacity: 1;
        }

        .allergies-root.light {
          --color-bg: #f0fdf4;
          --color-bg-alt: #dcfce7;
          --color-surface: rgba(255, 255, 255, 0.8);
          --color-surface-hover: rgba(255, 255, 255, 0.95);
          --color-border: rgba(0, 0, 0, 0.08);
          --color-text: #1a2e1a;
          --color-text-secondary: rgba(0, 0, 0, 0.6);
          --color-text-muted: rgba(0, 0, 0, 0.4);
          --color-primary: #16a34a;
          --color-primary-glow: rgba(34, 197, 94, 0.25);
          --orb-opacity: 0.5;
        }

        .allergies-root * {
          box-sizing: border-box;
        }

        .allergies-page {
          min-height: 100vh;
          min-height: 100dvh;
          background: var(--color-bg);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          font-family: var(--font-body);
          transition: background 0.4s ease;
        }

        /* ===== ANIMATED BACKGROUND ===== */
        .bg-layer {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          transition: opacity 0.4s ease;
        }

        .bg-gradient {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(34, 197, 94, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 60% 60% at 80% 20%, rgba(74, 222, 128, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 50% 80% at 50% 90%, rgba(34, 197, 94, 0.08) 0%, transparent 50%);
          opacity: var(--orb-opacity);
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          animation: orbFloat 25s ease-in-out infinite;
          opacity: var(--orb-opacity);
        }

        .orb-1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, transparent 70%);
          top: -10%;
          left: -5%;
        }

        .orb-2 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(74, 222, 128, 0.15) 0%, transparent 70%);
          bottom: 10%;
          right: -5%;
          animation-delay: -10s;
        }

        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 40px) scale(0.95); }
        }

        /* ===== MAIN CARD ===== */
        .main-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 540px;
          background: var(--color-surface);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 1px solid var(--color-border);
          border-radius: 32px;
          padding: 48px 40px;
          box-shadow: 0 25px 80px -20px rgba(0, 0, 0, 0.15);
          opacity: 0;
          transform: translateY(40px) scale(0.96);
          transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1), background 0.4s ease, border-color 0.4s ease;
        }

        .main-card.mounted {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* ===== TOP BAR ===== */
        .top-bar {
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Theme Toggle */
        .theme-toggle {
          width: 44px;
          height: 44px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          color: var(--color-text-secondary);
        }

        .theme-toggle:hover {
          background: var(--color-surface-hover);
          transform: scale(1.05);
        }

        /* Profile Button */
        .profile-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 16px 8px 8px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .profile-btn:hover {
          background: var(--color-surface-hover);
          transform: translateY(-2px);
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--color-primary) 0%, #059669 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 13px;
          box-shadow: 0 4px 12px var(--color-primary-glow);
        }

        .avatar.guest {
          background: var(--color-surface-hover);
          box-shadow: none;
        }

        .avatar.guest svg {
          color: var(--color-text-muted);
        }

        .profile-label {
          color: var(--color-text-secondary);
          font-size: 13px;
          font-weight: 500;
        }

        /* ===== HEADER ===== */
        .header {
          text-align: center;
          margin-bottom: 36px;
          padding-top: 40px;
        }

        .logo-wrap {
          display: inline-flex;
          position: relative;
          margin-bottom: 20px;
        }

        .logo {
          width: 80px;
          height: 80px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 50px -15px var(--color-primary-glow);
        }

        .logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .title {
          font-family: var(--font-display);
          font-size: 2.5rem;
          font-weight: 600;
          margin: 0 0 10px;
          letter-spacing: -0.02em;
          color: var(--color-text);
          transition: color 0.4s ease;
        }

        .subtitle {
          color: var(--color-text-muted);
          font-size: 1rem;
          line-height: 1.5;
          margin: 0;
          font-weight: 400;
          transition: color 0.4s ease;
        }

        /* ===== SECTION DIVIDER ===== */
        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: var(--color-border);
          transition: background 0.4s ease;
        }

        .divider-text {
          color: var(--color-text-muted);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: color 0.4s ease;
        }

        /* ===== ALLERGIES GRID ===== */
        .grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 32px;
        }

        @media (max-width: 520px) {
          .grid { grid-template-columns: repeat(2, 1fr); }
          .main-card { padding: 32px 24px; }
          .title { font-size: 2rem; }
        }

        /* ===== ALLERGY CARD ===== */
        .card {
          position: relative;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 18px;
          padding: 18px 12px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: center;
          opacity: 0;
          transform: translateY(20px);
          animation: cardReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .card:nth-child(1) { animation-delay: 0.05s; }
        .card:nth-child(2) { animation-delay: 0.1s; }
        .card:nth-child(3) { animation-delay: 0.15s; }
        .card:nth-child(4) { animation-delay: 0.2s; }
        .card:nth-child(5) { animation-delay: 0.25s; }
        .card:nth-child(6) { animation-delay: 0.3s; }
        .card:nth-child(7) { animation-delay: 0.35s; }
        .card:nth-child(8) { animation-delay: 0.4s; }

        @keyframes cardReveal {
          to { opacity: 1; transform: translateY(0); }
        }

        .card:hover {
          border-color: var(--color-primary);
          transform: translateY(-3px);
          box-shadow: 0 10px 30px -10px var(--color-primary-glow);
        }

        .card.selected {
          border-color: var(--color-primary);
          background: rgba(34, 197, 94, 0.1);
          box-shadow: 0 10px 30px -10px var(--color-primary-glow);
        }

        .card-icon {
          font-size: 1.8rem;
          display: block;
          margin-bottom: 6px;
          transition: transform 0.3s ease;
        }

        .card:hover .card-icon,
        .card.selected .card-icon {
          transform: scale(1.1);
        }

        .card-name {
          color: var(--color-text-secondary);
          font-size: 11px;
          font-weight: 500;
          display: block;
          transition: color 0.3s ease;
        }

        .card.selected .card-name {
          color: var(--color-text);
        }

        .check {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 20px;
          height: 20px;
          background: var(--color-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: scale(0.5);
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 4px 12px var(--color-primary-glow);
        }

        .card.selected .check {
          opacity: 1;
          transform: scale(1);
        }

        .check svg {
          width: 10px;
          height: 10px;
          color: white;
          stroke-width: 3;
        }

        /* ===== CTA SECTION ===== */
        .cta-section {
          text-align: center;
        }

        .cta-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, var(--color-primary) 0%, #16a34a 100%);
          color: white;
          font-size: 16px;
          font-weight: 600;
          padding: 18px 36px;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 15px 40px -15px var(--color-primary-glow);
        }

        .cta-btn:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 25px 50px -15px var(--color-primary-glow);
        }

        .cta-btn:active {
          transform: translateY(-1px) scale(0.98);
        }

        .cta-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }

        .cta-btn:hover::before {
          left: 100%;
        }

        .cta-arrow {
          display: flex;
          transition: transform 0.3s ease;
        }

        .cta-btn:hover .cta-arrow {
          transform: translateX(4px);
        }

        .footer-note {
          margin-top: 24px;
          color: var(--color-text-muted);
          font-size: 13px;
          transition: color 0.4s ease;
        }
      `}</style>

      <div className={`allergies-root ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="allergies-page">
          {/* Background */}
          <div className="bg-layer">
            <div className="bg-gradient"></div>
            <div className="orb orb-1"></div>
            <div className="orb orb-2"></div>
          </div>

          {/* Main Card */}
          <div className={`main-card ${mounted ? 'mounted' : ''}`}>
            
            {/* Top Bar */}
            <div className="top-bar">
              {/* Theme Toggle */}
              <button onClick={handleToggleTheme} className="theme-toggle" title={isDarkMode ? 'Light mode' : 'Dark mode'}>
                {isDarkMode ? (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* Profile Button */}
              <button onClick={() => setShowProfileModal(true)} className="profile-btn">
                {user ? (
                  <>
                    <div className="avatar">
                      {(profile?.name || user?.email)?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="profile-label">{profile?.name || 'Profile'}</span>
                  </>
                ) : (
                  <>
                    <div className="avatar guest">
                      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <span className="profile-label">Login</span>
                  </>
                )}
              </button>
            </div>

            {/* Header */}
            <header className="header">
              <div className="logo-wrap">
                <div className="logo">
                  <img src="/mascott.webp" alt="NutriFork" />
                </div>
              </div>
              <h1 className="title">NutriFork</h1>
              <p className="subtitle">
                Find veggie dishes adapted to your allergies
              </p>
            </header>

            {/* Divider */}
            <div className="divider">
              <span className="divider-line"></span>
              <span className="divider-text">Select your allergies</span>
              <span className="divider-line"></span>
            </div>

            {/* Allergies Grid */}
            <div className="grid">
              {commonAllergies.map((allergy) => {
                const isSelected = selectedAllergies.includes(allergy.id)
                return (
                  <button
                    key={allergy.id}
                    onClick={() => toggleAllergy(allergy.id)}
                    className={`card ${isSelected ? 'selected' : ''}`}
                  >
                    <span className="card-icon">{allergy.icon}</span>
                    <span className="card-name">{allergy.name}</span>
                    <div className="check">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* CTA Section */}
            <div className="cta-section">
              <button onClick={handleContinue} className="cta-btn">
                <span>Find restaurants</span>
                <span className="cta-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          {/* Profile Modal */}
          <ProfileModal 
            isOpen={showProfileModal} 
            onClose={() => setShowProfileModal(false)}
            user={user}
            setUser={setUser}
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </>
  )
}

export default AllergiesPage
