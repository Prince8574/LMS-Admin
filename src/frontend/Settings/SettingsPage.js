import { useState, useRef, useEffect } from 'react';
import { C, SECTIONS } from './constants';
import { Sidebar } from '../../components/Sidebar';
import { useThreeBackground } from './hooks/useThreeBackground';
import { useGSAP } from './hooks/useGSAP';
import {
  ProfileSection,
  AppearanceSection,
  SecuritySection,
  NotificationsSection,
  PermissionsSection,
  IntegrationsSection,
  BillingSection,
  PlatformSection,
  ActivitySection
} from './sections';
import './Settings.css';

export default function SettingsPage() {
  const bgRef = useRef(null);
  useThreeBackground(bgRef);
  const gsap = useGSAP();

  const [activeSection, setActiveSection] = useState('profile');
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // GSAP entrance
  useEffect(() => {
    if (!gsap) return;
    gsap.fromTo('.sb-logo', { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: .5, ease: 'power3.out', delay: .1 });
    gsap.fromTo('.sb-item', { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: .4, stagger: .055, ease: 'power3.out', delay: .18 });
    gsap.fromTo('.topbar', { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: .5, ease: 'power3.out', delay: .12 });
    gsap.fromTo('.snav-item', { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: .38, stagger: .05, ease: 'power3.out', delay: .3 });
  }, [gsap]);

  const activeData = SECTIONS.find(s => s.id === activeSection);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: C.bg }}>
      {/* Three.js canvas */}
      <canvas ref={bgRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
      <div className="bg-grid" />

      {/* Orbs */}
      <div className="orb" style={{ width: 500, height: 500, top: '-6%', right: '-3%', background: 'radial-gradient(circle,rgba(0,217,126,.08),transparent 65%)', position: 'fixed', zIndex: 0 }} />
      <div className="orb" style={{ width: 380, height: 380, bottom: '12%', left: '15%', background: 'radial-gradient(circle,rgba(34,211,238,.06),transparent 65%)', position: 'fixed', zIndex: 0, animationDelay: '2s' }} />

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <div className="topbar-title">Settings</div>
            <div className="breadcrumb">
              <span>Admin</span>
              <span style={{ color: C.t3 }}>›</span>
              <span className="active">{activeData?.label || 'Settings'}</span>
            </div>
          </div>
          <div style={{ flex: 1 }} />
          <button className="btn-em" style={{ fontSize: '.8rem', padding: '9px 18px' }} onClick={() => showToast('All changes saved!')}>
            💾 Save All
          </button>
        </div>

        {/* Settings Layout */}
        <div className="settings-wrap">
          {/* Settings Nav */}
          <nav className="settings-nav">
            {[
              { group: 'Account', items: ['profile', 'appearance', 'security'] },
              { group: 'Platform', items: ['notifications', 'permissions', 'platform'] },
              { group: 'Developer', items: ['integrations'] },
              { group: 'Finance', items: ['billing'] },
              { group: 'Audit', items: ['activity'] },
            ].map(({ group, items }) => (
              <div key={group}>
                <div className="snav-section">{group}</div>
                {items.map(id => {
                  const s = SECTIONS.find(x => x.id === id);
                  return (
                    <div
                      key={id}
                      className={`snav-item${activeSection === id ? ' active' : ''}`}
                      onClick={() => setActiveSection(id)}
                    >
                      <span className="snav-icon">{s.icon}</span>
                      <span style={{ flex: 1 }}>{s.label}</span>
                      <div className="snav-dot" />
                    </div>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Content */}
          <div className="settings-content" style={{ position: 'relative', zIndex: 1 }}>
            {activeData && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 24,
                paddingBottom: 18,
                borderBottom: `1px solid ${C.bord}`
              }}>
                <div style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: `${activeData.color}14`,
                  border: `1px solid ${activeData.color}22`,
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '1.2rem',
                  flexShrink: 0,
                  boxShadow: `0 0 20px ${activeData.color}14`
                }}>
                  {activeData.icon}
                </div>
                <div>
                  <div style={{
                    fontFamily: 'Clash Display,sans-serif',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    letterSpacing: '-.02em',
                    marginBottom: 3
                  }}>
                    {activeData.label}
                  </div>
                  <div style={{ fontSize: '.78rem', color: C.t2 }}>{activeData.sub}</div>
                </div>
                <div style={{ marginLeft: 'auto', height: 3, width: 50, background: activeData.g, borderRadius: 99 }} />
              </div>
            )}

            {/* Content based on active section */}
            {(() => {
              const props = { save: showToast };
              switch (activeSection) {
                case 'profile': return <ProfileSection {...props} />;
                case 'appearance': return <AppearanceSection {...props} />;
                case 'security': return <SecuritySection {...props} />;
                case 'notifications': return <NotificationsSection {...props} />;
                case 'permissions': return <PermissionsSection {...props} />;
                case 'integrations': return <IntegrationsSection {...props} />;
                case 'billing': return <BillingSection {...props} />;
                case 'platform': return <PlatformSection {...props} />;
                case 'activity': return <ActivitySection />;
                default: return (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '80px 20px',
                    color: C.t2,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: 16 }}>{activeData?.icon}</div>
                    <div style={{
                      fontFamily: 'Clash Display,sans-serif',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      marginBottom: 8
                    }}>
                      {activeData?.label}
                    </div>
                    <div>{activeData?.sub}</div>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast">
          <span style={{ fontSize: '.9rem', flexShrink: 0 }}>✓</span>
          <span style={{ fontSize: '.78rem', color: '#e2e8f0' }}>{toast}</span>
        </div>
      )}
    </div>
  );
}
