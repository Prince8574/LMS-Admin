const C = {
  em: "#7c2fff", t2: "#6b5b8e", t3: "#1a1540",
};

const GR = {
  em: "linear-gradient(135deg,#7c2fff,#8b5cf6)",
};

const SB_ITEMS = [
  { id: 'dashboard', ico: '⬡', l: 'Dashboard' },
  { id: 'courses', ico: '📚', l: 'Courses', badge: 84, bc: C.em },
  { id: 'students', ico: '👥', l: 'Students', badge: '52K', bc: '#8b5cf6' },
  { id: 'revenue', ico: '💰', l: 'Revenue' },
  { id: 'analytics', ico: '📊', l: 'Analytics' },
  { id: 'settings', ico: '⚙', l: 'Settings' },
];

export function Sidebar({ activeSb, setActiveSb }) {
  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <div className="sb-logo-icon">
          <div className="sb-logo-ring" />
          <div className="sb-logo-core">⬡</div>
        </div>
        <div>
          <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '.96rem', fontWeight: 700 }}>
            Learn<span style={{ background: GR.em, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Verse</span>
          </div>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.48rem', letterSpacing: '.16em', color: C.t3 }}>ADMIN v2.6</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 99, background: 'rgba(124,47,255,.07)', border: '1px solid rgba(124,47,255,.16)' }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.em, animation: 'dotBlink 2s infinite' }} />
          <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '.52rem', color: C.em }}>LIVE</span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        <div className="sb-section">Main</div>
        {SB_ITEMS.slice(0, 2).map(i =>
          <div key={i.id} className={`sb-item${activeSb === i.id ? ' active' : ''}`} onClick={() => setActiveSb(i.id)}>
            <span className="sb-icon">{i.ico}</span>
            <span>{i.l}</span>
            {i.badge && <div className="sb-badge" style={{ background: `${i.bc}18`, border: `1px solid ${i.bc}28`, color: i.bc }}>{i.badge}</div>}
          </div>
        )}
        <div className="sb-section" style={{ marginTop: 6 }}>Management</div>
        {SB_ITEMS.slice(2).map(i =>
          <div key={i.id} className={`sb-item${activeSb === i.id ? ' active' : ''}`} onClick={() => setActiveSb(i.id)}>
            <span className="sb-icon">{i.ico}</span>
            <span>{i.l}</span>
            {i.badge && <div className="sb-badge" style={{ background: `${i.bc}18`, border: `1px solid ${i.bc}28`, color: i.bc }}>{i.badge}</div>}
          </div>
        )}
      </div>

      <div className="sb-bottom">
        <div className="sb-user">
          <div className="sb-avatar-core">SA</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '.8rem', fontWeight: 600 }}>Super Admin</div>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.58rem', color: C.t2 }}>admin@learnverse.io</div>
          </div>
          <span style={{ color: C.t3 }}>⋮</span>
        </div>
      </div>
    </aside>
  );
}
