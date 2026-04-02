import { useState, useEffect, useRef } from 'react';
import { C, GR } from '../constants';
import { SectionCard } from '../components/SectionCard';
import { FieldGroup } from '../components/FieldGroup';
import { settingsService } from '../services/settingsService';
import { AvatarCropModal } from '../components/AvatarCropModal';

function getTokenData() {
  try {
    const token = localStorage.getItem('admin_token');
    if (!token) return {};
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { name: payload.name || '', email: payload.email || '', role: payload.role || '' };
  } catch { return {}; }
}

// Animated avatar wrapper with Three.js canvas bg + GSAP pulse ring
function AnimatedAvatar({ avatarUrl, initials, onClick }) {
  const canvasRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let af, renderer, scene, camera;
    try {
      const THREE = require('three');
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(96, 96);
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
      camera.position.z = 3.5;

      // Particles
      const geo = new THREE.BufferGeometry();
      const count = 120;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const r = 1.4 + Math.random() * 0.6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
        pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i*3+2] = r * Math.cos(phi);
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const mat = new THREE.PointsMaterial({ color: 0x9d7fff, size: 0.045, transparent: true, opacity: 0.7 });
      const points = new THREE.Points(geo, mat);
      scene.add(points);

      // Wireframe ring
      const ringGeo = new THREE.TorusGeometry(1.55, 0.012, 6, 80);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x7c2fff, transparent: true, opacity: 0.35, wireframe: true });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = 0.5;
      scene.add(ring);

      let t = 0;
      function animate() {
        af = requestAnimationFrame(animate);
        t += 0.012;
        points.rotation.y = t * 0.4;
        points.rotation.x = t * 0.15;
        ring.rotation.z = t * 0.3;
        ring.rotation.y = t * 0.2;
        renderer.render(scene, camera);
      }
      animate();
    } catch (e) { /* Three.js not available */ }

    // GSAP pulse ring
    let gsapInterval;
    try {
      const { gsap } = require('gsap');
      if (ringRef.current) {
        gsap.to(ringRef.current, { scale: 1.12, opacity: 0.5, duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      }
    } catch (e) {
      // CSS fallback
      gsapInterval = setInterval(() => {}, 9999);
    }

    return () => {
      cancelAnimationFrame(af);
      if (renderer) renderer.dispose();
      clearInterval(gsapInterval);
    };
  }, []);

  return (
    <div
      onClick={onClick}
      title="Click to change photo"
      style={{ position: 'relative', width: 96, height: 96, cursor: 'pointer', flexShrink: 0 }}
    >
      {/* Three.js canvas background */}
      <canvas ref={canvasRef} width={96} height={96} style={{ position: 'absolute', inset: 0, borderRadius: '50%', zIndex: 0 }} />

      {/* GSAP pulse ring */}
      <div ref={ringRef} style={{
        position: 'absolute', inset: -4,
        borderRadius: '50%',
        border: '2px solid rgba(124,47,255,.5)',
        zIndex: 1,
        pointerEvents: 'none',
        animation: 'avatarPulse 1.8s ease-in-out infinite',
      }} />

      {/* Avatar image or initials */}
      <div style={{
        position: 'absolute', inset: 0,
        borderRadius: '50%',
        background: 'linear-gradient(135deg,#7c2fff,#8b5cf6)',
        display: 'grid', placeItems: 'center',
        overflow: 'hidden', zIndex: 2,
        fontSize: '.9rem', fontWeight: 900, color: '#fff',
        border: '2px solid rgba(124,47,255,.6)',
        boxShadow: '0 0 18px rgba(124,47,255,.4)',
      }}>
        {avatarUrl
          ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : initials
        }
      </div>

      {/* Hover overlay */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'rgba(124,47,255,.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '.6rem', fontWeight: 800, color: '#fff', letterSpacing: '.08em',
        opacity: 0, transition: 'opacity .2s', zIndex: 3,
      }}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'}
        onMouseLeave={e => e.currentTarget.style.opacity = '0'}
      >CHANGE</div>

      <style>{`@keyframes avatarPulse { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.1);opacity:.9} }`}</style>
    </div>
  );
}

