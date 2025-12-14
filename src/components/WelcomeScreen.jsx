import { useEffect, useState } from 'react'

// ============================================
// WELCOME SCREEN - Animation de bienvenue
// Pour les utilisateurs connectés qui reviennent
// ============================================

function WelcomeScreen({ userName, onComplete }) {
  const [phase, setPhase] = useState(0) // 0: initial, 1: reveal, 2: exit

  useEffect(() => {
    // Phase 1: Reveal après 100ms
    const t1 = setTimeout(() => setPhase(1), 100)
    // Phase 2: Exit après 2s
    const t2 = setTimeout(() => setPhase(2), 2000)
    // Complete après 2.6s
    const t3 = setTimeout(() => onComplete(), 2600)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [onComplete])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');

        .welcome-screen {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0f0d;
          font-family: 'DM Sans', system-ui, sans-serif;
          overflow: hidden;
        }

        /* Background */
        .welcome-bg {
          position: absolute;
          inset: 0;
        }

        .welcome-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
        }

        .welcome-orb-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(34, 197, 94, 0.25) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: welcomeOrbPulse 2s ease-in-out infinite;
        }

        .welcome-orb-2 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(212, 165, 116, 0.15) 0%, transparent 70%);
          top: 20%;
          right: 20%;
          animation: welcomeOrbFloat 3s ease-in-out infinite;
        }

        @keyframes welcomeOrbPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        }

        @keyframes welcomeOrbFloat {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, 20px); }
        }

        /* Content */
        .welcome-content {
          position: relative;
          z-index: 10;
          text-align: center;
          opacity: 0;
          transform: translateY(30px) scale(0.9);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .welcome-content.reveal {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .welcome-content.exit {
          opacity: 0;
          transform: translateY(-40px) scale(1.1);
          transition: all 0.6s cubic-bezier(0.55, 0, 1, 0.45);
        }

        /* Logo */
        .welcome-logo {
          width: 100px;
          height: 100px;
          background: linear-gradient(145deg, #166534 0%, #14532d 100%);
          border-radius: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 32px;
          box-shadow: 
            0 30px 60px -20px rgba(34, 197, 94, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.1) inset;
          animation: welcomeLogoBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
        }

        @keyframes welcomeLogoBounce {
          0% { transform: scale(0) rotate(-20deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        .welcome-logo-icon {
          font-size: 50px;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
        }

        /* Text */
        .welcome-greeting {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 2.5rem;
          font-weight: 600;
          color: white;
          margin: 0 0 8px;
          opacity: 0;
          animation: welcomeTextReveal 0.6s ease-out 0.5s forwards;
        }

        .welcome-name {
          color: #4ade80;
        }

        .welcome-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
          opacity: 0;
          animation: welcomeTextReveal 0.6s ease-out 0.7s forwards;
        }

        @keyframes welcomeTextReveal {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Loading dots */
        .welcome-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 32px;
          opacity: 0;
          animation: welcomeTextReveal 0.6s ease-out 0.9s forwards;
        }

        .welcome-dot {
          width: 8px;
          height: 8px;
          background: rgba(34, 197, 94, 0.5);
          border-radius: 50%;
          animation: welcomeDotPulse 1s ease-in-out infinite;
        }

        .welcome-dot:nth-child(2) { animation-delay: 0.2s; }
        .welcome-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes welcomeDotPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 1; background: #22c55e; }
        }

        /* Screen exit */
        .welcome-screen.exit {
          opacity: 0;
          transition: opacity 0.4s ease-out;
        }
      `}</style>

      <div className={`welcome-screen ${phase === 2 ? 'exit' : ''}`}>
        {/* Background */}
        <div className="welcome-bg">
          <div className="welcome-orb welcome-orb-1"></div>
          <div className="welcome-orb welcome-orb-2"></div>
        </div>

        {/* Content */}
        <div className={`welcome-content ${phase >= 1 ? 'reveal' : ''} ${phase === 2 ? 'exit' : ''}`}>
          <div className="welcome-logo">
            <span className="welcome-logo-icon">🌱</span>
          </div>
          
          <h1 className="welcome-greeting">
            Bon retour, <span className="welcome-name">{userName}</span> !
          </h1>
          
          <p className="welcome-subtitle">
            Prêt à découvrir de nouvelles saveurs végétales ?
          </p>

          <div className="welcome-dots">
            <div className="welcome-dot"></div>
            <div className="welcome-dot"></div>
            <div className="welcome-dot"></div>
          </div>
        </div>
      </div>
    </>
  )
}

export default WelcomeScreen
