import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import louvIcon from '../assets/louvy_icon_3.png'

const SplashScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true)
  const logoRef = useRef(null)
  const glowRef = useRef(null)
  const containerRef = useRef(null)
  const particlesRef = useRef([])

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      // Skip animation, show briefly then exit
      const timeout = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, 500)
      return () => clearTimeout(timeout)
    }

    // Dynamic Netflix-style animation sequence with energy
    const tl = gsap.timeline({
      onComplete: () => {
        setIsVisible(false)
        onComplete?.()
      }
    })

    // Phase 1: Dynamic Appear (500ms) - avec rotation et bounce
    tl.fromTo(
      logoRef.current,
      {
        opacity: 0,
        scale: 0.3,
        rotation: -180,
        filter: 'blur(20px)'
      },
      {
        opacity: 1,
        scale: 1,
        rotation: 0,
        filter: 'blur(0px)',
        duration: 0.5,
        ease: 'back.out(1.7)'
      }
    )

    // Add dynamic glow pulse
    tl.fromTo(
      glowRef.current,
      {
        opacity: 0,
        scale: 0.5
      },
      {
        opacity: 0.8,
        scale: 1.5,
        duration: 0.5,
        ease: 'power2.out'
      },
      '<'
    )

    // Animate particles expanding
    particlesRef.current.forEach((particle, i) => {
      tl.fromTo(
        particle,
        {
          opacity: 0,
          scale: 0,
          x: 0,
          y: 0
        },
        {
          opacity: 1,
          scale: 1,
          x: Math.cos((i / 8) * Math.PI * 2) * 150,
          y: Math.sin((i / 8) * Math.PI * 2) * 150,
          duration: 0.6,
          ease: 'power2.out'
        },
        '<0.2'
      )
    })

    // Phase 2: Hold with subtle pulse (700ms)
    tl.to(
      logoRef.current,
      {
        scale: 1.1,
        duration: 0.35,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: 1
      }
    )

    tl.to(
      glowRef.current,
      {
        scale: 1.7,
        opacity: 1,
        duration: 0.35,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: 1
      },
      '<'
    )

    // Phase 3: Dynamic Exit (600ms) - rotation et dispersion
    tl.to(
      logoRef.current,
      {
        opacity: 0,
        scale: 1.3,
        rotation: 180,
        filter: 'blur(10px)',
        duration: 0.6,
        ease: 'power3.in'
      }
    )

    tl.to(
      glowRef.current,
      {
        opacity: 0,
        scale: 2.5,
        duration: 0.6,
        ease: 'power2.in'
      },
      '<'
    )

    // Particles fade and disperse
    particlesRef.current.forEach((particle, i) => {
      tl.to(
        particle,
        {
          opacity: 0,
          scale: 0,
          x: Math.cos((i / 8) * Math.PI * 2) * 250,
          y: Math.sin((i / 8) * Math.PI * 2) * 250,
          duration: 0.6,
          ease: 'power2.in'
        },
        '<'
      )
    })

    // Fade out container
    tl.to(
      containerRef.current,
      {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.inOut'
      },
      '-=0.2'
    )

    return () => {
      tl.kill()
    }
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'linear-gradient(135deg, #ff7f00 0%, #ff9933 50%, #ff7f00 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Animated gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at center, rgba(249, 182, 13, 0.3) 0%, transparent 70%)',
          pointerEvents: 'none',
          animation: 'pulse 2s ease-in-out infinite'
        }}
      />

      {/* Particles - 8 dots around the logo */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          ref={el => particlesRef.current[i] = el}
          style={{
            position: 'absolute',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.8)',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.6)',
            pointerEvents: 'none'
          }}
        />
      ))}

      {/* Dynamic glow effect behind logo */}
      <div
        ref={glowRef}
        style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249, 182, 13, 0.6) 0%, rgba(255, 127, 0, 0.3) 40%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }}
      />

      {/* Logo with dynamic styling */}
      <div
        ref={logoRef}
        style={{
          position: 'relative',
          width: '200px',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img
          src={louvIcon}
          alt="Louv"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 40px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 80px rgba(249, 182, 13, 0.6))'
          }}
        />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

export default SplashScreen
