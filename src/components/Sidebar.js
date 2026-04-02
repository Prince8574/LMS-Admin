import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../frontend/Auth/services/authService';

const C = {
  em: "#7c2fff", t2: "#6b5b8e", t3: "#1a1540",
};

const GR = {
  em: "linear-gradient(135deg,#7c2fff,#8b5cf6)",
};

const SB_ITEMS = [
  { id: 'dashboard',   ico: '⬡',   l: 'Dashboard',   path: '/' },
  { id: 'courses',     ico: '📚',  l: 'Courses',      badge: 84,    bc: C.em,      path: '/courses' },
  { id: 'students',    ico: '👥',  l: 'Students',     badge: '52K', bc: '#8b5cf6', path: '/students' },
  { id: 'revenue',     ico: '💰',  l: 'Revenue',      path: '/revenue' },
  { id: 'analytics',   ico: '📊',  l: 'Analytics',    path: '/analytics' },
  { id: 'assignments', ico: '📝',   l: 'Assignments',  path: '/assignments' },  { id: 'settings',    ico: '⚙',   l: 'Settings',     path: '/settings' },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveId = () => {
    const path = location.pathname;
    if (path === '/')                    return 'dashboard';
    if (path.startsWith('/courses'))     return 'courses';
    if (path.startsWith('/students'))    return 'students';
    if (path.startsWith('/revenue'))     return 'revenue';
    if (path.startsWith('/analytics'))   return 'analytics';
    if (path.startsWith('/assignments')) return 'assignments';
    if (path.startsWith('/settings'))    return 'settings';
    return 'dashboard';
  };

  const activeSb = getActiveId();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/auth', { replace: true });
  };

  // Read admin info from token or API
  const token = localStorage.getItem('admin_token');
  const [adminName, setAdminName] = useState('Super Admin');
  const [adminEmail, setAdminEmail] = useState('admin@learnverse.io');

  useEffect(() => {
    // Try token first
    try {
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.email) setAdminEmail(payload.email);
        if (payload.name) { setAdminName(payload.name); return; }
      }
    } catch (_) {}
    // Fallback: fetch from API
    authService.getMe().then(data => {
      if (data.success && data.admin) {
        if (data.admin.name) setAdminName(data.admin.name);
        if (data.admin.email) setAdminEmail(data.admin.email);
      }
    }).catch(() => {});
  }, [token]);

  const initials = adminName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

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
          <div key={i.id} className={`sb-item${activeSb === i.id ? ' active' : ''}`} onClick={() => navigate(i.path)}>
            <span className="sb-icon">{i.ico}</span>
            <span>{i.l}</span>
            {i.badge && <div className="sb-badge" style={{ background: `${i.bc}18`, border: `1px solid ${i.bc}28`, color: i.bc }}>{i.badge}</div>}
          </div>
        )}
        <div className="sb-section" style={{ marginTop: 6 }}>Management</div>
        {SB_ITEMS.slice(2).map(i =>
          <div key={i.id} className={`sb-item${activeSb === i.id ? ' active' : ''}`} onClick={() => navigate(i.path)}>
            <span className="sb-icon">{i.ico}</span>
            <span>{i.l}</span>
            {i.badge && <div className="sb-badge" style={{ background: `${i.bc}18`, border: `1px solid ${i.bc}28`, color: i.bc }}>{i.badge}</div>}
          </div>
        )}
      </div>

      <div className="sb-bottom">
        <div className="sb-user">
          <div className="sb-avatar-core">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '.8rem', fontWeight: 600 }}>{adminName}</div>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.58rem', color: C.t2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminEmail}</div>
          </div>
          <span
            title="Logout"
            onClick={handleLogout}
            style={{ color: '#ff6b9d', cursor: 'pointer', fontSize: '1rem', padding: '4px 6px', borderRadius: 6, transition: 'background .2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,157,.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >⏻</span>
        </div>
      </div>
    </aside>
  );
}
