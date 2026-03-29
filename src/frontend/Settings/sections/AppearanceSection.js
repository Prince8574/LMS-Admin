import { useState } from 'react';
import { C, GR, ACCENT_COLORS } from '../constants';
import { SectionCard } from '../components/SectionCard';
import { FieldGroup } from '../components/FieldGroup';
import { Toggle } from '../components/Toggle';

export function AppearanceSection({ save }) {
  const [theme, setTheme] = useState('dark');
  const [accent, setAccent] = useState('#00d97e');
  const [density, setDensity] = useState('comfortable');
  const [font, setFont] = useState('Outfit');
  const [animations, setAnimations] = useState(true);
  const [blur, setBlur] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <SectionCard
      id="appearance"
      icon="🎨"
      title="Appearance"
      sub="Personalise your dashboard look & feel"
      color={C.vt}
      g={GR.vt}
      delay={.05}
    >
      {/* Theme selector */}
      <div>
        <div className="field-label" style={{ marginBottom: 12 }}>Theme Mode</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { id: 'dark', ico: '🌙', label: 'Dark', desc: 'Deep space dark' },
            { id: 'light', ico: '☀️', label: 'Light', desc: 'Clean & bright' },
            { id: 'auto', ico: '⚡', label: 'Auto', desc: 'Follows system' }
          ].map(t => (
            <div
              key={t.id}
              onClick={() => setTheme(t.id)}
              style={{
                padding: '14px',
                borderRadius: 14,
                border: `1.5px solid ${theme === t.id ? C.em : 'rgba(255,255,255,.07)'}`,
                background: theme === t.id ? 'rgba(0,217,126,.07)' : 'rgba(255,255,255,.02)',
                cursor: 'pointer',
                transition: 'all .22s',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{t.ico}</div>
              <div style={{
                fontWeight: 700,
                fontSize: '.84rem',
                marginBottom: 2,
                color: theme === t.id ? C.em : C.text
              }}>
                {t.label}
              </div>
              <div style={{ fontSize: '.7rem', color: C.t2 }}>{t.desc}</div>
              {theme === t.id && (
                <div style={{
                  width: 20,
                  height: 2,
                  background: GR.em,
                  borderRadius: 1,
                  margin: '8px auto 0'
                }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Accent color */}
      <div>
        <div className="field-label" style={{ marginBottom: 10 }}>Accent Color</div>
        <div className="color-swatches">
          {ACCENT_COLORS.map(c => (
            <div
              key={c}
              className={`swatch${accent === c ? ' selected' : ''}`}
              onClick={() => setAccent(c)}
              style={{
                background: c,
                boxShadow: accent === c ? `0 0 0 2px #01080f,0 0 0 4px ${c},0 0 16px ${c}66` : 'none'
              }}
            />
          ))}
        </div>
      </div>

      {/* Density */}
      <div>
        <div className="field-label" style={{ marginBottom: 10 }}>Interface Density</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['compact', 'comfortable', 'spacious'].map(d => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              style={{
                padding: '8px 18px',
                borderRadius: 10,
                border: '1px solid',
                fontSize: '.78rem',
                cursor: 'pointer',
                transition: 'all .2s',
                fontWeight: density === d ? 700 : 500,
                background: density === d ? 'rgba(0,217,126,.1)' : 'transparent',
                borderColor: density === d ? C.em : 'rgba(255,255,255,.08)',
                color: density === d ? C.em : C.t2,
                textTransform: 'capitalize'
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Font */}
      <FieldGroup label="Interface Font">
        <select
          className="field-input field-select"
          value={font}
          onChange={e => setFont(e.target.value)}
        >
          {['Outfit', 'Clash Display', 'DM Mono', 'Cabinet Grotesk', 'Space Grotesk'].map(f => (
            <option key={f} style={{ background: '#04090f' }}>{f}</option>
          ))}
        </select>
      </FieldGroup>

      {/* Toggles */}
      <div style={{
        background: 'rgba(6,18,30,.97)',
        borderRadius: 14,
        border: `1px solid ${C.bord}`,
        padding: '4px 16px'
      }}>
        {[
          { k: 'animations', v: animations, sv: setAnimations, l: 'Enable Animations', d: 'Smooth transitions and micro-interactions' },
          { k: 'blur', v: blur, sv: setBlur, l: 'Blur / Glassmorphism', d: 'Backdrop blur effects on panels and modals' },
          { k: 'sidebar', v: sidebarCollapsed, sv: setSidebarCollapsed, l: 'Collapsed Sidebar', d: 'Show only icons in sidebar by default' }
        ].map(({ k, v, sv, l, d }) => (
          <div key={k} className="toggle-row">
            <div className="toggle-info">
              <div className="toggle-label">{l}</div>
              <div className="toggle-desc">{d}</div>
            </div>
            <Toggle checked={v} onChange={sv} />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-em" onClick={() => save('Appearance preferences saved!')}>
          Apply Changes
        </button>
        <button className="btn-sec">Reset to Default</button>
      </div>
    </SectionCard>
  );
}
