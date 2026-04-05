import { useState, useEffect, useRef } from 'react';
import { C, GR } from '../constants';
import { SectionCard } from '../components/SectionCard';
import { FieldGroup } from '../components/FieldGroup';
import { settingsService } from '../services/settingsService';
import { AvatarCropModal } from '../components/AvatarCropModal';

function getRoleDisplay(role) {
  switch (role) {
    case 'super_admin': return { label: 'Super Admin', icon: '👑', color: '#7c2fff', bg: 'rgba(124,47,255,.1)', border: 'rgba(124,47,255,.25)' };
    case 'instructor':  return { label: 'Instructor',  icon: '👨‍🏫', color: '#0dd9c4', bg: 'rgba(13,217,196,.1)',  border: 'rgba(13,217,196,.25)' };
    default:            return { label: 'Admin',       icon: '⬡',   color: '#6979f8', bg: 'rgba(105,121,248,.1)', border: 'rgba(105,121,248,.25)' };
  }
}

function getTokenData() {
  try {
    const token = localStorage.getItem('admin_token');
    if (!token) return {};
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { name: payload.name || '', email: payload.email || '', role: payload.role || '' };
  } catch { return {}; }
}

// Animated avatar wrapper with CSS particle ring + GSAP pulse
function AnimatedAvatar({ avatarUrl, initials, onClick }) {
  const ringRef = useRef(null);
  const ring2Ref = useRef(null);

  useEffect(() => {
    try {
      const { gsap } = require('gsap');
      if (ringRef.current) {
        gsap.to(ringRef.current, { scale: 1.15, opacity: 0.9, duration: 1.4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      }
      if (ring2Ref.current) {
        gsap.to(ring2Ref.current, { scale: 1.28, opacity: 0, duration: 2, repeat: -1, ease: 'power2.out', delay: 0.5 });
      }
    } catch (_) {}
  }, []);

  const SIZE = 96;
  const dots = Array.from({ length: 10 }, (_, i) => {
    const angle = (i / 10) * 360;
    const r = SIZE * 0.62;
    const x = Math.cos((angle * Math.PI) / 180) * r;
    const y = Math.sin((angle * Math.PI) / 180) * r;
    return { x, y, delay: i * 0.15 };
  });

  return (
    <div
      onClick={onClick}
      title="Click to change photo"
      style={{ position: 'relative', width: SIZE, height: SIZE, cursor: 'pointer', flexShrink: 0 }}
    >
      {/* Orbiting dots */}
      {dots.map((d, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: 5, height: 5,
          borderRadius: '50%',
          background: 'rgba(167,139,250,0.75)',
          top: '50%', left: '50%',
          transform: `translate(calc(-50% + ${d.x}px), calc(-50% + ${d.y}px))`,
          animation: `avatarDot 2.2s ease-in-out ${d.delay}s infinite`,
          zIndex: 0,
        }} />
      ))}

      {/* Outer ripple ring */}
      <div ref={ring2Ref} style={{
        position: 'absolute', inset: -6, borderRadius: '50%',
        border: '1px solid rgba(124,47,255,.4)',
        zIndex: 1, pointerEvents: 'none',
        transformOrigin: 'center',
        animation: 'avatarRipple 2s ease-out infinite',
      }} />

      {/* Pulse ring */}
      <div ref={ringRef} style={{
        position: 'absolute', inset: -3, borderRadius: '50%',
        border: '2px solid rgba(124,47,255,.65)',
        zIndex: 1, pointerEvents: 'none',
        transformOrigin: 'center',
        animation: 'avatarPulse 1.8s ease-in-out infinite',
      }} />

      {/* Avatar */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: 'linear-gradient(135deg,#7c2fff,#8b5cf6)',
        display: 'grid', placeItems: 'center',
        overflow: 'hidden', zIndex: 2,
        fontSize: '.9rem', fontWeight: 900, color: '#fff',
        border: '2px solid rgba(124,47,255,.6)',
        boxShadow: '0 0 20px rgba(124,47,255,.45)',
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

      <style>{`
        @keyframes avatarPulse { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.1);opacity:1} }
        @keyframes avatarRipple { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.4);opacity:0} }
        @keyframes avatarDot { 0%,100%{opacity:.2;transform:translate(calc(-50% + var(--x,0px)),calc(-50% + var(--y,0px))) scale(.7)} 50%{opacity:.85;transform:translate(calc(-50% + var(--x,0px)),calc(-50% + var(--y,0px))) scale(1.3)} }
      `}</style>
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
        const res = await fetch('http://localhost:5000/api/upload/thumbnail?type=avatar', {
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
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="status-pill status-active">
                <div style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: C.em, animation: 'dotBlink 2s infinite'
                }} />
                Online
              </div>
              {/* Role badge with proper label */}
              {(() => {
                const rd = getRoleDisplay(form.role);
                return (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px', borderRadius: 99,
                    background: rd.bg, border: `1px solid ${rd.border}`,
                    fontFamily: 'DM Mono,monospace', fontSize: '.65rem',
                    fontWeight: 700, color: rd.color,
                  }}>
                    <span>{rd.icon}</span>
                    <span>{rd.label}</span>
                  </div>
                );
              })()}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10 }}>
              {(() => {
                const rd = getRoleDisplay(form.role);
                return (
                  <>
                    <span style={{ fontSize: '1rem' }}>{rd.icon}</span>
                    <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '.78rem', fontWeight: 700, color: rd.color }}>{rd.label}</span>
                  </>
                );
              })()}
            </div>
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
