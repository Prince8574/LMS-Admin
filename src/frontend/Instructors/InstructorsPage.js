import { useRef, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sidebar } from '../../components/Sidebar';
import { authService } from '../Auth/services/authService';
import API_BASE from '../../config/api';
import './InstructorsPage.css';

const C = {
  bg: '#050814', em: '#7c2fff', tl: '#0dd9c4', gd: '#f5c842',
  ind: '#6979f8', cr: '#ff6b9d', t2: '#6b5b8e', t3: '#1a1540', vt: '#a78bfa',
};
const GR = {
  em: 'linear-gradient(135deg,#7c2fff,#8b5cf6)',
  tl: 'linear-gradient(135deg,#0dd9c4,#06b6d4)',
  gd: 'linear-gradient(135deg,#f5c842,#f97316)',
  ind: 'linear-gradient(135deg,#6979f8,#7c2fff)',
  cr: 'linear-gradient(135deg,#ff6b9d,#f43f5e)',
};
const ACOLS = [C.em, C.tl, C.gd, C.ind, C.cr, C.vt];

const authH = () => ({
  Authorization: 'Bearer ' + localStorage.getItem('admin_token'),
  'Content-Type': 'application/json',
});

/* ── Animated counter ── */
function Count({ to, prefix = '', suffix = '', dec = 0 }) {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  const done = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !done.current) {
        done.current = true;
        const s = performance.now();
        const tick = n => {
          const p = Math.min((n - s) / 1800, 1);
          setV(to * (1 - Math.pow(1 - p, 4)));
          if (p < 1) requestAnimationFrame(tick); else setV(to);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  const fmt = n => dec ? n.toFixed(dec) : n >= 1e5 ? (n / 1e5).toFixed(1) + 'L' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : Math.round(n).toLocaleString();
  return <span ref={ref}>{prefix}{fmt(v)}{suffix}</span>;
}

/* ── Three.js background ── */
function useBg(ref) {
  useEffect(() => {
    let renderer, animId;
    import('three').then(THREE => {
      const canvas = ref.current;
      if (!canvas) return;
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(window.innerWidth, window.innerHeight);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.z = 5;
      const N = 800;
      const pos = new Float32Array(N * 3);
      const col = new Float32Array(N * 3);
      const palette = [[0.49, 0.19, 1], [0.05, 0.85, 0.77], [0.96, 0.78, 0.26]];
      for (let i = 0; i < N; i++) {
        pos[i * 3] = (Math.random() - 0.5) * 22;
        pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
        const c = palette[i % 3];
        col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.045, vertexColors: true, transparent: true, opacity: 0.5 }));
      scene.add(pts);
      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', onResize);
      const animate = () => {
        animId = requestAnimationFrame(animate);
        pts.rotation.y += 0.00022;
        pts.rotation.x += 0.0001;
        renderer.render(scene, camera);
      };
      animate();
      return () => window.removeEventListener('resize', onResize);
    }).catch(() => {});
    return () => { cancelAnimationFrame(animId); renderer?.dispose(); };
  }, [ref]);
}

