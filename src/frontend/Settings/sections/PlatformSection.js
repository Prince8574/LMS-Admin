import { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';

const C = {
  bg: "#050814", b1: "#080d1e", b2: "#0c1228",
  em: "#7c2fff", em2: "#b47eff",
  am: "#f02079", am2: "#fa7db8",
  ro: "#ff6b9d", ro2: "#ffacc7",
  cy: "#8b5cf6", cy2: "#c4b5fd",
  vt: "#e8187c", vt2: "#ff85c0",
  text: "#ede8ff", t2: "#6b5b8e", t3: "#1a1540",
  bord: "rgba(255,255,255,0.07)",
};

const GR = {
  em: "linear-gradient(135deg,#7c2fff,#8b5cf6)",
};

const Toggle = ({ checked, onChange }) => (
  <label className="toggle">
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
    <div className="toggle-slider" />
  </label>
);

const FieldGroup = ({ label, hint, children }) => (
  <div className="field-group">
    <div className="field-label">{label}</div>
    {children}
    {hint && <div className="field-hint">{hint}</div>}
  </div>
);

const SectionCard = ({ id, icon, title, sub, color, g, children, delay = 0 }) => (
  <div className="section-card" style={{ animationDelay: `${delay}s` }}>
    <div className="section-card-head">
      <div className="section-icon" style={{ background: `${color}14`, border: `1px solid ${color}22` }}>{icon}</div>
      <div>
        <div className="section-title">{title}</div>
        <div className="section-sub">{sub}</div>
      </div>
      <div style={{ marginLeft: 'auto', height: 2, width: 40, background: g, borderRadius: 99, opacity: .6 }} />
    </div>
    <div className="section-body">{children}</div>
  </div>
);

export function PlatformSection({ save }) {
  const [cfg, setCfg] = useState({
    platformName: 'LearnVerse', tagline: 'Learn Without Limits',
    supportEmail: 'support@learnverse.io', maxFileSize: '500MB',
    videoQuality: '1080p', maintenanceMode: false,
    publicRegistration: true, emailVerification: true,
    autoApprove: false, reviewDays: 3, platformFee: 20, minPayout: 500
  });

  useEffect(() => {
    settingsService.getPlatformConfig().then(data => {
      if (data.success && data.config && Object.keys(data.config).length > 0)
        setCfg(c => ({ ...c, ...data.config }));
    });
  }, []);

  const uc = (k, v) => setCfg(c => ({ ...c, [k]: v }));

  const handleSave = async () => {
    const data = await settingsService.updatePlatformConfig(cfg);
    save(data.message || 'Saved');
  };

  return (
    <SectionCard id="platform" icon="⚙" title="Platform Configuration" sub="Global settings that affect your entire platform" color={C.em} g={GR.em} delay={.18}>
      {/* General */}
      <div>
        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.64rem', letterSpacing: '.1em', color: C.t3, textTransform: 'uppercase', marginBottom: 14 }}>General</div>
        <div className="field-row">
          <FieldGroup label="Platform Name">
            <input className="field-input" value={cfg.platformName} onChange={e => uc('platformName', e.target.value)} />
          </FieldGroup>
          <FieldGroup label="Tagline">
            <input className="field-input" value={cfg.tagline} onChange={e => uc('tagline', e.target.value)} />
          </FieldGroup>
        </div>
        <FieldGroup label="Support Email">
          <input className="field-input" type="email" value={cfg.supportEmail} onChange={e => uc('supportEmail', e.target.value)} />
        </FieldGroup>
      </div>

      <div className="divider" />

      {/* Content limits */}
      <div>
        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.64rem', letterSpacing: '.1em', color: C.t3, textTransform: 'uppercase', marginBottom: 14 }}>Content Limits</div>
        <div className="field-row">
          <FieldGroup label="Max Upload File Size">
            <select className="field-input field-select" value={cfg.maxFileSize} onChange={e => uc('maxFileSize', e.target.value)}>
              {['100MB', '250MB', '500MB', '1GB', '2GB'].map(s =>
                <option key={s} style={{ background: '#04090f' }}>{s}</option>
              )}
            </select>
          </FieldGroup>
          <FieldGroup label="Default Video Quality">
            <select className="field-input field-select" value={cfg.videoQuality} onChange={e => uc('videoQuality', e.target.value)}>
              {['720p', '1080p', '1440p', '4K'].map(q =>
                <option key={q} style={{ background: '#04090f' }}>{q}</option>
              )}
            </select>
          </FieldGroup>
        </div>
      </div>

      <div className="divider" />

      {/* Registration settings */}
      <div>
        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.64rem', letterSpacing: '.1em', color: C.t3, textTransform: 'uppercase', marginBottom: 14 }}>Registration & Access</div>
        <div style={{ background: 'rgba(8,11,26,.97)', borderRadius: 14, border: `1px solid ${C.bord}`, padding: '4px 16px', marginBottom: 16 }}>
          {[
            { k: 'publicRegistration', l: 'Public Registration', d: 'Allow anyone to create a student account' },
            { k: 'emailVerification', l: 'Email Verification Required', d: 'Users must verify email before accessing courses' },
            { k: 'autoApprove', l: 'Auto-Approve Instructors', d: 'New instructor applications approved automatically' },
            { k: 'maintenanceMode', l: 'Maintenance Mode', d: 'Block all access except Super Admin — use with caution' }
          ].map(({ k, l, d }) => (
            <div key={k} className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-label" style={{ color: k === 'maintenanceMode' && cfg[k] ? C.ro : undefined }}>{l}</div>
                <div className="toggle-desc">{d}</div>
              </div>
              <Toggle checked={cfg[k]} onChange={v => uc(k, v)} />
            </div>
          ))}
        </div>

        <div className="field-row">
          <FieldGroup label="Course Review Days" hint="Days before auto-reject if not reviewed">
            <input className="field-input" type="number" value={cfg.reviewDays} onChange={e => uc('reviewDays', e.target.value)} />
          </FieldGroup>
          <FieldGroup label="Platform Fee (%)" hint="Percentage kept from instructor revenue">
            <div style={{ position: 'relative' }}>
              <input className="field-input" type="number" value={cfg.platformFee} onChange={e => uc('platformFee', e.target.value)} style={{ paddingRight: 36 }} />
              <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: C.t2, fontSize: '.85rem' }}>%</span>
            </div>
          </FieldGroup>
        </div>

        <FieldGroup label="Minimum Instructor Payout (₹)" hint="Minimum balance before payout is triggered">
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: C.t2, fontSize: '.85rem' }}>₹</span>
            <input className="field-input" type="number" value={cfg.minPayout} onChange={e => uc('minPayout', e.target.value)} style={{ paddingLeft: 30 }} />
          </div>
        </FieldGroup>
      </div>

      {/* Danger zone */}
      <div style={{ padding: 18, borderRadius: 16, background: 'rgba(255,107,157,.04)', border: '1px solid rgba(255,107,157,.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ color: C.ro }}>⚠️</span>
          <div style={{ fontWeight: 700, color: C.ro }}>Danger Zone</div>
        </div>
        <div style={{ fontSize: '.8rem', color: C.t2, marginBottom: 16 }}>These actions are irreversible. Proceed with extreme caution.</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn-danger" onClick={() => save('Cache cleared successfully!')}>Clear Cache</button>
          <button className="btn-danger" onClick={() => save('Rebuild triggered!')}>Rebuild Index</button>
          <button className="btn-danger" style={{ borderColor: 'rgba(255,107,157,.4)', background: 'rgba(255,107,157,.12)' }}>Reset to Defaults</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-em" onClick={handleSave}>Save Configuration</button>
        <button className="btn-sec">Export Config</button>
      </div>
    </SectionCard>
  );
}
