import { useState, useEffect } from 'react';
import { C, GR } from '../constants';
import { SectionCard } from '../components/SectionCard';
import { FieldGroup } from '../components/FieldGroup';
import { settingsService } from '../services/settingsService';

// JWT token se user data nikalna (no backend needed)
function getTokenData() {
  try {
    const token = localStorage.getItem('admin_token');
    if (!token) return {};
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { name: payload.name || '', email: payload.email || '', role: payload.role || '' };
  } catch { return {}; }
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

  // Try to load from backend, merge on top of token data
  useEffect(() => {
    settingsService.getProfile()
      .then(data => {
        if (data.success && data.profile) {
          setForm(f => ({ ...f, ...data.profile }));
        }
      })
      .catch(() => {}); // backend offline - token data already shown
  }, []);

  const uf = (k, v) => setForm(f => ({ ...f, [k]: v }));

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

  return (
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
        <div className="avatar-upload">
          <div className="avatar-ring" />
          <div className="avatar-img">
            {form.name ? form.name.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="avatar-overlay">CHANGE</div>
        </div>
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
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: C.em,
                animation: 'dotBlink 2s infinite'
              }} />
              Online
            </div>
            <div className="status-pill status-info">Super Admin</div>
            <div className="status-pill" style={{
              background: 'rgba(167,139,250,.08)',
              border: '1px solid rgba(167,139,250,.2)',
              color: C.vt
            }}>
              v2.6
            </div>
          </div>
        </div>
        <button className="btn-sec" style={{ fontSize: '.78rem', padding: '7px 14px' }}>
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

      {/* Footer actions */}
      <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
        <button className="btn-em" onClick={handleSave} disabled={loading}>
          Save Changes
        </button>
        <button className="btn-sec">Discard</button>
      </div>
    </SectionCard>
  );
}
