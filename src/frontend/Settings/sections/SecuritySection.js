import { useState } from 'react';
import { C, GR, SESSIONS } from '../constants';
import { SectionCard } from '../components/SectionCard';
import { FieldGroup } from '../components/FieldGroup';
import { Toggle } from '../components/Toggle';
import { settingsService } from '../services/settingsService';

export function SecuritySection({ save }) {
  const [tfa, setTfa] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('8h');
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [pwds, setPwds] = useState({ current: '', newPwd: '', confirm: '' });
  const up = (k, v) => setPwds(p => ({ ...p, [k]: v }));

  const handleChangePassword = async () => {
    if (!pwds.current || !pwds.newPwd) return save('Please fill all password fields');
    if (pwds.newPwd !== pwds.confirm)  return save('New passwords do not match');
    const data = await settingsService.changePassword(pwds.current, pwds.newPwd);
    save(data.message || 'Done');
    if (data.success) setPwds({ current: '', newPwd: '', confirm: '' });
  };

  return (
    <SectionCard
      id="security"
      icon="🔐"
      title="Security & Authentication"
      sub="Protect your admin account with strong security"
      color={C.ro}
      g={GR.ro}
      delay={.08}
    >
      {/* Security score */}
      <div style={{
        padding: 18,
        borderRadius: 16,
        background: 'linear-gradient(135deg,rgba(0,217,126,.06),rgba(34,211,238,.04))',
        border: '1px solid rgba(0,217,126,.14)',
        display: 'flex',
        alignItems: 'center',
        gap: 20
      }}>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{
            fontFamily: 'Clash Display,sans-serif',
            fontSize: '2.2rem',
            fontWeight: 700,
            color: C.em,
            lineHeight: 1
          }}>
            92
          </div>
          <div style={{
            fontFamily: 'DM Mono,monospace',
            fontSize: '.6rem',
            color: C.t2,
            marginTop: 2
          }}>
            SECURITY SCORE
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Strong Security</div>
          <div style={{ fontSize: '.8rem', color: C.t2, marginBottom: 10 }}>
            Your account is well protected. Enable IP Whitelist to reach 100.
          </div>
          <div className="prog-bar">
            <div className="prog-fill" style={{ width: '92%', background: GR.em }} />
          </div>
        </div>
      </div>

      {/* Change password */}
      <div>
        <div style={{
          fontFamily: 'DM Mono,monospace',
          fontSize: '.64rem',
          letterSpacing: '.1em',
          color: C.t3,
          textTransform: 'uppercase',
          marginBottom: 14
        }}>
          Change Password
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Current Password',     key: 'current' },
            { label: 'New Password',          key: 'newPwd'  },
            { label: 'Confirm New Password',  key: 'confirm' },
          ].map(({ label, key }, i) => (
            <FieldGroup key={label} label={label}>
              <div style={{ position: 'relative' }}>
                <input
                  className="field-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={pwds[key]}
                  onChange={e => up(key, e.target.value)}
                  style={{ paddingRight: 44 }}
                />
                {i === 0 && (
                  <button
                    onClick={() => setShowPass(s => !s)}
                    style={{
                      position: 'absolute', right: 12, top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', color: C.t2, cursor: 'pointer', fontSize: '.85rem'
                    }}
                  >
                    {showPass ? '🙈' : '👁'}
                  </button>
                )}
              </div>
            </FieldGroup>
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-em" onClick={handleChangePassword}>
              Update Password
            </button>
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* 2FA */}
      <div>
        <div style={{
          fontFamily: 'DM Mono,monospace',
          fontSize: '.64rem',
          letterSpacing: '.1em',
          color: C.t3,
          textTransform: 'uppercase',
          marginBottom: 14
        }}>
          Two-Factor Authentication
        </div>
        {[
          { icon: '📱', label: 'Authenticator App', desc: 'Google Authenticator, Authy — most secure', enabled: tfa, onToggle: setTfa, col: C.em },
          { icon: '💬', label: 'SMS Authentication', desc: 'One-time code via SMS to your phone', enabled: true, onToggle: () => {}, col: C.cy },
          { icon: '🔑', label: 'Hardware Key (WebAuthn)', desc: 'YubiKey or passkey support', enabled: false, onToggle: () => {}, col: C.vt },
        ].map(({ icon, label, desc, enabled, onToggle, col }) => (
          <div key={label} className="security-item">
            <div
              className="security-icon"
              style={{
                background: `${col}14`,
                border: `1px solid ${col}22`
              }}
            >
              {icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '.86rem', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: '.74rem', color: C.t2 }}>{desc}</div>
            </div>
            <div
              className={`status-pill ${enabled ? 'status-active' : 'status-warning'}`}
              style={{ marginRight: 12 }}
            >
              <div style={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: enabled ? C.em : C.am
              }} />
              {enabled ? 'ENABLED' : 'DISABLED'}
            </div>
            <Toggle checked={enabled} onChange={onToggle} />
          </div>
        ))}
      </div>

      <div className="divider" />

      {/* Session settings */}
      <div>
        <div style={{
          fontFamily: 'DM Mono,monospace',
          fontSize: '.64rem',
          letterSpacing: '.1em',
          color: C.t3,
          textTransform: 'uppercase',
          marginBottom: 14
        }}>
          Session Settings
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          background: 'rgba(6,18,30,.97)',
          borderRadius: 14,
          border: `1px solid ${C.bord}`,
          padding: '4px 16px',
          marginBottom: 16
        }}>
          {[
            { l: 'Login Notifications', d: 'Email alert on new device login', v: loginAlerts, sv: setLoginAlerts },
            { l: 'IP Whitelist', d: 'Restrict to approved IP addresses only', v: ipWhitelist, sv: setIpWhitelist }
          ].map(({ l, d, v, sv }) => (
            <div key={l} className="toggle-row">
              <div className="toggle-info">
                <div className="toggle-label">{l}</div>
                <div className="toggle-desc">{d}</div>
              </div>
              <Toggle checked={v} onChange={sv} />
            </div>
          ))}
        </div>
        <FieldGroup label="Session Timeout">
          <select
            className="field-input field-select"
            value={sessionTimeout}
            onChange={e => setSessionTimeout(e.target.value)}
          >
            {['30m', '1h', '4h', '8h', '24h', 'Never'].map(t => (
              <option key={t} style={{ background: '#04090f' }}>{t}</option>
            ))}
          </select>
        </FieldGroup>
      </div>

      <div className="divider" />

      {/* Active sessions */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14
        }}>
          <div style={{
            fontFamily: 'DM Mono,monospace',
            fontSize: '.64rem',
            letterSpacing: '.1em',
            color: C.t3,
            textTransform: 'uppercase'
          }}>
            Active Sessions
          </div>
          <button className="btn-danger" style={{ fontSize: '.74rem', padding: '6px 12px' }}>
            Revoke All
          </button>
        </div>
        {SESSIONS.map(({ device, loc, time, cur }) => (
          <div
            key={device}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              borderRadius: 13,
              background: 'rgba(6,18,30,.97)',
              border: `1px solid ${cur ? 'rgba(0,217,126,.18)' : C.bord}`,
              marginBottom: 8,
              transition: 'all .2s'
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: cur ? 'rgba(0,217,126,.12)' : 'rgba(255,255,255,.04)',
              border: `1px solid ${cur ? 'rgba(0,217,126,.22)' : C.bord}`,
              display: 'grid',
              placeItems: 'center',
              fontSize: '1rem',
              flexShrink: 0
            }}>
              {device.includes('iPhone') ? '📱' : '💻'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '.84rem',
                fontWeight: 600,
                marginBottom: 2,
                display: 'flex',
                gap: 8,
                alignItems: 'center'
              }}>
                {device}
                {cur && (
                  <div className="status-pill status-active" style={{ fontSize: '.55rem', padding: '2px 8px' }}>
                    CURRENT
                  </div>
                )}
              </div>
              <div style={{
                fontFamily: 'DM Mono,monospace',
                fontSize: '.65rem',
                color: C.t2
              }}>
                {loc} · {time}
              </div>
            </div>
            {!cur && (
              <button
                className="btn-icon"
                style={{
                  width: 30,
                  height: 30,
                  fontSize: '.75rem',
                  color: C.ro,
                  borderColor: 'rgba(251,113,133,.2)'
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
