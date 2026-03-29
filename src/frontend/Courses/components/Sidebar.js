import { C, GR, SIDEBAR_ITEMS } from '../constants';

export function Sidebar({ activeSidebar, setActiveSidebar, onBuilderOpen }) {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sb-logo">
        <div className="sb-logo-icon">⬡</div>
        <div>
          <div style={{
            fontFamily: 'Clash Display,sans-serif',
            fontSize: '.95rem',
            fontWeight: 700,
            letterSpacing: '-.02em'
          }}>
            Learn
            <span style={{
              background: GR.v,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Verse
            </span>
          </div>
          <div style={{
            fontFamily: 'DM Mono,monospace',
            fontSize: '.5rem',
            letterSpacing: '.14em',
            color: C.t3
          }}>
            ADMIN v2.6
          </div>
        </div>
        {/* Live dot */}
        <div style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '3px 8px',
          borderRadius: 99,
          background: 'rgba(0,255,136,.07)',
          border: '1px solid rgba(0,255,136,.15)'
        }}>
          <div style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: C.g,
            animation: 'dotBlink 2s infinite'
          }} />
          <span style={{
            fontFamily: 'DM Mono,monospace',
            fontSize: '.54rem',
            color: C.g
          }}>
            LIVE
          </span>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        <div className="sb-section">Main</div>
        {SIDEBAR_ITEMS.slice(0, 2).map(item => (
          <div
            key={item.id}
            className={`sb-item${activeSidebar === item.id ? ' active' : ''}`}
            onClick={() => {
              setActiveSidebar(item.id);
              if (item.id === 'builder') {
                onBuilderOpen();
              }
            }}
          >
            <span className="sb-icon">{item.ico}</span>
            <span>{item.label}</span>
            {item.badge && (
              <div
                className="sb-badge"
                style={{
                  background: `${item.badgeCol}18`,
                  border: `1px solid ${item.badgeCol}30`,
                  color: item.badgeCol
                }}
              >
                {item.badge}
              </div>
            )}
          </div>
        ))}

        <div className="sb-section" style={{ marginTop: 8 }}>Builder</div>
        <div
          className={`sb-item${activeSidebar === 'builder' ? ' active' : ''}`}
          onClick={() => {
            setActiveSidebar('builder');
            onBuilderOpen();
          }}
        >
          <span className="sb-icon">🔨</span>
          <span>Course Builder</span>
        </div>

        <div className="sb-section" style={{ marginTop: 8 }}>Management</div>
        {SIDEBAR_ITEMS.slice(3).map(item => (
          <div
            key={item.id}
            className={`sb-item${activeSidebar === item.id ? ' active' : ''}`}
            onClick={() => setActiveSidebar(item.id)}
          >
            <span className="sb-icon">{item.ico}</span>
            <span>{item.label}</span>
            {item.badge && (
              <div
                className="sb-badge"
                style={{
                  background: `${item.badgeCol}18`,
                  border: `1px solid ${item.badgeCol}30`,
                  color: item.badgeCol
                }}
              >
                {item.badge}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User */}
      <div className="sb-bottom">
        <div className="sb-user">
          <div className="sb-avatar">SA</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '.8rem',
              fontWeight: 600,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              Super Admin
            </div>
            <div style={{
              fontFamily: 'DM Mono,monospace',
              fontSize: '.58rem',
              color: C.t2
            }}>
              admin@learnverse.io
            </div>
          </div>
          <span style={{ color: C.t3, fontSize: '.8rem' }}>⋮</span>
        </div>
      </div>
    </aside>
  );
}
