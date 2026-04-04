import { useRef, useEffect } from 'react';

/**
 * Animated avatar with CSS-only particle ring + GSAP pulse
 * No Three.js (avoids WebGL context limit errors)
 */
export function AnimatedAvatarSmall({ avatarUrl, initials = 'AD', size = 34, borderRadius = '50%' }) {
  const ringRef = useRef(null);

  useEffect(() => {
    // GSAP pulse if available
    try {
      const { gsap } = require('gsap');
      if (ringRef.current) {
        gsap.to(ringRef.current, {
          scale: 1.2, opacity: 0.9, duration: 1.4,
          repeat: -1, yoyo: true, ease: 'sine.inOut'
        });
      }
    } catch (_) {}
  }, []);

  // Generate small dot particles via CSS
  const dots = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * 360;
    const r = size * 0.72;
    const x = Math.cos((angle * Math.PI) / 180) * r;
    const y = Math.sin((angle * Math.PI) / 180) * r;
    return { x, y, delay: i * 0.18 };
  });

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Orbiting dots */}
      {dots.map((d, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: size * 0.1,
          height: size * 0.1,
          borderRadius: '50%',
          background: 'rgba(167,139,250,0.7)',
          top: '50%',
          left: '50%',
          transform: `translate(calc(-50% + ${d.x}px), calc(-50% + ${d.y}px))`,
          animation: `avatarDotPulse 2s ease-in-out ${d.delay}s infinite`,
          zIndex: 0,
        }} />
      ))}

      {/* Pulse ring */}
      <div ref={ringRef} style={{
        position: 'absolute', inset: -2, borderRadius,
        border: '1.5px solid rgba(124,47,255,.65)',
        zIndex: 1, pointerEvents: 'none',
        transformOrigin: 'center',
        animation: 'avatarRingPulse 1.8s ease-in-out infinite',
      }} />

      {/* Avatar */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius,
        background: 'linear-gradient(135deg,#7c2fff,#8b5cf6)',
        display: 'grid', placeItems: 'center',
        overflow: 'hidden', zIndex: 2,
        fontSize: size * 0.28 + 'px', fontWeight: 900, color: '#fff',
        border: '1.5px solid rgba(124,47,255,.5)',
        boxShadow: '0 0 14px rgba(124,47,255,.4)',
      }}>
        {avatarUrl
          ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : initials
        }
      </div>

      <style>{`
        @keyframes avatarRingPulse {
          0%,100% { transform: scale(1); opacity: 0.45; }
          50% { transform: scale(1.2); opacity: 0.9; }
        }
        @keyframes avatarDotPulse {
          0%,100% { opacity: 0.2; transform: translate(calc(-50% + var(--dx,0px)), calc(-50% + var(--dy,0px))) scale(0.7); }
          50% { opacity: 0.8; transform: translate(calc(-50% + var(--dx,0px)), calc(-50% + var(--dy,0px))) scale(1.2); }
        }
      `}</style>
    </div>
  );
}