/* ── GSAP ── */
function useGSAP() {
  const [g, setG] = useState(null);
  useEffect(() => {
    if (window.gsap) { setG(window.gsap); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    s.onload = () => setG(window.gsap);
    document.head.appendChild(s);
  }, []);
  return g;
}

/* ── Avatar (initials fallback) ── */
function Avatar({ name, size = 44, avatarUrl = null }) {
  const initials = (name || 'IN').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const col = ACOLS[(name || '').charCodeAt(0) % ACOLS.length] || C.em;
  if (avatarUrl) {
    return (
      <img src={avatarUrl} alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '2px solid ' + col + '44', flexShrink: 0 }}
        onError={e => { e.target.style.display = 'none'; }}
      />
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: col + '22', border: '2px solid ' + col + '44', display: 'grid', placeItems: 'center', fontFamily: 'Clash Display,sans-serif', fontWeight: 700, fontSize: size * 0.35 + 'px', color: col, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

/* ── Sparkline ── */
function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;
  const W = 80, H = 32, PX = 2, PY = 4;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const iw = W - PX * 2, ih = H - PY * 2;
  const xStep = iw / (data.length - 1);
  const pts = data.map((v, i) => [PX + i * xStep, H - PY - ((v - min) / range) * ih]);
  const poly = pts.map(p => p[0] + ',' + p[1]).join(' ');
  const area = 'M' + pts[0] + pts.slice(1).map(p => 'L' + p).join('') + 'L' + pts[pts.length - 1][0] + ',' + (H - PY) + 'L' + pts[0][0] + ',' + (H - PY) + 'Z';
  const id = 'sg' + color.replace('#', '');
  return (
    <svg viewBox={'0 0 ' + W + ' ' + H} width={W} height={H} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={'url(#' + id + ')'} />
      <polyline points={poly} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="200" strokeDashoffset="200" style={{ animation: 'lineDraw 1.2s ease forwards' }} />
    </svg>
  );
}

/* ── Bar Chart ── */
function BarChart({ instructors }) {
  if (!instructors.length) return <div style={{ color: C.t2, fontFamily: 'DM Mono,monospace', fontSize: '.75rem', padding: '20px 0' }}>No data yet</div>;
  const top = instructors.slice(0, 6);
  const maxRev = Math.max(...top.map(i => i.totalRevenue), 1);
  const W = 480, H = 160, PX = 12, PY = 16, baseY = H - 28;
  const barW = 44, gap = top.length > 1 ? (W - PX * 2 - top.length * barW) / (top.length - 1) : 0;
  return (
    <svg viewBox={'0 0 ' + W + ' ' + H} width="100%" height={H} style={{ display: 'block', overflow: 'visible' }}>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <line key={i} x1={PX} y1={PY + (baseY - PY) * (1 - f)} x2={W - PX} y2={PY + (baseY - PY) * (1 - f)} stroke="rgba(255,255,255,.04)" strokeWidth="1" />
      ))}
      {top.map((inst, i) => {
        const x = PX + i * (barW + gap) + barW / 2;
        const bh = Math.max(4, (inst.totalRevenue / maxRev) * (baseY - PY - 8));
        const y = baseY - bh;
        const col = ACOLS[i % ACOLS.length];
        return (
          <g key={i}>
            <rect x={x - barW / 2} y={y} width={barW} height={bh} rx={8} fill={col} opacity=".85"
              style={{ transformOrigin: x + 'px ' + baseY + 'px', animation: 'barRise .7s ' + (i * 0.1) + 's ease both' }} />
            <text x={x} y={y - 5} textAnchor="middle" fill={col} fontSize="9" fontFamily="DM Mono,monospace" fontWeight="700">
              ₹{inst.totalRevenue >= 1000 ? (inst.totalRevenue / 1000).toFixed(0) + 'K' : inst.totalRevenue}
            </text>
            <text x={x} y={baseY + 14} textAnchor="middle" fill="rgba(255,255,255,.3)" fontSize="8.5" fontFamily="DM Mono,monospace">
              {(inst.name || '').split(' ')[0].slice(0, 7)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Donut ── */
function Donut({ instructors }) {
  if (!instructors.length) return null;
  const top = instructors.slice(0, 5);
  const total = top.reduce((a, i) => a + i.totalCourses, 0) || 1;
  const r = 42, cx = 56, cy = 56, circ = 2 * Math.PI * r;
  let off = 0;
  const slices = top.map((inst, i) => {
    const dash = (inst.totalCourses / total) * circ;
    const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={ACOLS[i % ACOLS.length]} strokeWidth="13" strokeLinecap="round" strokeDasharray={dash + ' ' + (circ - dash)} strokeDashoffset={-off} transform={'rotate(-90,' + cx + ',' + cy + ')'} style={{ filter: 'drop-shadow(0 0 5px ' + ACOLS[i % ACOLS.length] + '66)' }} />;
    off += dash;
    return el;
  });
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg viewBox="0 0 112 112" width={112} height={112} style={{ display: 'block', flexShrink: 0 }}>
        {slices}
        <circle cx={cx} cy={cy} r={28} fill="rgba(7,16,28,.97)" />
        <text x={cx} y={cy + 4} textAnchor="middle" fill="white" fontSize="11" fontFamily="Clash Display,sans-serif" fontWeight="700">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="rgba(255,255,255,.28)" fontSize="7" fontFamily="DM Mono,monospace">COURSES</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {top.map((inst, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: ACOLS[i % ACOLS.length], flexShrink: 0 }} />
            <span style={{ fontSize: '.72rem', color: C.t2, fontFamily: 'DM Mono,monospace', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{(inst.name || '').split(' ')[0]}</span>
            <span style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.5)', marginLeft: 'auto' }}>{inst.totalCourses}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Drawer ── */
function Drawer({ instructor, onClose, onDelete, onToast }) {
  const ref = useRef(null);
  const gsap = useGSAP();
  const [dbData, setDbData] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (gsap && ref.current) gsap.fromTo(ref.current, { x: 440, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: 'power3.out' });
  }, [gsap]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    fetch(`${API_BASE}/api/auth/instructors`, { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          const found = json.data.find(i => i._id?.toString() === instructor.id?.toString() || i.name === instructor.name);
          setDbData(found || null);
        }
      }).catch(() => {});
  }, [instructor.id, instructor.name]);

  const close = () => {
    if (gsap && ref.current) gsap.to(ref.current, { x: 440, opacity: 0, duration: 0.28, ease: 'power3.in', onComplete: onClose });
    else onClose();
  };

  const handleDelete = async () => {
    if (!dbData?._id) { onToast && onToast('Cannot delete — not found in DB'); return; }
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_BASE}/api/auth/instructors/${dbData._id}`, {
        method: 'DELETE', headers: { Authorization: 'Bearer ' + token }
      });
      const json = await res.json();
      if (json.success) { onToast && onToast('Instructor removed'); onDelete && onDelete(); close(); }
      else onToast && onToast(json.message || 'Delete failed');
    } catch { onToast && onToast('Server error'); }
  };

  const col = ACOLS[(instructor.name || '').charCodeAt(0) % ACOLS.length] || C.em;
  const joinDate = dbData?.createdAt ? new Date(dbData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', justifyContent: 'flex-end' }} onClick={e => e.target === e.currentTarget && close()}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,20,.65)', backdropFilter: 'blur(5px)' }} onClick={close} />
      <div ref={ref} style={{ position: 'relative', width: 460, height: '100vh', overflowY: 'auto', background: 'linear-gradient(180deg,#0d1128,#080d1e)', borderLeft: '1px solid rgba(255,255,255,.08)', zIndex: 1 }}>
        <div style={{ height: 3, background: `linear-gradient(90deg,${col},${col}66,transparent)` }} />
        <div style={{ padding: '22px 24px 32px' }}>
          <button onClick={close} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, color: '#ede8ff', cursor: 'pointer', padding: '5px 10px', fontSize: '.8rem' }}>✕</button>

          {/* Profile header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, paddingBottom: 18, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
            {/* Avatar — real photo if available, else initials */}
            {dbData?.avatar ? (
              <img src={dbData.avatar} alt={instructor.name}
                style={{ width: 62, height: 62, borderRadius: '50%', objectFit: 'cover', border: '2px solid ' + col + '44', flexShrink: 0 }} />
            ) : (
              <Avatar name={instructor.name} size={62} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '1.12rem', fontWeight: 700, color: '#ede8ff', marginBottom: 3 }}>{instructor.name}</div>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.65rem', color: C.t2, marginBottom: 8 }}>{dbData?.email || '—'}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <div style={{ padding: '3px 9px', borderRadius: 99, background: col + '18', border: '1px solid ' + col + '30', fontFamily: 'DM Mono,monospace', fontSize: '.6rem', color: col, fontWeight: 700 }}>👨‍🏫 INSTRUCTOR</div>
                <div style={{ padding: '3px 9px', borderRadius: 99, background: 'rgba(13,217,196,.1)', border: '1px solid rgba(13,217,196,.2)', fontFamily: 'DM Mono,monospace', fontSize: '.6rem', color: C.tl }}>Joined {joinDate}</div>
              </div>
            </div>
          </div>

          {/* Stats 3-col */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 18 }}>
            {[
              { l: 'Revenue', v: '₹' + (instructor.totalRevenue >= 1000 ? (instructor.totalRevenue / 1000).toFixed(1) + 'K' : instructor.totalRevenue || 0), c: C.gd, ico: '💰' },
              { l: 'Courses', v: instructor.totalCourses || 0, c: C.em, ico: '📚' },
              { l: 'Students', v: (instructor.totalStudents || 0) >= 1000 ? (instructor.totalStudents / 1000).toFixed(1) + 'K' : (instructor.totalStudents || 0), c: C.tl, ico: '👥' },
              { l: 'Published', v: instructor.publishedCourses || 0, c: C.ind, ico: '✅' },
              { l: 'Draft', v: instructor.draftCourses || 0, c: C.cr, ico: '📝' },
              { l: 'Avg Rating', v: instructor.avgRating ? instructor.avgRating.toFixed(1) + '★' : 'N/A', c: C.vt, ico: '⭐' },
            ].map((s, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: '.85rem', marginBottom: 4 }}>{s.ico}</div>
                <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '1rem', fontWeight: 700, color: s.c }}>{s.v}</div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.55rem', color: C.t2, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>

          {/* Account details */}
          <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 12, padding: '14px 16px', marginBottom: 18 }}>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.6rem', color: C.t2, marginBottom: 10, letterSpacing: '.08em' }}>ACCOUNT DETAILS</div>
            {[
              { l: 'Email', v: dbData?.email || '—' },
              { l: 'Role', v: 'Instructor' },
              { l: 'Joined', v: joinDate },
              { l: 'Account ID', v: dbData?._id ? '#' + dbData._id.toString().slice(-8).toUpperCase() : '—' },
            ].map((row, i, arr) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
                <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '.68rem', color: C.t2 }}>{row.l}</span>
                <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '.68rem', color: '#ede8ff', fontWeight: 600 }}>{row.v}</span>
              </div>
            ))}
          </div>

          {/* Courses */}
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.62rem', color: C.t2, marginBottom: 10, letterSpacing: '.08em' }}>COURSES ({instructor.courses?.length || 0})</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 22 }}>
            {!(instructor.courses?.length) ? (
              <div style={{ textAlign: 'center', padding: '18px', color: C.t2, fontFamily: 'DM Mono,monospace', fontSize: '.72rem', background: 'rgba(255,255,255,.02)', borderRadius: 10 }}>No courses yet</div>
            ) : instructor.courses.map((c, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                {c.thumbnail
                  ? <img src={c.thumbnail.startsWith('http') ? c.thumbnail : API_BASE + c.thumbnail} alt="" style={{ width: 44, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: 44, height: 32, borderRadius: 6, background: col + '18', display: 'grid', placeItems: 'center', fontSize: '.9rem', flexShrink: 0 }}>{c.emoji || '📘'}</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.78rem', fontWeight: 600, color: '#ede8ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</div>
                  <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.58rem', color: C.t2, marginTop: 2 }}>{c.enrolledStudents || 0} students · ₹{c.price || 0} · {c.category || '—'}</div>
                </div>
                <div style={{ padding: '2px 7px', borderRadius: 5, fontSize: '.58rem', fontFamily: 'DM Mono,monospace', fontWeight: 700, background: c.status === 'published' ? C.tl + '18' : C.cr + '18', color: c.status === 'published' ? C.tl : C.cr, border: '1px solid ' + (c.status === 'published' ? C.tl + '28' : C.cr + '28'), flexShrink: 0 }}>
                  {(c.status || 'draft').toUpperCase()}
                </div>
              </div>
            ))}
          </div>

          {/* Delete action */}
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)}
              style={{ width: '100%', padding: '10px', background: 'rgba(255,107,157,.07)', border: '1px solid rgba(255,107,157,.2)', borderRadius: 10, color: C.cr, cursor: 'pointer', fontFamily: 'DM Mono,monospace', fontSize: '.78rem', fontWeight: 700, transition: 'all .2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,157,.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,107,157,.07)'}>
              🗑 Remove Instructor
            </button>
          ) : (
            <div style={{ background: 'rgba(255,107,157,.07)', border: '1px solid rgba(255,107,157,.22)', borderRadius: 10, padding: '14px' }}>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.72rem', color: C.cr, marginBottom: 10, textAlign: 'center' }}>⚠ Confirm remove "{instructor.name}"?</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, color: C.t2, cursor: 'pointer', fontFamily: 'DM Mono,monospace', fontSize: '.75rem' }}>Cancel</button>
                <button onClick={handleDelete} style={{ flex: 1, padding: '8px', background: 'rgba(255,107,157,.18)', border: '1px solid rgba(255,107,157,.35)', borderRadius: 8, color: C.cr, cursor: 'pointer', fontFamily: 'DM Mono,monospace', fontSize: '.75rem', fontWeight: 700 }}>Yes, Remove</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ADD INSTRUCTOR MODAL
══════════════════════════════════════════════ */
function AddInstructorModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const submit = async () => {
    if (!form.name || !form.email || !form.password) { setErr('All fields required'); return; }
    setLoading(true); setErr('');
    try {
      const res = await authService.createInstructor(form);
      if (res.success) { onSuccess(); onClose(); }
      else setErr(res.message || 'Failed');
    } catch { setErr('Server error'); }
    finally { setLoading(false); }
  };
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,8,20,.7)', backdropFilter: 'blur(6px)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: 420, background: 'linear-gradient(180deg,#0d1128,#080d1e)', border: '1px solid rgba(124,47,255,.25)', borderRadius: 20, padding: '32px 28px', zIndex: 1 }}>
        <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '1.15rem', fontWeight: 700, color: '#ede8ff', marginBottom: 6 }}>Add Instructor</div>
        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.65rem', color: C.t2, marginBottom: 24 }}>Create a new instructor account</div>
        {['name', 'email', 'password'].map(field => (
          <div key={field} style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.6rem', color: C.t2, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.08em' }}>{field}</div>
            <input type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
              value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
              placeholder={field === 'name' ? 'John Doe' : field === 'email' ? 'john@example.com' : '••••••••'}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, color: '#ede8ff', fontSize: '.84rem', fontFamily: 'DM Mono,monospace', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = 'rgba(124,47,255,.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.1)'} />
          </div>
        ))}
        {err && <div style={{ color: C.cr, fontFamily: 'DM Mono,monospace', fontSize: '.72rem', marginBottom: 14 }}>⚠ {err}</div>}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, color: C.t2, cursor: 'pointer', fontSize: '.82rem', fontFamily: 'DM Mono,monospace' }}>Cancel</button>
          <button onClick={submit} disabled={loading} style={{ flex: 2, padding: '10px', background: 'linear-gradient(135deg,#7c2fff,#8b5cf6)', border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontSize: '.84rem', fontFamily: 'DM Mono,monospace', fontWeight: 700, opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating…' : '+ Create Instructor'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function InstructorsPage() {
  const bgRef = useRef(null);
  useBg(bgRef);
  const gsap = useGSAP();

  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = ['overview', 'list', 'analytics'];
  const tab = validTabs.includes(searchParams.get('tab')) ? searchParams.get('tab') : 'overview';
  const setTab = t => setSearchParams({ tab: t }, { replace: true });

  const [courses, setCourses] = useState([]);
  const [dbInstructors, setDbInstructors] = useState([]); // real DB instructor records
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('revenue');
  const [drawer, setDrawer] = useState(null);
  const [toast, setToast] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [coursesRes, instRes] = await Promise.allSettled([
        fetch(`${API_BASE}/api/courses/all-instructors`, { headers: authH() }).then(r => r.json()),
        fetch(`${API_BASE}/api/auth/instructors`, { headers: authH() }).then(r => r.json()),
      ]);
      if (coursesRes.status === 'fulfilled' && coursesRes.value.success) setCourses(coursesRes.value.data || []);
      if (instRes.status === 'fulfilled' && instRes.value.success) setDbInstructors(instRes.value.data || []);
    } catch (_) {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ── Derive instructors ── */
  const instructors = (() => {
    const map = {};
    (courses || []).forEach(c => {
      const name = c.instructor?.name || 'Admin';
      // Use instructor.id if present, else adminId, else name as fallback
      const id = c.instructor?.id || (c.adminId ? c.adminId.toString() : name);
      if (!map[id]) map[id] = { id, name, courses: [], totalRevenue: 0, totalStudents: 0, totalCourses: 0, publishedCourses: 0, draftCourses: 0, ratings: [] };
      // Keep most recent name (in case same admin has different name spellings)
      map[id].name = name;
      map[id].courses.push(c);
      map[id].totalCourses++;
      map[id].totalRevenue += (c.price || 0) * (c.enrolledStudents || 0);
      map[id].totalStudents += c.enrolledStudents || 0;
      if (c.status === 'published') map[id].publishedCourses++;
      else map[id].draftCourses++;
      if (c.rating) map[id].ratings.push(c.rating);
    });
    return Object.values(map).map(inst => {
      // Find matching DB record for avatar
      const dbRec = dbInstructors.find(d =>
        d._id?.toString() === inst.id?.toString() ||
        d.name?.toLowerCase() === inst.name?.toLowerCase()
      );
      return {
        ...inst,
        avatar: dbRec?.avatar || null,
        email: dbRec?.email || null,
        createdAt: dbRec?.createdAt || null,
        avgRating: inst.ratings.length ? inst.ratings.reduce((a, b) => a + b, 0) / inst.ratings.length : 0,
        sparkline: [0, 1, 2, 3, 4, 5].map(i => Math.max(0, inst.totalRevenue * (0.3 + Math.random() * 0.7) * (i / 5))),
      };
    });
  })();

  const sorted = [...instructors].sort((a, b) => {
    if (sortBy === 'revenue')  return b.totalRevenue - a.totalRevenue;
    if (sortBy === 'courses')  return b.totalCourses - a.totalCourses;
    if (sortBy === 'students') return b.totalStudents - a.totalStudents;
    if (sortBy === 'rating')   return b.avgRating - a.avgRating;
    return 0;
  });

  const filtered = sorted.filter(i => !search || (i.name || '').toLowerCase().includes(search.toLowerCase()));

  const totalRevenue  = instructors.reduce((a, i) => a + i.totalRevenue, 0);
  const totalCourses  = instructors.reduce((a, i) => a + i.totalCourses, 0);
  const totalStudents = instructors.reduce((a, i) => a + i.totalStudents, 0);

  const KPI = [
    { l: 'Total Instructors', v: instructors.length, prefix: '', suffix: '', dec: 0, delta: '+' + instructors.length, up: true, c: C.em, g: GR.em, ico: '👨‍🏫' },
    { l: 'Total Revenue',     v: totalRevenue,       prefix: '₹', suffix: '', dec: 0, delta: '+18.4%', up: true, c: C.gd, g: GR.gd, ico: '💰' },
    { l: 'Total Courses',     v: totalCourses,       prefix: '', suffix: '', dec: 0, delta: '+' + totalCourses, up: true, c: C.tl, g: GR.tl, ico: '📚' },
    { l: 'Total Students',    v: totalStudents,      prefix: '', suffix: '', dec: 0, delta: '+12.6%', up: true, c: C.ind, g: GR.ind, ico: '👥' },
  ];

  useEffect(() => {
    if (!gsap) return;
    gsap.fromTo('.sb-logo',  { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.1 });
    gsap.fromTo('.sb-item',  { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.05, ease: 'power3.out', delay: 0.18 });
    gsap.fromTo('.topbar',   { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out', delay: 0.12 });
    gsap.fromTo('.kpi-card', { opacity: 0, y: 26, scale: 0.93 }, { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.38 });
    gsap.fromTo('.inst-card', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: 'power3.out', delay: 0.55 });
  }, [gsap, tab]);

  const TABS = [
    { id: 'overview',  l: 'Overview' },
    { id: 'list',      l: 'All Instructors', count: instructors.length, cc: C.em },
    { id: 'analytics', l: 'Analytics' },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: C.bg }}>
      <canvas ref={bgRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
      <div className="bg-grid" />
      <div className="orb" style={{ width: 500, height: 500, top: '-10%', right: '-4%', background: 'radial-gradient(circle,rgba(124,47,255,.08),transparent 65%)', position: 'fixed', zIndex: 0 }} />
      <div className="orb" style={{ width: 380, height: 380, bottom: '8%', left: '12%', background: 'radial-gradient(circle,rgba(13,217,196,.06),transparent 65%)', position: 'fixed', zIndex: 0, animationDelay: '2.5s' }} />

      <Sidebar />

      <div className="main-content">
        <div className="topbar">
          <div>
            <div className="topbar-title">Instructors</div>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.62rem', color: C.t3 }}>Course Creators · Performance Dashboard</div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 3, padding: '3px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
            {['revenue', 'courses', 'students', 'rating'].map(s => (
              <button key={s} onClick={() => setSortBy(s)} style={{ padding: '6px 12px', borderRadius: 9, border: 'none', fontSize: '.72rem', fontFamily: 'DM Mono,monospace', cursor: 'pointer', transition: 'all .2s', background: sortBy === s ? GR.em : 'transparent', color: sortBy === s ? '#fff' : C.t2, fontWeight: sortBy === s ? 700 : 500, textTransform: 'capitalize' }}>{s}</button>
            ))}
          </div>
          <button className="btn-sec" style={{ fontSize: '.8rem' }} onClick={() => showToast('Report exported!')}>📥 Export</button>
          <button className="btn-primary" style={{ fontSize: '.8rem', padding: '9px 18px' }} onClick={fetchData}>🔄 Refresh</button>
          <button className="btn-primary" style={{ fontSize: '.8rem', padding: '9px 18px', background: 'linear-gradient(135deg,#7c2fff,#8b5cf6)' }} onClick={() => setShowAddModal(true)}>+ Add Instructor</button>
        </div>

        <div style={{ padding: '24px 32px', position: 'relative', zIndex: 1 }}>
          {/* KPI */}
          <div className="kpi-grid">
            {KPI.map((k, i) => (
              <div key={i} className="kpi-card" style={{ '--g': k.g }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: k.c + '14', border: '1px solid ' + k.c + '22', display: 'grid', placeItems: 'center', fontSize: '1.05rem' }}>{k.ico}</div>
                  <div className={'kpi-delta ' + (k.up ? 'up' : 'down')}>{k.up ? '↑' : '↓'} {k.delta}</div>
                </div>
                <div className="kpi-val" style={{ color: k.c }}><Count to={k.v} prefix={k.prefix} suffix={k.suffix} dec={k.dec} /></div>
                <div className="kpi-label">{k.l}</div>
                <div style={{ marginTop: 10, height: 3, borderRadius: 99, background: 'rgba(255,255,255,.05)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: (55 + i * 10) + '%', background: k.g, borderRadius: 99, animation: 'progFill 1.2s ' + (i * 0.15) + 's ease both' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="page-tabs">
            {TABS.map(t => (
              <div key={t.id} className={'page-tab' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>
                {t.l}
                {t.count !== undefined && (
                  <div className="tab-count" style={{ background: tab === t.id ? t.cc + '18' : 'rgba(255,255,255,.04)', border: '1px solid ' + (tab === t.id ? t.cc + '28' : 'rgba(255,255,255,.07)'), color: tab === t.id ? t.cc : C.t2 }}>{t.count}</div>
                )}
              </div>
            ))}
          </div>

          {/* ══ OVERVIEW ══ */}
          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
              <div className="inst-chart-card">
                <div className="inst-chart-title">Revenue by Instructor</div>
                <div style={{ marginTop: 12 }}><BarChart instructors={sorted} /></div>
              </div>
              <div className="inst-chart-card">
                <div className="inst-chart-title">Course Distribution</div>
                <div style={{ marginTop: 16 }}><Donut instructors={sorted} /></div>
              </div>
              <div className="inst-chart-card" style={{ gridColumn: '1 / -1' }}>
                <div className="inst-chart-title">Top Performers</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12, marginTop: 14 }}>
                  {sorted.slice(0, 4).map((inst, i) => {
                    const col = ACOLS[i % ACOLS.length];
                    return (
                      <div key={inst.id} className="inst-card" onClick={() => setDrawer(inst)}
                        style={{ cursor: 'pointer', background: 'rgba(255,255,255,.03)', border: '1px solid ' + col + '22', borderRadius: 14, padding: '16px', transition: 'all .2s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = col + '0a'; e.currentTarget.style.borderColor = col + '44'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.03)'; e.currentTarget.style.borderColor = col + '22'; }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                          <Avatar name={inst.name} size={38} avatarUrl={inst.avatar} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '.85rem', color: '#ede8ff' }}>{inst.name}</div>
                            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.6rem', color: C.t2 }}>{inst.totalCourses} courses</div>
                          </div>
                          <div style={{ marginLeft: 'auto', fontFamily: 'DM Mono,monospace', fontSize: '.65rem', color: col, fontWeight: 700 }}>#{i + 1}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <div>
                            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.58rem', color: C.t2 }}>Revenue</div>
                            <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '.9rem', fontWeight: 700, color: col }}>₹{inst.totalRevenue >= 1000 ? (inst.totalRevenue / 1000).toFixed(1) + 'K' : inst.totalRevenue}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.58rem', color: C.t2 }}>Students</div>
                            <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '.9rem', fontWeight: 700, color: '#ede8ff' }}>{(inst.totalStudents || 0).toLocaleString()}</div>
                          </div>
                        </div>
                        <Sparkline data={inst.sparkline} color={col} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══ LIST ══ */}
          {tab === 'list' && (
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: C.t2, fontSize: '.85rem' }}>🔍</span>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search instructors…"
                    style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 9, paddingBottom: 9, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, color: '#ede8ff', fontSize: '.82rem', fontFamily: 'DM Mono,monospace', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.7rem', color: C.t2, display: 'flex', alignItems: 'center' }}>{filtered.length} instructors</div>
              </div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: C.t2, fontFamily: 'DM Mono,monospace' }}>Loading…</div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: C.t2, fontFamily: 'DM Mono,monospace' }}>No instructors found</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 16 }}>
                  {filtered.map((inst, i) => {
                    const col = ACOLS[i % ACOLS.length];
                    return (
                      <div key={inst.id} className="inst-card" onClick={() => setDrawer(inst)}
                        style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 16, padding: '20px', cursor: 'pointer', transition: 'all .22s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = col + '08'; e.currentTarget.style.borderColor = col + '33'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)'; e.currentTarget.style.transform = 'none'; }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                          <Avatar name={inst.name} size={46} avatarUrl={inst.avatar} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: 'Clash Display,sans-serif', fontWeight: 700, fontSize: '.95rem', color: '#ede8ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inst.name}</div>
                            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.6rem', color: C.t2, marginTop: 2 }}>{inst.totalCourses} courses · {(inst.totalStudents || 0).toLocaleString()} students</div>
                          </div>
                          <div style={{ padding: '4px 10px', borderRadius: 8, background: col + '14', border: '1px solid ' + col + '28', fontFamily: 'DM Mono,monospace', fontSize: '.62rem', color: col, fontWeight: 700 }}>{inst.publishedCourses} live</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                          {[
                            { l: 'Revenue', v: '₹' + (inst.totalRevenue >= 1000 ? (inst.totalRevenue / 1000).toFixed(1) + 'K' : inst.totalRevenue), c: C.gd },
                            { l: 'Students', v: inst.totalStudents >= 1000 ? (inst.totalStudents / 1000).toFixed(1) + 'K' : inst.totalStudents, c: C.tl },
                            { l: 'Rating', v: inst.avgRating ? inst.avgRating.toFixed(1) + '★' : 'N/A', c: C.vt },
                          ].map((s, j) => (
                            <div key={j} style={{ background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.55rem', color: C.t2, marginBottom: 3 }}>{s.l}</div>
                              <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '.85rem', fontWeight: 700, color: s.c }}>{s.v}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Sparkline data={inst.sparkline} color={col} />
                          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.62rem', color: C.t2 }}>View Details →</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ ANALYTICS ══ */}
          {tab === 'analytics' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
              <div className="inst-chart-card" style={{ gridColumn: '1 / -1' }}>
                <div className="inst-chart-title">Revenue Leaderboard</div>
                <div style={{ marginTop: 16 }}>
                  {sorted.map((inst, i) => {
                    const col = [C.gd, C.em, C.tl, C.ind, C.cr, C.vt][i % 6];
                    const maxRev = sorted[0]?.totalRevenue || 1;
                    const pct = (inst.totalRevenue / maxRev) * 100;
                    return (
                      <div key={inst.id} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14, cursor: 'pointer' }} onClick={() => setDrawer(inst)}>
                        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.7rem', color: C.t2, width: 20, textAlign: 'right' }}>#{i + 1}</div>
                        <Avatar name={inst.name} size={34} avatarUrl={inst.avatar} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: '.82rem', fontWeight: 600, color: '#ede8ff' }}>{inst.name}</span>
                            <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '.72rem', color: col, fontWeight: 700 }}>₹{inst.totalRevenue >= 1000 ? (inst.totalRevenue / 1000).toFixed(1) + 'K' : inst.totalRevenue}</span>
                          </div>
                          <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,.05)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: pct + '%', background: col, borderRadius: 99, animation: 'progFill 1s ' + (i * 0.1) + 's ease both', boxShadow: '0 0 8px ' + col + '66' }} />
                          </div>
                        </div>
                        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.65rem', color: C.t2, width: 60, textAlign: 'right' }}>{inst.totalCourses} courses</div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="inst-chart-card">
                <div className="inst-chart-title">Published vs Draft</div>
                <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {sorted.slice(0, 5).map((inst, i) => {
                    const total = inst.totalCourses || 1;
                    const pubPct = (inst.publishedCourses / total) * 100;
                    return (
                      <div key={inst.id}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: '.75rem', color: '#ede8ff' }}>{(inst.name || '').split(' ')[0]}</span>
                          <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '.65rem', color: C.t2 }}>{inst.publishedCourses}/{inst.totalCourses}</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,.05)', overflow: 'hidden', display: 'flex' }}>
                          <div style={{ height: '100%', width: pubPct + '%', background: GR.tl, borderRadius: 99, animation: 'progFill 1s ' + (i * 0.1) + 's ease both' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="inst-chart-card">
                <div className="inst-chart-title">Student Distribution</div>
                <div style={{ marginTop: 16 }}>
                  <Donut instructors={sorted.map(i => ({ ...i, totalCourses: i.totalStudents }))} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {drawer && <Drawer instructor={drawer} onClose={() => setDrawer(null)} onDelete={fetchData} onToast={showToast} />}
      {showAddModal && <AddInstructorModal onClose={() => setShowAddModal(false)} onSuccess={() => { showToast('Instructor created!'); fetchData(); }} />}

      {toast && (
        <div className="toast">
          <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(124,47,255,.14)', border: '1px solid rgba(124,47,255,.28)', display: 'grid', placeItems: 'center', fontSize: '.82rem', flexShrink: 0 }}>✓</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '.84rem', marginBottom: 1 }}>Done</div>
            <div style={{ fontSize: '.76rem', color: C.t2 }}>{toast}</div>
          </div>
        </div>
      )}
    </div>
  );
}
