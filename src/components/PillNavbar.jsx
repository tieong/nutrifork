import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import carroteGood from '../assets/carrote-good.svg'

const PillNavbar = ({
  isDarkMode,
  onToggleTheme,
  onSettings,
  onSearch,
  allergiesCount,
  className = ''
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const circleRefs = useRef([])
  const tlRefs = useRef([])
  const activeTweenRefs = useRef([])
  const logoImgRef = useRef(null)
  const hamburgerRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const navItemsRef = useRef(null)
  const logoRef = useRef(null)

  const ease = 'power3.easeOut'
  const baseColor = isDarkMode ? '#2a2a2a' : '#ffffff'
  const pillColor = isDarkMode ? '#ffffff' : '#ff7f00'
  const hoveredPillTextColor = isDarkMode ? '#2a2a2a' : '#ffffff'
  const pillTextColor = isDarkMode ? '#2a2a2a' : '#ffffff'

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach(circle => {
        if (!circle?.parentElement) return

        const pill = circle.parentElement
        const rect = pill.getBoundingClientRect()
        const { width: w, height: h } = rect
        const R = ((w * w) / 4 + h * h) / (2 * h)
        const D = Math.ceil(2 * R) + 2
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1
        const originY = D - delta

        circle.style.width = `${D}px`
        circle.style.height = `${D}px`
        circle.style.bottom = `-${delta}px`

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        })

        const label = pill.querySelector('.pill-label')
        const white = pill.querySelector('.pill-label-hover')

        if (label) gsap.set(label, { y: 0 })
        if (white) gsap.set(white, { y: h + 12, opacity: 0 })

        const index = circleRefs.current.indexOf(circle)
        if (index === -1) return

        tlRefs.current[index]?.kill()
        const tl = gsap.timeline({ paused: true })

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0)

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0)
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 })
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0)
        }

        tlRefs.current[index] = tl
      })
    }

    layout()

    const onResize = () => layout()
    window.addEventListener('resize', onResize)

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {})
    }

    const menu = mobileMenuRef.current
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1 })
    }

    // Initial load animation
    const logo = logoRef.current
    const navItems = navItemsRef.current

    if (logo) {
      gsap.set(logo, { scale: 0 })
      gsap.to(logo, {
        scale: 1,
        duration: 0.6,
        ease
      })
    }

    if (navItems) {
      gsap.set(navItems, { width: 0, overflow: 'hidden' })
      gsap.to(navItems, {
        width: 'auto',
        duration: 0.6,
        ease
      })
    }

    return () => window.removeEventListener('resize', onResize)
  }, [isDarkMode])

  const handleEnter = i => {
    const tl = tlRefs.current[i]
    if (!tl) return
    activeTweenRefs.current[i]?.kill()
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto'
    })
  }

  const handleLeave = i => {
    const tl = tlRefs.current[i]
    if (!tl) return
    activeTweenRefs.current[i]?.kill()
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto'
    })
  }

  const handleLogoClick = () => {
    const img = logoImgRef.current
    if (!img) return
    gsap.set(img, { rotate: 0 })
    gsap.to(img, {
      rotate: 360,
      duration: 0.5,
      ease,
      overwrite: 'auto'
    })
  }

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen
    setIsMobileMenuOpen(newState)

    const hamburger = hamburgerRef.current
    const menu = mobileMenuRef.current

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line')
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease })
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease })
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease })
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease })
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' })
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease,
            transformOrigin: 'top center'
          }
        )
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: 'top center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' })
          }
        })
      }
    }
  }

  const cssVars = {
    '--base': baseColor,
    '--pill-bg': pillColor,
    '--hover-text': hoveredPillTextColor,
    '--pill-text': pillTextColor
  }

  const buttons = [
    {
      label: '🔍',
      onClick: onSearch,
      ariaLabel: 'Search address'
    },
    {
      label: isDarkMode ? '☀️' : '🌙',
      onClick: onToggleTheme,
      ariaLabel: isDarkMode ? 'Light mode' : 'Dark mode'
    },
    {
      label: '🍽️',
      onClick: onSettings,
      ariaLabel: 'Allergies & Preferences',
      badge: allergiesCount > 0 ? allergiesCount : null
    }
  ]

  return (
    <div className="pill-nav-container">
      <nav className={`pill-nav ${className}`} aria-label="Primary" style={cssVars}>
        <button
          className="pill-logo"
          onClick={handleLogoClick}
          aria-label="NutriFork"
          ref={logoRef}
        >
          <img src={carroteGood} alt="NutriFork" ref={logoImgRef} />
        </button>

        <div className="pill-nav-items desktop-only" ref={navItemsRef}>
          <div className="pill-brand">
            <span className="brand-name">Nutrifork</span>
          </div>
          
          <ul className="pill-list" role="menubar">
            {buttons.map((button, i) => (
              <li key={i} role="none">
                <button
                  role="menuitem"
                  className="pill"
                  aria-label={button.ariaLabel}
                  onClick={button.onClick}
                  onMouseEnter={() => handleEnter(i)}
                  onMouseLeave={() => handleLeave(i)}
                >
                  <span
                    className="hover-circle"
                    aria-hidden="true"
                    ref={el => {
                      circleRefs.current[i] = el
                    }}
                  />
                  <span className="label-stack">
                    <span className="pill-label">{button.label}</span>
                    <span className="pill-label-hover" aria-hidden="true">
                      {button.label}
                    </span>
                  </span>
                  {button.badge && (
                    <span className="pill-badge">{button.badge}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button
          className="mobile-menu-button mobile-only"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          ref={hamburgerRef}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      <div className="mobile-menu-popover mobile-only" ref={mobileMenuRef} style={cssVars}>
        <ul className="mobile-menu-list">
          <li>
            <button
              className="mobile-menu-link"
              onClick={() => {
                onSearch()
                setIsMobileMenuOpen(false)
              }}
            >
              🔍 Search address
            </button>
          </li>
          <li>
            <button
              className="mobile-menu-link"
              onClick={() => {
                onToggleTheme()
                setIsMobileMenuOpen(false)
              }}
            >
              {isDarkMode ? '☀️ Light mode' : '🌙 Dark mode'}
            </button>
          </li>
          <li>
            <button
              className="mobile-menu-link"
              onClick={() => {
                onSettings()
                setIsMobileMenuOpen(false)
              }}
            >
              ⚙️ Settings
              {allergiesCount > 0 && (
                <span className="mobile-badge">{allergiesCount}</span>
              )}
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default PillNavbar
