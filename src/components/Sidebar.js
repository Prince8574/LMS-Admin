import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../frontend/Auth/services/authService';
import { AnimatedAvatarSmall } from './AnimatedAvatarSmall';

const C = {
  em: "#7c2fff", t2: "#6b5b8e", t3: "#1a1540",
};

const GR = {
  em: "linear-gradient(135deg,#7c2fff,#8b5cf6)",
};

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = authService.getRole(); // 'super_admin' | 'instructor' | 'admin'
  const isSuperAdmin = role === 'super_admin';

  const getActiveId = () => {
    const path = location.pathname;
    if (path === '/')                    return 'dashboard';
    if (path.startsWith('/courses'))     return 'courses';
    if (path.startsWith('/students'))    return 'students';
    if (path.startsWith('/revenue'))     return 'revenue';
    if (path.startsWith('/assignments')) return 'assignments';
    if (path.startsWith('/analytics'))   return 'analytics';
    if (path.startsWith('/moderation'))  return 'moderation';
    if (path.startsWith('/instructors')) return 'instructors';
    if (path.startsWith('/settings'))    return 'settings';
    return 'dashboard';
  };

  const activeSb = getActiveId();

  // Items visible to ALL roles
  const MAIN_ITEMS = [
    { id: 'dashboard',   ico: '⬡',  l: 'Dashboard',   path: '/' },
    { id: 'courses',     ico: '📚', l: 'Courses',      path: '/courses' },
    { id: 'assignments', ico: '📝', l: 'Assignments',  path: '/assignments' },
    // Instructors see "My Students", super_admin sees it in Management section
    ...(!isSuperAdmin ? [{ id: 'students', ico: '👥', l: 'My Students', path: '/students' }] : []),
  ];

  // Items visible only to super_admin
  const ADMIN_ITEMS = [
    { id: 'students',  ico: '👥', l: 'Students',  badge: '52K', bc: '#8b5cf6', path: '/students' },
    { id: 'revenue',   ico: '💰', l: 'Revenue',   path: '/revenue' },
    { id: 'analytics', ico: '📊', l: 'Analytics', path: '/analytics' },
  ];

  // Tools: super_admin only
  const TOOL_ITEMS = [
    { id: 'instructors', ico: '👨‍🏫', l: 'Instructors', path: '/instructors' },
    { id: 'moderation',  ico: '🛡️', l: 'Moderation',  path: '/moderation' },
  ];

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
        // Sync avatar from DB to localStorage
        if (data.admin.avatar) {
          setAvatarUrl(data.admin.avatar);
          localStorage.setItem('admin_avatar', data.admin.avatar);
        }
      }
    }).catch(() => {});
  }, [token]);

  // Read avatar from localStorage
  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem('admin_avatar') || null);

  // Listen for avatar updates
  useEffect(() => {
    const onStorage = () => setAvatarUrl(localStorage.getItem('admin_avatar') || null);
    window.addEventListener('storage', onStorage);
    // Also poll every 2s in case same-tab update
    const interval = setInterval(() => {
      const a = localStorage.getItem('admin_avatar');
      setAvatarUrl(prev => prev !== a ? a : prev);
    }, 2000);
    return () => { window.removeEventListener('storage', onStorage); clearInterval(interval); };
  }, []);

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
        {MAIN_ITEMS.map(i =>
          <div key={i.id} className={`sb-item${activeSb === i.id ? ' active' : ''}`} onClick={() => navigate(i.path)}>
            <span className="sb-icon">{i.ico}</span>
            <span>{i.l}</span>
          </div>
        )}

        {isSuperAdmin && <>
          <div className="sb-section" style={{ marginTop: 6 }}>Management</div>
          {ADMIN_ITEMS.map(i =>
            <div key={i.id} className={`sb-item${activeSb === i.id ? ' active' : ''}`} onClick={() => navigate(i.path)}>
              <span className="sb-icon">{i.ico}</span>
              <span>{i.l}</span>
              {i.badge && <div className="sb-badge" style={{ background: `${i.bc}18`, border: `1px solid ${i.bc}28`, color: i.bc }}>{i.badge}</div>}
            </div>
          )}
          <div className="sb-section" style={{ marginTop: 6 }}>Admin Tools</div>
          {TOOL_ITEMS.map(i =>
            <div key={i.id} className={`sb-item${activeSb === i.id ? ' active' : ''}`} onClick={() => navigate(i.path)}>
              <span className="sb-icon">{i.ico}</span>
              <span>{i.l}</span>
            </div>
          )}
        </>}

        {/* Settings visible to all */}
        <div className="sb-section" style={{ marginTop: 6 }}>Account</div>
        <div className={`sb-item${activeSb === 'settings' ? ' active' : ''}`} onClick={() => navigate('/settings')}>
          <span className="sb-icon">⚙</span>
          <span>Settings</span>
        </div>
      </div>

      <div className="sb-bottom">
        {/* Role badge above user card */}
        <div style={{ margin: '0 10px 8px', padding: '5px 10px', borderRadius: 8, background: isSuperAdmin ? 'rgba(124,47,255,.1)' : 'rgba(13,217,196,.1)', border: `1px solid ${isSuperAdmin ? 'rgba(124,47,255,.25)' : 'rgba(13,217,196,.25)'}`, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '.75rem' }}>{isSuperAdmin ? '👑' : '👨‍🏫'}</span>
          <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '.6rem', color: isSuperAdmin ? '#7c2fff' : '#0dd9c4', fontWeight: 700, letterSpacing: '.06em' }}>
            {isSuperAdmin ? 'SUPER ADMIN' : role === 'instructor' ? 'INSTRUCTOR' : 'ADMIN'}
          </span>
        </div>
        <div className="sb-user">
          <AnimatedAvatarSmall avatarUrl={avatarUrl} initials={initials} size={34} />
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
