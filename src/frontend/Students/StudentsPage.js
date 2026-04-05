import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { StudentDrawer } from './components/StudentDrawer';
import { AddStudentForm } from './components/AddStudentForm';
import { studentService } from './studentService';
import { authService } from '../Auth/services/authService';
import './Students.css';

const C = {
  bg: "#050814", em: "#7c2fff", am: "#f02079", ro: "#ff6b9d", cy: "#8b5cf6", vt: "#e8187c",
  text: "#ede8ff", t2: "#6b5b8e", t3: "#1a1540", bord: "rgba(255,255,255,0.07)",
};
const GR = {
  em: "linear-gradient(135deg,#7c2fff,#8b5cf6)",
  am: "linear-gradient(135deg,#f02079,#ff6b9d)",
  cy: "linear-gradient(135deg,#8b5cf6,#e8187c)",
  ro: "linear-gradient(135deg,#ff6b9d,#f02079)",
  vt: "linear-gradient(135deg,#e8187c,#8b5cf6)",
};
const AVATAR_COLORS = [GR.em, GR.am, GR.cy, GR.ro, GR.vt];

const STATUS_MAP = {
  active:    { cls: 'badge-active',    dot: C.em },
  inactive:  { cls: 'badge-inactive',  dot: C.t2 },
  suspended: { cls: 'badge-suspended', dot: C.ro },
};

