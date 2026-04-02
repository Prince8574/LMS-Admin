import { useEffect, useRef } from 'react';

/**
 * Small animated avatar (32-40px) with Three.js particle ring + GSAP pulse
 * Used in Sidebar, CoursesPage header, AdminLanding header
 */
export function AnimatedAvatarSmall({ avatarUrl, initials = 'AD', size = 34, borderRadius = '50%' }) {
  const canvasRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let af, renderer;

    try {
      const THREE = require('three');
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(size, size);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
      camera.position.z = 3.2;

      // Particles orbit
      const geo = new THREE.BufferGeometry();
      const count = 60;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const r = 1.5 + Math.random() * 0.4;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
        pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i*3+2] = r * Math.cos(phi);
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({ color: 0xa78bfa, size: 0.06, transparent: true, opacity: 0.8 });
      const points = new THREE.Points(geo, mat);
      scene.add(points);

      let t = 0;
      function animate() {
        af = requestAnimationFrame(animate);
        t += 0.015;
        points.rotation.y = t * 0.5;
        points.rotation.x = t * 0.2;
        renderer.render(scene, camera);
      }
      animate();
    } catch (_) {}

    // GSAP pulse on ring
    try {
      const { gsap } = require('gsap');
      if (ringRef.current) {
        gsap.to(ringRef.current, {
          scale: 1.15, opacity: 0.9, duration: 1.4,
          repeat: -1, yoyo: true, ease: 'sine.inOut'
        });
      }
    } catch (_) {}

    return () => { cancelAnimationFrame(af); if (renderer) renderer.dispose(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Three.js bg */}
      <canvas ref={canvasRef} width={size} height={size}
        style={{ position: 'absolute', inset: 0, borderRadius, zIndex: 0, pointerEvents: 'none' }} />

      {/* Pulse ring */}
      <div ref={ringRef} style={{
        position: 'absolute', inset: -2, borderRadius,
        border: '1.5px solid rgba(124,47,255,.6)',
        zIndex: 1, pointerEvents: 'none',
        transformOrigin: 'center',
      }} />

      {/* Avatar */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius,
        background: 'linear-gradient(135deg,#7c2fff,#8b5cf6)',
        display: 'grid', placeItems: 'center',
        overflow: 'hidden', zIndex: 2,
        fontSize: size * 0.28 + 'px', fontWeight: 900, color: '#fff',
        border: '1.5px solid rgba(124,47,255,.5)',
        boxShadow: '0 0 12px rgba(124,47,255,.35)',
      }}>
        {avatarUrl
          ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : initials
        }
      </div>
    </div>
  );
}
