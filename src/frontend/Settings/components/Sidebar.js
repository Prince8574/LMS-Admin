import { C, GR, SB_ITEMS } from '../constants';

export function Sidebar({ activeSidebar, setActiveSidebar }) {
  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <div className="sb-logo-icon">
          <div className="sb-logo-ring" />
          <div className="sb-logo-core">⬡</div>
        </div>
        <div>
          <div style={{
            fontFamily: 'Clash Display,sans-serif',
            fontSize: '.96rem',
            fontWeight: 700,
            letterSpacing: '-.02em'
          }}>
            Learn
            <span style={{
              background: GR.em,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Verse
            </span>
          </div>
          <div style={{
            fontFamily: 'DM Mono,monospace',
            fontSize: '.48rem',
            letterSpacing: '.16em',
            color: C.t3
          }}>
            ADMIN v2.6
          </div>
        </div>
        <div style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          padding: '3px 8px',
          borderRadius: 99,
          background: 'rgba(0,217,126,.07)',
          border: '1px solid rgba(0,217,126,.16)'
        }}>
          <div style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: C.em,
            animation: 'dotBlink 2s infinite'
          }} />
          <span style={{
            fontFamily: 'DM Mono,monospace',
            fontSize: '.52rem',
            color: C.em
          }}>
            LIVE
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        <div className="sb-section">Main</div>
        {SB_ITEMS.slice(0, 2).map(item => (
          <div
            key={item.id}
            className={`sb-item${activeSidebar === item.id ? ' active' : ''}`}
            onClick={() => setActiveSidebar(item.id)}
          >
            <span className="sb-icon">{item.ico}</span>
            <span>{item.l}</span>
            {item.badge && (
              <div
                className="sb-badge"
                style={{
                  background: `${item.bc}18`,
                  border: `1px solid ${item.bc}28`,
                  color: item.bc
                }}
              >
                {item.badge}
              </div>
            )}
          </div>
        ))}

        <div className="sb-section" style={{ marginTop: 6 }}>Management</div>
        {SB_ITEMS.slice(2).map(item => (
          <div
            key={item.id}
            className={`sb-item${activeSidebar === item.id ? ' active' : ''}`}
            onClick={() => setActiveSidebar(item.id)}
          >
            <span className="sb-icon">{item.ico}</span>
            <span>{item.l}</span>
            {item.badge && (
              <div
                className="sb-badge"
                style={{
                  background: `${item.bc}18`,
                  border: `1px solid ${item.bc}28`,
                  color: item.bc
                }}
              >
                {item.badge}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="sb-bottom">
        <div className="sb-user">
          <div className="sb-avatar-wrap">
            <div className="sb-avatar">SA</div>
            <div className="sb-online" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '.8rem', fontWeight: 600 }}>Super Admin</div>
            <div style={{
              fontFamily: 'DM Mono,monospace',
              fontSize: '.58rem',
              color: C.t2
            }}>
              admin@learnverse.io
            </div>
          </div>
          <span style={{ color: C.t3, fontSize: '.85rem' }}>⋮</span>
        </div>
      </div>
    </aside>
  );
}