// Derive avatar initials from name
function initials(name = "") {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

export default function StudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents]     = useState([]);
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [total, setTotal]           = useState(0);

  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('all');
  const [planFilter, setPlan]       = useState('all');
  const [sortBy, setSortBy]         = useState('lastActive');
  const [viewMode, setViewMode]     = useState('table');

  const [selected, setSelected]     = useState(new Set());
  const [drawer, setDrawer]         = useState(null);
  const [showAdd, setShowAdd]       = useState(false);
  const [toast, setToast]           = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // ── Fetch students ──────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await studentService.getAll({ search, status: statusFilter, plan: planFilter, sortBy });
      setStudents(res.students || []);
      setTotal(res.total || 0);
    } catch (e) {
      showToast("Error loading students: " + e.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, planFilter, sortBy]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await studentService.getStats();
      setStats(res.data);
    } catch (_) {}
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ── Selection helpers ───────────────────────────────────
  const toggleSelect = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll    = () => setSelected(s => s.size === students.length ? new Set() : new Set(students.map(s => s._id)));
  const allSelected  = students.length > 0 && selected.size === students.length;

  // ── Actions ─────────────────────────────────────────────
  const handleAdd = async (form) => {
    try {
      await studentService.create(form);
      showToast(form.name + ' added successfully!');
      setShowAdd(false);
      fetchStudents();
      fetchStats();
    } catch (e) {
      showToast('Error: ' + e.message);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await studentService.setStatus(id, status);
      showToast('Status updated!');
      fetchStudents();
      setDrawer(null);
    } catch (e) {
      showToast('Error: ' + e.message);
    }
  };

  const handleBulk = async (action) => {
    try {
      const ids = Array.from(selected);
      const res = await studentService.bulk(ids, action);
      showToast(`${res.affected} students updated!`);
      setSelected(new Set());
      fetchStudents();
      fetchStats();
    } catch (e) {
      showToast('Error: ' + e.message);
    }
  };

  // ── Stats band data ─────────────────────────────────────
  const STATS = [
    { l: 'Total Students',    v: stats ? stats.total.toLocaleString()       : '—', c: C.cy, g: GR.cy, ico: '👥', onClick: () => { setStatus('all'); setPlan('all'); } },
    { l: 'Active Today',      v: stats ? stats.activeToday.toLocaleString() : '—', c: C.em, g: GR.em, ico: '⚡', onClick: () => { setStatus('active'); setPlan('all'); } },
    { l: 'Premium Users',     v: stats ? stats.premium.toLocaleString()     : '—', c: C.am, g: GR.am, ico: '💎', onClick: () => { setStatus('all'); setPlan('premium'); } },
    { l: 'Avg Progress',      v: stats ? stats.avgProgress + '%'            : '—', c: C.vt, g: GR.vt, ico: '📈' },
    { l: 'Total Revenue',     v: stats ? '₹' + (stats.totalRevenue || 0).toLocaleString() : '—', c: C.ro, g: GR.ro, ico: '💰', onClick: () => navigate('/revenue') },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: C.bg }}>
      <div className="bg-grid" />
      <Sidebar />

      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <div className="topbar-title">{authService.isSuperAdmin() ? 'Students' : 'My Students'}</div>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.62rem', color: C.t3 }}>
              {authService.isSuperAdmin() ? `${total.toLocaleString()} students found` : `${total.toLocaleString()} students enrolled in your courses`}
            </div>
          </div>

          <div className="topbar-search" style={{ marginLeft: 12 }}>
            <span style={{ color: C.t3, fontSize: '.88rem' }}>⌕</span>
            <input
              placeholder="Search by name, email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', color: C.t3, cursor: 'pointer' }}>✕</button>}
          </div>

          <div style={{ flex: 1 }} />

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 10, color: C.t2, padding: '8px 12px', fontSize: '.78rem', cursor: 'pointer' }}
          >
            <option value="lastActive">Last Active</option>
            <option value="name">Name</option>
            <option value="joinDate">Join Date</option>
            <option value="progress">Progress</option>
            <option value="spent">Revenue</option>
          </select>

          <div className="view-toggle">
            <button className={`view-btn${viewMode === 'table' ? ' active' : ''}`} onClick={() => setViewMode('table')}>☰</button>
            <button className={`view-btn${viewMode === 'grid' ? ' active' : ''}`} onClick={() => setViewMode('grid')}>⊞</button>
          </div>

          <button className="btn-em" style={{ fontSize: '.8rem', padding: '9px 18px' }} onClick={() => setShowAdd(s => !s)}>
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>+</span> Add Student
          </button>
        </div>

        <div style={{ padding: '24px 24px', position: 'relative', zIndex: 1 }}>
          {/* Stats band */}
          <div className="stats-band">
            {STATS.map((s, i) => (
              <div key={i} className="stat-mini" style={{ '--g': s.g, animationDelay: `${i * .08}s`, cursor: 'pointer' }} onClick={s.onClick}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.c}14`, border: `1px solid ${s.c}20`, display: 'grid', placeItems: 'center', fontSize: '.95rem' }}>{s.ico}</div>
                </div>
                <div className="stat-mini-val" style={{ color: s.c }}>{s.v}</div>
                <div className="stat-mini-label">{s.l}</div>
              </div>
            ))}
          </div>

          {/* Add student form */}
          {showAdd && <AddStudentForm onClose={() => setShowAdd(false)} onSave={handleAdd} />}

          {/* Filters */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <div className="filter-tabs">
              {[{ id: 'all', l: 'All Students' }, { id: 'active', l: 'Active' }, { id: 'inactive', l: 'Inactive' }, { id: 'suspended', l: 'Suspended' }].map(f => (
                <div key={f.id} className={`filter-tab${statusFilter === f.id ? ' active' : ''}`} onClick={() => setStatus(f.id)}>{f.l}</div>
              ))}
            </div>
            <div className="filter-tabs">
              {[{ id: 'all', l: 'All Plans' }, { id: 'free', l: 'Free' }, { id: 'premium', l: 'Premium' }].map(f => (
                <div key={f.id} className={`filter-tab${planFilter === f.id ? ' active' : ''}`} onClick={() => setPlan(f.id)}>{f.l}</div>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: C.t2, fontSize: '.85rem' }}>
              Loading students…
            </div>
          )}

          {/* TABLE VIEW */}
          {!loading && viewMode === 'table' && (
            <div style={{ background: 'rgba(5,8,20,.98)', borderRadius: 22, border: '1px solid rgba(255,255,255,.07)', overflow: 'hidden' }}>
              <table className="student-table" style={{ width: '100%' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
                    <th style={{ padding: '12px 14px', width: 40 }}>
                      <div className={`cb${allSelected ? ' checked' : ''}`} onClick={toggleAll} />
                    </th>
                    <th>STUDENT</th>
                    <th>STATUS</th>
                    <th>PLAN</th>
                    <th>COURSES</th>
                    <th>PROGRESS</th>
                    <th>TOTAL SPENT</th>
                    <th>LAST ACTIVE</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const sm = STATUS_MAP[s.status] || STATUS_MAP.inactive;
                    const isSelected = selected.has(s._id);
                    const colIdx = i % AVATAR_COLORS.length;
                    const lastActive = s.lastActive
                      ? new Date(s.lastActive).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', year: '2-digit',
                          hour: '2-digit', minute: '2-digit', hour12: true
                        })
                      : '—';

                    return (
                      <tr
                        key={s._id}
                        className={`s-row${isSelected ? ' selected' : ''}`}
                        style={{ animation: `cardIn .4s ${i * .04}s ease both` }}
                        onClick={() => setDrawer(s)}
                      >
                        <td className="s-td" style={{ width: 40 }} onClick={e => e.stopPropagation()}>
                          <div className={`cb${isSelected ? ' checked' : ''}`} onClick={e => { e.stopPropagation(); toggleSelect(s._id); }} />
                        </td>
                        <td className="s-td">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 11, background: AVATAR_COLORS[colIdx], display: 'grid', placeItems: 'center', fontFamily: 'Clash Display,sans-serif', fontSize: '.8rem', fontWeight: 900, color: '#050814', overflow: 'hidden', flexShrink: 0 }}>
                              {s.avatar && s.avatar !== 'default-avatar.png'
                                ? <img src={s.avatar} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }}/>
                                : initials(s.name)
                              }
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '.85rem' }}>{s.name}</div>
                              <div style={{ fontSize: '.72rem', color: C.t2, fontFamily: 'DM Mono,monospace' }}>{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="s-td">
                          <div className={`badge ${sm.cls}`}>{(s.status || 'inactive').toUpperCase()}</div>
                        </td>
                        <td className="s-td">
                          <div className={`badge ${s.plan === 'premium' ? 'badge-premium' : 'badge-inactive'}`}>
                            {s.plan === 'premium' ? '💎 PRO' : 'FREE'}
                          </div>
                        </td>
                        <td className="s-td">
                          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.82rem', fontWeight: 700 }}>
                            {s.enrolledCount ?? (s.enrolledCourses || []).length}
                          </div>
                        </td>
                        <td className="s-td">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="prog-bar" style={{ flex: 1, minWidth: 60 }}>
                              <div className="prog-fill" style={{ '--pw': `${s.avgProgress || 0}%`, width: `${s.avgProgress || 0}%`, background: (s.avgProgress || 0) >= 80 ? GR.em : GR.cy }} />
                            </div>
                            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.68rem', fontWeight: 700 }}>{s.avgProgress || 0}%</div>
                          </div>
                        </td>
                        <td className="s-td" style={{ fontFamily: 'DM Mono,monospace', fontSize: '.78rem', color: C.am, fontWeight: 700 }}>
                          ₹{(s.totalSpent || 0).toLocaleString()}
                        </td>
                        <td className="s-td" style={{ fontFamily: 'DM Mono,monospace', fontSize: '.68rem', color: C.t2 }}>
                          <div>{lastActive}</div>
                        </td>
                      </tr>
                    );
                  })}

                  {students.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '48px', color: C.t2, fontSize: '.85rem' }}>
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* GRID VIEW */}
          {!loading && viewMode === 'grid' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
              {students.map((s, i) => {
                const colIdx = i % AVATAR_COLORS.length;
                return (
                  <div
                    key={s._id}
                    onClick={() => setDrawer(s)}
                    style={{ background: 'rgba(5,8,20,.98)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 18, padding: 20, cursor: 'pointer', transition: 'all .2s', animation: `cardIn .4s ${i * .04}s ease both` }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 13, background: AVATAR_COLORS[colIdx], display: 'grid', placeItems: 'center', fontFamily: 'Clash Display,sans-serif', fontSize: '.9rem', fontWeight: 900, color: '#050814' }}>
                        {initials(s.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '.88rem' }}>{s.name}</div>
                        <div style={{ fontSize: '.7rem', color: C.t2 }}>{s.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                      <div className={`badge ${STATUS_MAP[s.status]?.cls || 'badge-inactive'}`}>{(s.status || 'inactive').toUpperCase()}</div>
                      <div className={`badge ${s.plan === 'premium' ? 'badge-premium' : 'badge-inactive'}`}>{s.plan === 'premium' ? '💎 PRO' : 'FREE'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="prog-bar" style={{ flex: 1 }}>
                        <div className="prog-fill" style={{ width: `${s.avgProgress || 0}%`, background: GR.cy }} />
                      </div>
                      <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '.68rem', color: C.t2 }}>{s.avgProgress || 0}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* BULK ACTION BAR */}
      {selected.size > 0 && (
        <div className="bulk-bar">
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(124,47,255,.15)', border: '1px solid rgba(124,47,255,.3)', display: 'grid', placeItems: 'center', fontSize: '.8rem', flexShrink: 0 }}>✓</div>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.78rem', color: C.em, fontWeight: 700 }}>{selected.size} selected</div>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,.1)' }} />
          <button onClick={() => handleBulk('activate')} className="btn-sec" style={{ padding: '7px 13px', fontSize: '.78rem' }}>✓ Activate</button>
          <button onClick={() => handleBulk('upgrade')}  className="btn-sec" style={{ padding: '7px 13px', fontSize: '.78rem' }}>💎 Upgrade Plan</button>
          <button onClick={() => handleBulk('suspend')}  className="btn-danger" style={{ padding: '7px 13px', fontSize: '.78rem' }}>🚫 Suspend</button>
          <button onClick={() => setSelected(new Set())} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(255,255,255,.07)', background: 'transparent', color: C.t2, cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: '.8rem' }}>✕</button>
        </div>
      )}

      {/* STUDENT DRAWER */}
      {drawer && (
        <StudentDrawer
          student={drawer}
          onClose={() => setDrawer(null)}
          onAction={(msg) => { showToast(msg); setDrawer(null); fetchStudents(); }}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* TOAST */}
      {toast && (
        <div className="toast">
          <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(0,217,126,.15)', border: '1px solid rgba(0,217,126,.3)', display: 'grid', placeItems: 'center', fontSize: '.82rem', flexShrink: 0 }}>✓</div>
          <div style={{ fontSize: '.84rem', color: '#e2e8f0' }}>{toast}</div>
        </div>
      )}
    </div>
  );
}