export function ProfileSection({ save }) {
  const tokenData = getTokenData();
  const [form, setForm] = useState({
    name:     tokenData.name  || '',
    email:    tokenData.email || '',
    phone:    '',
    bio:      '',
    role:     tokenData.role  || '',
    timezone: 'Asia/Kolkata',
    language: 'English (India)'
  });
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [cropOpen, setCropOpen] = useState(false);

  useEffect(() => {
    // Load saved avatar from localStorage
    const saved = localStorage.getItem('admin_avatar');
    if (saved) setAvatarUrl(saved);

    settingsService.getProfile()
      .then(data => {
        if (data.success && data.profile) {
          setForm(f => ({ ...f, ...data.profile }));
          if (data.profile.avatar) setAvatarUrl(data.profile.avatar);
        }
      })
      .catch(() => {});
  }, []);

  const uf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAvatarSave = async (blob) => {
    setCropOpen(false);
    // Convert blob to base64 for preview & localStorage
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setAvatarUrl(dataUrl);
      localStorage.setItem('admin_avatar', dataUrl);
    };
    reader.readAsDataURL(blob);

    // Upload to server
    try {
      const token = localStorage.getItem('admin_token');
      if (token) {
        const formData = new FormData();
        formData.append('thumbnail', blob, 'avatar.jpg');
        const res = await fetch('http://localhost:5000/api/upload/thumbnail', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          setAvatarUrl(data.url);
          localStorage.setItem('admin_avatar', data.url);
          save('Profile photo updated!');
        }
      }
    } catch { /* keep local preview */ }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = await settingsService.updateProfile(form);
      save(data.message || (data.success ? 'Profile updated!' : 'Error saving'));
    } catch {
      save('Could not reach server');
    } finally {
      setLoading(false);
    }
  };

  const initials = form.name ? form.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'AD';

  return (
    <>
      {cropOpen && (
        <AvatarCropModal
          onClose={() => setCropOpen(false)}
          onSave={handleAvatarSave}
        />
      )}

      <SectionCard
        id="profile"
        icon="👤"
        title="Profile Information"
        sub="Update your personal details and public profile"
        color={C.em}
        g={GR.em}
      >
        {/* Avatar + name row */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 24,
          paddingBottom: 20,
          borderBottom: `1px solid ${C.bord}`
        }}>
          {/* Animated Avatar */}
          <AnimatedAvatar
            avatarUrl={avatarUrl}
            initials={initials}
            onClick={() => setCropOpen(true)}
          />

          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: 'Clash Display,sans-serif',
              fontSize: '1.1rem',
              fontWeight: 700,
              marginBottom: 3
            }}>
              {form.name}
            </div>
            <div style={{ fontSize: '.8rem', color: C.t2, marginBottom: 10 }}>
              {form.email}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <div className="status-pill status-active">
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: C.em, animation: 'dotBlink 2s infinite'
                }} />
                Online
              </div>
              <div className="status-pill status-info">
                {form.role || 'Super Admin'}
              </div>
              <div className="status-pill" style={{
                background: 'rgba(167,139,250,.08)',
                border: '1px solid rgba(167,139,250,.2)',
                color: C.vt
              }}>
                v2.6
              </div>
            </div>
          </div>

          <button
            className="btn-sec"
            style={{ fontSize: '.78rem', padding: '7px 14px' }}
            onClick={() => setCropOpen(true)}
          >
            Change Photo
          </button>
        </div>

        {/* Fields */}
        <div className="field-row">
          <FieldGroup label="Full Name">
            <input
              className="field-input"
              value={form.name}
              onChange={e => uf('name', e.target.value)}
            />
          </FieldGroup>
          <FieldGroup label="Email Address">
            <input
              className="field-input"
              type="email"
              value={form.email}
              onChange={e => uf('email', e.target.value)}
            />
          </FieldGroup>
        </div>

        <div className="field-row">
          <FieldGroup label="Phone Number" hint="Used for SMS 2FA alerts">
            <input
              className="field-input"
              value={form.phone}
              onChange={e => uf('phone', e.target.value)}
            />
          </FieldGroup>
          <FieldGroup label="Role">
            <input className="field-input" value={form.role} disabled />
          </FieldGroup>
        </div>

        <FieldGroup label="Bio">
          <textarea
            className="field-input field-textarea"
            value={form.bio}
            onChange={e => uf('bio', e.target.value)}
          />
        </FieldGroup>

        <div className="field-row">
          <FieldGroup label="Timezone">
            <select
              className="field-input field-select"
              value={form.timezone}
              onChange={e => uf('timezone', e.target.value)}
            >
              {['Asia/Kolkata', 'Asia/Dubai', 'Europe/London', 'America/New_York', 'America/Los_Angeles'].map(t => (
                <option key={t} style={{ background: '#04090f' }}>{t}</option>
              ))}
            </select>
          </FieldGroup>
          <FieldGroup label="Language">
            <select
              className="field-input field-select"
              value={form.language}
              onChange={e => uf('language', e.target.value)}
            >
              {['English (India)', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Bengali'].map(l => (
                <option key={l} style={{ background: '#04090f' }}>{l}</option>
              ))}
            </select>
          </FieldGroup>
        </div>

        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <button className="btn-em" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button className="btn-sec">Discard</button>
        </div>
      </SectionCard>
    </>
  );
}
