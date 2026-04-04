import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as THREE from 'three';
import { Sidebar } from '../../components/Sidebar';
import { Count, RevenueLineChart, BarChartComp, DonutChartComp } from './components/Charts';
import { TxDrawer } from './components/TxDrawer';
import { revenueService } from './revenueService';
import {
  C, GR, ACOLS, MONTHS, REV_DATA,
  TRANSACTIONS, PAYOUTS, COURSES_REV, PAYMENT_METHODS, STATUS_MAP
} from './constants';
import './Revenue.css';
import { createSafeRenderer } from '../../utils/safeWebGL';

/* ─── Three.js BG ─── */
function useBg(ref) {
  useEffect(() => {
    if (!ref.current) return;
    const R = createSafeRenderer(THREE, ref.current);
    if (!R) return;
    R.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    R.setSize(window.innerWidth, window.innerHeight);
    const S = new THREE.Scene();
    const CAM = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 600);
    CAM.position.z = 52;

    const mkPts = (n, sp, sz, op, col) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(n * 3);
      for (let i = 0; i < n; i++) {
        pos[i * 3] = (Math.random() - .5) * sp;
        pos[i * 3 + 1] = (Math.random() - .5) * sp * .6;
        pos[i * 3 + 2] = (Math.random() - .5) * 90;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      return new THREE.Points(geo, new THREE.PointsMaterial({ color: col || 0xffffff, size: sz, transparent: true, opacity: op, sizeAttenuation: true }));
    };
    [mkPts(2200, 300, .05, .1), mkPts(300, 200, .09, .06, 0xf5c842), mkPts(240, 220, .08, .05, 0x0dd9c4), mkPts(180, 180, .07, .05, 0x6979f8), mkPts(120, 190, .06, .04, 0xff6154)].forEach(p => S.add(p));

    const rings = [
      { col: 0xf5c842, r: 22, t: .06, rx: .4, rz: .2, ry: .0006 },
      { col: 0x0dd9c4, r: 36, t: .05, rx: .9, rz: .5, ry: .0004 },
      { col: 0x6979f8, r: 16, t: .04, rx: 1.3, rz: .9, ry: .0007 },
      { col: 0xb47eff, r: 46, t: .035, rx: .6, rz: 1.2, ry: .0003 },
      { col: 0xff6154, r: 30, t: .04, rx: 1.0, rz: .4, ry: .0005 },
    ];
    const RM = rings.map(({ col, r, t, rx, rz, ry }) => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, 8, 120), new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: .013 }));
      m.rotation.x = rx; m.rotation.z = rz; m.userData = { ry, rz2: .00015 };
      S.add(m); return m;
    });

    const shapes = [
      { col: 0xf5c842, sz: 3.2, geo: 'ico' }, { col: 0x0dd9c4, sz: 2.5, geo: 'oct' },
      { col: 0x6979f8, sz: 1.9, geo: 'tet' }, { col: 0xb47eff, sz: 3.0, geo: 'dod' },
      { col: 0xff6154, sz: 1.6, geo: 'tet' }, { col: 0xf5c842, sz: 3.4, geo: 'ico' },
    ];
    const SM = shapes.map(({ col, sz, geo }, i) => {
      let g;
      if (geo === 'ico') g = new THREE.IcosahedronGeometry(sz, 0);
      else if (geo === 'oct') g = new THREE.OctahedronGeometry(sz, 0);
      else if (geo === 'tet') g = new THREE.TetrahedronGeometry(sz, 0);
      else g = new THREE.DodecahedronGeometry(sz, 0);
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: .034 + i * .006 }));
      m.position.set((Math.random() - .5) * 110, (Math.random() - .5) * 80, (Math.random() - .5) * 40 - 10);
      m.userData = { rx: (Math.random() - .5) * .008, ry: (Math.random() - .5) * .01, fy: Math.random() * Math.PI * 2, sp: .07 + Math.random() * .1 };
      S.add(m); return m;
    });

    const hero = new THREE.Mesh(new THREE.IcosahedronGeometry(6.5, 1), new THREE.MeshBasicMaterial({ color: 0xf5c842, wireframe: true, transparent: true, opacity: .045 }));
    hero.position.set(18, 0, -14); S.add(hero);

    let pmx = 0, pmy = 0, t = 0, raf;
    const onM = e => { pmx = (e.clientX / window.innerWidth - .5) * 2; pmy = -(e.clientY / window.innerHeight - .5) * 2; };
    const onR = () => { CAM.aspect = window.innerWidth / window.innerHeight; CAM.updateProjectionMatrix(); R.setSize(window.innerWidth, window.innerHeight); };
    window.addEventListener('mousemove', onM); window.addEventListener('resize', onR);

    const loop = () => {
      raf = requestAnimationFrame(loop); t += .004;
      RM.forEach(m => { m.rotation.y += m.userData.ry; m.rotation.z += m.userData.rz2; });
      SM.forEach(m => { m.rotation.x += m.userData.rx; m.rotation.y += m.userData.ry; m.position.y += Math.sin(t * m.userData.sp + m.userData.fy) * .006; });
      hero.rotation.x += .002; hero.rotation.y += .005;
      CAM.position.x += (pmx * 3.5 - CAM.position.x) * .022;
      CAM.position.y += (pmy * 2.2 - CAM.position.y) * .022;
      CAM.lookAt(0, 0, 0); R.render(S, CAM);
    };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('mousemove', onM); window.removeEventListener('resize', onR); R.dispose(); };
  }, []);
}

/* ─── GSAP ─── */
function useGSAP() {
  const [g, setG] = useState(null);
  useEffect(() => {
    if (window.gsap) { setG(window.gsap); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    s.onload = () => { setG(window.gsap); };
    document.head.appendChild(s);
  }, []);
  return g;
}

/* ═══════════════════════ MAIN ═══════════════════════ */
export default function RevenuePage() {
  const bgRef = useRef(null);
  useBg(bgRef);
  const gsap = useGSAP();

  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = ['overview', 'transactions', 'payouts', 'courses', 'analytics'];
  const tabParam = searchParams.get('tab');
  const tab = validTabs.includes(tabParam) ? tabParam : 'overview';
  const setTab = (t) => setSearchParams({ tab: t }, { replace: true });
  const [txDrawer, setTxDrawer]     = useState(null);
  const [toast, setToast]           = useState(null);
  const [period, setPeriod]         = useState('Month');
  const [txFilter, setTxFilter]     = useState('all');
  const [txSearch, setTxSearch]     = useState('');
  const [sortCourse, setSortCourse] = useState('revenue');

  // ── API state ──────────────────────────────────────────
  const [stats, setStats]           = useState(null);
  const [transactions, setTxs]      = useState(TRANSACTIONS); // fallback to static
  const [payouts, setPayouts]       = useState(PAYOUTS);
  const [courseRevenue, setCourseRev] = useState(COURSES_REV);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  // Fetch from API, fallback to static data on error
  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, txRes, payRes, courseRes] = await Promise.allSettled([
        revenueService.getStats(),
        revenueService.getTransactions({ status: txFilter !== 'all' ? txFilter : undefined, search: txSearch }),
        revenueService.getPayouts(),
        revenueService.getCourseRevenue(sortCourse),
      ]);
      if (statsRes.status === 'fulfilled')  setStats(statsRes.value.data);
      if (txRes.status === 'fulfilled'  && txRes.value.data?.length)  setTxs(txRes.value.data);
      if (payRes.status === 'fulfilled' && payRes.value.data?.length) setPayouts(payRes.value.data);
      if (courseRes.status === 'fulfilled' && courseRes.value.data?.length) setCourseRev(courseRes.value.data);
    } catch (_) { /* keep static fallback */ }
  }, [txFilter, txSearch, sortCourse]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (!gsap) return;
    gsap.fromTo('.sb-logo',  { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: .5, ease: 'power3.out', delay: .1 });
    gsap.fromTo('.sb-item',  { opacity: 0, x: -18 }, { opacity: 1, x: 0, duration: .4, stagger: .05, ease: 'power3.out', delay: .18 });
    gsap.fromTo('.topbar',   { opacity: 0, y: -18 }, { opacity: 1, y: 0, duration: .5, ease: 'power3.out', delay: .12 });
    gsap.fromTo('.kpi-card', { opacity: 0, y: 26, scale: .93 }, { opacity: 1, y: 0, scale: 1, duration: .6, stagger: .1, ease: 'power3.out', delay: .38 });
    gsap.fromTo('.page-tabs',{ opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .4, ease: 'power2.out', delay: .5 });
  }, [gsap]);

  const filteredTx = transactions.filter(t => {
    const sf = txFilter === 'all' || t.status === txFilter;
    const qf = !txSearch || (t.student || t.studentName || '').toLowerCase().includes(txSearch.toLowerCase()) || (t.course || t.courseTitle || '').toLowerCase().includes(txSearch.toLowerCase()) || (t.id || t.txId || '').toLowerCase().includes(txSearch.toLowerCase());
    return sf && qf;
  });

  const sortedCourses = [...courseRevenue].sort((a, b) => {
    if (sortCourse === 'revenue')  return (b.revNum || b.revenue || 0) - (a.revNum || a.revenue || 0);
    if (sortCourse === 'students') return (b.students || 0) - (a.students || 0);
    if (sortCourse === 'growth')   return parseInt(b.growth || 0) - parseInt(a.growth || 0);
    if (sortCourse === 'rating')   return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  const TABS = [
    { id: 'overview',     l: 'Overview',     count: null },
    { id: 'transactions', l: 'Transactions', count: transactions.length, cc: C.gd },
    { id: 'payouts',      l: 'Payouts',      count: payouts.filter(p => p.status === 'scheduled').length, cc: C.tl },
    { id: 'courses',      l: 'By Course',    count: courseRevenue.length, cc: C.ind },
    { id: 'analytics',    l: 'Analytics',    count: null },
  ];

  const KPI = [
    { l: 'Total Revenue',      v: stats?.totalRevenue      || 8426000, prefix: '₹', suffix: '', dec: 0, delta: '+18.7%', up: true,  c: C.gd,  g: GR.gd,  ico: '💰' },
    { l: 'Net Instructor Pay', v: stats?.netInstructorPay  || 6740000, prefix: '₹', suffix: '', dec: 0, delta: '+16.2%', up: true,  c: C.tl,  g: GR.tl,  ico: '👨‍🏫' },
    { l: 'Platform Earnings',  v: stats?.platformEarnings  || 1686000, prefix: '₹', suffix: '', dec: 0, delta: '+24.1%', up: true,  c: C.ind, g: GR.ind, ico: '⬡' },
    { l: 'Refund Rate',        v: stats?.refundRate        || 2.4,     prefix: '',  suffix: '%',dec: 1, delta: '-0.8%',  up: true,  c: C.cr,  g: GR.cr,  ico: '↩' },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: C.bg }}>
      <canvas ref={bgRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
      <div className="bg-grid" />
      <div className="orb" style={{ width: 500, height: 500, top: '-10%', right: '-4%', background: 'radial-gradient(circle,rgba(245,200,66,.08),transparent 65%)', position: 'fixed', zIndex: 0 }} />
      <div className="orb" style={{ width: 380, height: 380, bottom: '8%', left: '12%', background: 'radial-gradient(circle,rgba(13,217,196,.06),transparent 65%)', position: 'fixed', zIndex: 0, animationDelay: '2.5s' }} />
      <div className="orb" style={{ width: 260, height: 260, top: '45%', left: '-4%', background: 'radial-gradient(circle,rgba(105,121,248,.05),transparent 65%)', position: 'fixed', zIndex: 0, animationDelay: '1s' }} />

      {/* ── SIDEBAR ── */}
      <Sidebar />

      {/* ── MAIN ── */}
      <div className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div>
            <div className="topbar-title">Revenue</div>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.62rem', color: C.t3 }}>Aurora Gold · Financial Dashboard</div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 3, padding: '3px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
            {['Week', 'Month', 'Quarter', 'Year'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{ padding: '6px 14px', borderRadius: 9, border: 'none', fontSize: '.75rem', fontFamily: 'DM Mono,monospace', cursor: 'pointer', transition: 'all .2s', background: period === p ? GR.gd : 'transparent', color: period === p ? '#04070f' : C.t2, fontWeight: period === p ? 800 : 500 }}>{p}</button>
            ))}
          </div>
          <button className="btn-sec" style={{ fontSize: '.8rem' }} onClick={() => showToast('Revenue report exported!')}>📥 Export</button>
          <button className="btn-primary" style={{ fontSize: '.8rem', padding: '9px 18px' }} onClick={async () => {
            try {
              const res = await revenueService.processAllPayouts();
              showToast(`${res.affected || 0} payouts processed!`);
              fetchAll();
            } catch (e) { showToast('Error: ' + e.message); }
          }}>💸 Run Payouts</button>
        </div>

        <div style={{ padding: '24px 32px', position: 'relative', zIndex: 1 }}>
          {/* KPI Cards */}
          <div className="kpi-grid">
            {KPI.map((k, i) => (
              <div key={i} className="kpi-card" style={{ '--g': k.g, animationDelay: (i * .09) + 's' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: k.c + '14', border: '1px solid ' + k.c + '22', display: 'grid', placeItems: 'center', fontSize: '1.05rem' }}>{k.ico}</div>
                  <div className={'kpi-delta ' + (k.up ? 'up' : 'down')}>{k.up ? '↑' : '↓'} {k.delta}</div>
                </div>
                <div className="kpi-val" style={{ color: k.c }}><Count to={k.v} prefix={k.prefix} suffix={k.suffix} dec={k.dec} /></div>
                <div className="kpi-label">{k.l}</div>
                <div style={{ marginTop: 10, height: 3, borderRadius: 99, background: 'rgba(255,255,255,.05)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: (60 + i * 8) + '%', background: k.g, borderRadius: 99, animation: 'progFill 1.2s ' + (i * .15) + 's ease both' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="page-tabs">
            {TABS.map(t => (
              <div key={t.id} className={'page-tab' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>
                {t.l}
                {t.count !== null && (
                  <div className="tab-count" style={{ background: tab === t.id ? t.cc + '18' : 'rgba(255,255,255,.04)', border: '1px solid ' + (tab === t.id ? t.cc + '28' : 'rgba(255,255,255,.07)'), color: tab === t.id ? t.cc : C.t2 }}>{t.count}</div>
                )}
              </div>
            ))}
          </div>

          {/* ══ TAB: OVERVIEW ══ */}
          {tab === 'overview' && <OverviewTab setTab={setTab} showToast={showToast} setTxDrawer={setTxDrawer} />}

          {/* ══ TAB: TRANSACTIONS ══ */}
          {tab === 'transactions' && (
            <TransactionsTab
              filteredTx={filteredTx} txFilter={txFilter} setTxFilter={setTxFilter}
              txSearch={txSearch} setTxSearch={setTxSearch}
              setTxDrawer={setTxDrawer} showToast={showToast}
            />
          )}

          {/* ══ TAB: PAYOUTS ══ */}
          {tab === 'payouts' && <PayoutsTab payouts={payouts} showToast={showToast} onRefresh={fetchAll} />}

          {/* ══ TAB: BY COURSE ══ */}
          {tab === 'courses' && <CoursesTab sortedCourses={sortedCourses} sortCourse={sortCourse} setSortCourse={setSortCourse} period={period} showToast={showToast} />}

          {/* ══ TAB: ANALYTICS ══ */}
          {tab === 'analytics' && <AnalyticsTab showToast={showToast} />}
        </div>
      </div>

      {txDrawer && <TxDrawer tx={txDrawer} onClose={() => setTxDrawer(null)} onToast={showToast} />}

      {toast && (
        <div className="toast">
          <div style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(245,200,66,.14)', border: '1px solid rgba(245,200,66,.28)', display: 'grid', placeItems: 'center', fontSize: '.82rem', flexShrink: 0 }}>✓</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '.84rem', marginBottom: 1 }}>Done</div>
            <div style={{ fontSize: '.76rem', color: C.t2 }}>{toast}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════
   SUB-COMPONENTS (tabs)
══════════════════════════════ */

function OverviewTab({ setTab, showToast, setTxDrawer }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 16 }}>
        {/* Revenue chart */}
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <div className="chart-title">Revenue vs Expenses</div>
              <div className="chart-sub">Last 8 months · Platform gross</div>
            </div>
            <div style={{ display: 'flex', gap: 14 }}>
              {[{ c: C.gd, l: 'Revenue' }, { c: C.cr, l: 'Expenses' }].map(({ c, l }) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'DM Mono,monospace', fontSize: '.68rem', color: C.t2 }}>
                  <div style={{ width: 10, height: 3, borderRadius: 99, background: c }} />{l}
                </div>
              ))}
            </div>
          </div>
          <RevenueLineChart />
          <div style={{ display: 'flex', marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.05)' }}>
            {MONTHS.map((m, i) => (
              <div key={m} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '.7rem', fontWeight: 700, color: i === MONTHS.length - 1 ? C.gd : C.t2 }}>₹{REV_DATA[i] / 10}L</div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.55rem', color: C.t3, marginTop: 1 }}>{m}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment methods donut */}
        <div className="chart-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="chart-title" style={{ marginBottom: 4 }}>Payment Methods</div>
          <div className="chart-sub" style={{ marginBottom: 16 }}>Distribution this month</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <DonutChartComp items={PAYMENT_METHODS} />
          </div>
          {PAYMENT_METHODS.map((p, i) => (
            <div key={p.method} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: ACOLS[i], flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: '.82rem' }}>{p.method}</div>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.74rem', fontWeight: 700, color: ACOLS[i] }}>{p.pct}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Second row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="chart-card">
          <div className="chart-title" style={{ marginBottom: 4 }}>Revenue by Category</div>
          <div className="chart-sub" style={{ marginBottom: 14 }}>% of total</div>
          <BarChartComp />
        </div>

        <div className="chart-card">
          <div className="chart-title" style={{ marginBottom: 4 }}>MRR Breakdown</div>
          <div className="chart-sub" style={{ marginBottom: 16 }}>Monthly recurring revenue</div>
          {[
            { l: 'New MRR', v: '₹2.8L', pct: 38, c: C.gd },
            { l: 'Expansion', v: '₹1.9L', pct: 26, c: C.tl },
            { l: 'Reactivation', v: '₹1.1L', pct: 15, c: C.ind },
            { l: 'Contraction', v: '–₹0.4L', pct: 5, c: C.cr },
            { l: 'Churn', v: '–₹0.7L', pct: 9, c: C.vt },
          ].map(({ l, v, pct, c }) => (
            <div key={l} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '.8rem' }}>
                <span style={{ color: C.t2 }}>{l}</span>
                <span style={{ fontFamily: 'DM Mono,monospace', fontWeight: 700, color: c }}>{v}</span>
              </div>
              <div className="prog-bar"><div className="prog-fill" style={{ width: pct + '%', background: 'linear-gradient(90deg,' + c + ',' + c + '88)' }} /></div>
            </div>
          ))}
        </div>

        <div className="chart-card">
          <div className="chart-title" style={{ marginBottom: 4 }}>Key Metrics</div>
          <div className="chart-sub" style={{ marginBottom: 16 }}>Platform financial health</div>
          {[
            { l: 'Avg Order Value', v: '₹4,820', c: C.gd, ico: '📦' },
            { l: 'Avg LTV', v: '₹12,400', c: C.tl, ico: '📈' },
            { l: 'Conversion Rate', v: '8.4%', c: C.ind, ico: '🎯' },
            { l: 'Gross Margin', v: '80%', c: C.gd, ico: '💎' },
            { l: 'CAC', v: '₹842', c: C.vt, ico: '👤' },
            { l: 'Payback Period', v: '2.4 mo', c: C.cr, ico: '⏱' },
          ].map(({ l, v, c, ico }) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.04)' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: c + '12', border: '1px solid ' + c + '20', display: 'grid', placeItems: 'center', fontSize: '.78rem', flexShrink: 0 }}>{ico}</div>
              <div style={{ flex: 1, fontSize: '.82rem', color: C.t2 }}>{l}</div>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.82rem', fontWeight: 700, color: c }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="chart-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div className="chart-title">Recent Transactions</div>
            <div className="chart-sub">Last 5 transactions</div>
          </div>
          <button className="btn-sec" style={{ fontSize: '.76rem', padding: '6px 14px' }} onClick={() => setTab('transactions')}>View All →</button>
        </div>
        <table className="tx-table" style={{ width: '100%' }}>
          <thead><tr><th>STUDENT</th><th>COURSE</th><th>AMOUNT</th><th>METHOD</th><th>STATUS</th><th>TIME</th></tr></thead>
          <tbody>
            {TRANSACTIONS.slice(0, 5).map((t, i) => {
              const sm = STATUS_MAP[t.status];
              return (
                <tr key={t.id} className="tx-row" style={{ animationDelay: (i * .05) + 's' }} onClick={() => setTxDrawer(t)}>
                  <td className="tx-td" style={{ fontWeight: 600, fontSize: '.85rem' }}>{t.student}</td>
                  <td className="tx-td" style={{ fontSize: '.78rem', color: C.t2, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.course}</td>
                  <td className="tx-td" style={{ fontFamily: 'DM Mono,monospace', fontWeight: 700, color: C.gd }}>₹{t.amount.toLocaleString()}</td>
                  <td className="tx-td" style={{ fontFamily: 'DM Mono,monospace', fontSize: '.75rem', color: C.t2 }}>{t.method}</td>
                  <td className="tx-td"><div className={'badge ' + sm.cls}><div style={{ width: 4, height: 4, borderRadius: '50%', background: sm.dot }} />{t.status.toUpperCase()}</div></td>
                  <td className="tx-td" style={{ fontFamily: 'DM Mono,monospace', fontSize: '.72rem', color: C.t3 }}>{t.time}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TransactionsTab({ filteredTx, txFilter, setTxFilter, txSearch, setTxSearch, setTxDrawer, showToast }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 14px', borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', flex: 1, maxWidth: 340 }}>
          <span style={{ color: C.t3, fontSize: '.88rem' }}>⌕</span>
          <input placeholder="Search by student, course, ID…" value={txSearch} onChange={e => setTxSearch(e.target.value)} style={{ background: 'none', border: 'none', outline: 'none', color: C.text, fontSize: '.84rem', flex: 1 }} />
          {txSearch && <button onClick={() => setTxSearch('')} style={{ background: 'none', border: 'none', color: C.t3, cursor: 'pointer', fontSize: '.8rem' }}>✕</button>}
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {['all', 'success', 'pending', 'failed', 'refunded', 'processing'].map(s => (
            <button key={s} onClick={() => setTxFilter(s)} style={{ padding: '6px 13px', borderRadius: 99, border: '1px solid', fontSize: '.72rem', cursor: 'pointer', transition: 'all .2s', fontFamily: 'DM Mono,monospace', fontWeight: txFilter === s ? 700 : 500, background: txFilter === s ? (STATUS_MAP[s]?.dot || C.gd) + '18' : 'transparent', borderColor: txFilter === s ? (STATUS_MAP[s]?.dot || C.gd) : 'rgba(255,255,255,.07)', color: txFilter === s ? (STATUS_MAP[s]?.dot || C.gd) : C.t2, textTransform: 'capitalize' }}>{s === 'all' ? 'All' : s}</button>
          ))}
        </div>
        <button className="btn-sec" style={{ marginLeft: 'auto', fontSize: '.78rem' }} onClick={() => showToast('CSV exported!')}>📥 Export CSV</button>
      </div>

      <div style={{ background: 'rgba(7,16,28,.97)', borderRadius: 20, border: '1px solid rgba(255,255,255,.07)', overflow: 'hidden' }}>
        <table className="tx-table" style={{ width: '100%' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,.06)' }}>
              <th>TX ID</th><th>STUDENT</th><th>COURSE</th><th>GROSS</th><th>PLATFORM FEE</th><th>NET PAYOUT</th><th>METHOD</th><th>STATUS</th><th>TIME</th><th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredTx.map((t, i) => {
              const sm = STATUS_MAP[t.status];
              return (
                <tr key={t.id || t.txId || i} className="tx-row" style={{ animationDelay: (i * .04) + 's' }} onClick={() => setTxDrawer(t)}>
                  <td className="tx-td" style={{ fontFamily: 'DM Mono,monospace', fontSize: '.72rem', color: C.t2 }}>{t.id || t.txId}</td>
                  <td className="tx-td" style={{ fontWeight: 600, fontSize: '.85rem' }}>{t.student || t.studentName}</td>
                  <td className="tx-td" style={{ fontSize: '.78rem', color: C.t2, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.course || t.courseTitle}</td>
                  <td className="tx-td" style={{ fontFamily: 'DM Mono,monospace', fontWeight: 700, color: C.gd }}>₹{t.amount.toLocaleString()}</td>
                  <td className="tx-td" style={{ fontFamily: 'DM Mono,monospace', fontSize: '.78rem', color: C.cr }}>–₹{t.fee.toLocaleString()}</td>
                  <td className="tx-td" style={{ fontFamily: 'DM Mono,monospace', fontWeight: 700, color: C.tl }}>₹{t.net.toLocaleString()}</td>
                  <td className="tx-td" style={{ fontFamily: 'DM Mono,monospace', fontSize: '.75rem', color: C.t2 }}>{t.method}</td>
                  <td className="tx-td"><div className={'badge ' + sm.cls}><div style={{ width: 4, height: 4, borderRadius: '50%', background: sm.dot }} />{t.status}</div></td>
                  <td className="tx-td" style={{ fontFamily: 'DM Mono,monospace', fontSize: '.72rem', color: C.t3 }}>{t.time || (t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN') : '—')}</td>
                  <td className="tx-td">
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn-icon" style={{ width: 28, height: 28, fontSize: '.78rem' }} onClick={e => { e.stopPropagation(); setTxDrawer(t); }}>👁</button>
                      <button className="btn-icon" style={{ width: 28, height: 28, fontSize: '.78rem' }} onClick={e => { e.stopPropagation(); showToast('Receipt downloaded!'); }}>📥</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredTx.length === 0 && (
          <div style={{ padding: '50px 20px', textAlign: 'center', color: C.t2 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>🔍</div>
            <div style={{ fontWeight: 700 }}>No transactions found</div>
          </div>
        )}
      </div>
    </div>
  );
}

function PayoutsTab({ payouts, showToast, onRefresh }) {
  const scheduled = payouts.filter(p => p.status === 'scheduled');
  const paid      = payouts.filter(p => p.status === 'paid');
  const pending   = payouts.filter(p => p.status === 'pending');

  const scheduledTotal = scheduled.reduce((s, p) => s + (p.amount || 0), 0);
  const paidTotal      = paid.reduce((s, p) => s + (p.amount || 0), 0);
  const pendingTotal   = pending.reduce((s, p) => s + (p.amount || 0), 0);

  const fmt = v => typeof v === 'number' ? '₹' + v.toLocaleString() : v;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 22 }}>
        {[
          { l: 'Scheduled Payouts', v: scheduledTotal ? fmt(scheduledTotal) : '₹2,48,800', sub: 'Next batch', c: C.gd, g: GR.gd },
          { l: 'Total Paid (March)', v: paidTotal ? fmt(paidTotal) : '₹3,64,200', sub: paid.length + ' batches done', c: C.tl, g: GR.tl },
          { l: 'Pending Approval',  v: pendingTotal ? fmt(pendingTotal) : '₹44,800', sub: pending.length + ' instructor(s)', c: C.ind, g: GR.ind },
        ].map((s, i) => (
          <div key={i} className="kpi-card" style={{ '--g': s.g, animationDelay: (i * .08) + 's', padding: '18px 20px' }}>
            <div className="kpi-val" style={{ color: s.c, fontSize: '1.6rem' }}>{s.v}</div>
            <div className="kpi-label">{s.l}</div>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.62rem', color: s.c, marginTop: 5 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '1rem', fontWeight: 700 }}>Instructor Payouts</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-sec" style={{ fontSize: '.78rem' }} onClick={() => showToast('Export done!')}>📥 Export</button>
          <button className="btn-primary" style={{ fontSize: '.78rem', padding: '8px 18px' }} onClick={async () => {
            try {
              const res = await revenueService.processAllPayouts();
              showToast(`${res.affected || 0} payouts processed!`);
              onRefresh && onRefresh();
            } catch (e) { showToast('Error: ' + e.message); }
          }}>💸 Process All</button>
        </div>
      </div>

      {payouts.map((p, i) => (
        <div key={i} className="payout-row" style={{ animationDelay: (i * .07) + 's' }}>
          <div className="payout-av" style={{ background: p.col || GR.gd }}>{p.av || (p.instructorName || p.name || '?').slice(0,2).toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: '.9rem', marginBottom: 2 }}>{p.instructorName || p.name}</div>
            <div style={{ fontSize: '.76rem', color: C.t2, marginBottom: 5 }}>{p.role}</div>
            <div style={{ display: 'flex', gap: 12, fontFamily: 'DM Mono,monospace', fontSize: '.64rem', color: C.t3 }}>
              <span>📚 {p.courses} courses</span>
              <span>👥 {(p.students || 0).toLocaleString()} students</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, marginRight: 12 }}>
            <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '1.15rem', fontWeight: 700, color: C.gd, marginBottom: 5 }}>
              {typeof p.amount === 'number' ? '₹' + p.amount.toLocaleString() : p.amount}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, alignItems: 'center' }}>
              <div className={'badge ' + (p.status === 'paid' ? 'badge-success' : p.status === 'scheduled' ? 'badge-pending' : 'badge-processing')}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'currentColor' }} />{p.status.toUpperCase()}
              </div>
              {p.status !== 'paid' && <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.6rem', color: C.t3, padding: '2px 7px', borderRadius: 6, background: 'rgba(255,255,255,.04)', border: '1px solid ' + C.bord }}>{p.date || p.scheduledDate}</div>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            {p.status === 'scheduled' && <button className="btn-primary" style={{ fontSize: '.74rem', padding: '7px 14px' }} onClick={() => showToast('Payout sent to ' + (p.instructorName || p.name) + '!')}>💸 Pay Now</button>}
            {p.status === 'pending'   && <button className="btn-sec" style={{ fontSize: '.74rem', padding: '7px 14px', borderColor: 'rgba(13,217,196,.3)', color: C.tl }} onClick={() => showToast((p.instructorName || p.name) + ' payout approved!')}>✓ Approve</button>}
            <button className="btn-icon" style={{ width: 30, height: 30, fontSize: '.78rem' }} onClick={() => showToast('Receipt downloaded!')}>📥</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CoursesTab({ sortedCourses, sortCourse, setSortCourse, period, showToast }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '1.05rem', fontWeight: 700, marginBottom: 3 }}>Revenue by Course</div>
          <div style={{ fontSize: '.78rem', color: C.t2 }}>{COURSES_REV.length} courses · {period} performance</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '.65rem', color: C.t3 }}>Sort by:</span>
          {['revenue', 'students', 'growth', 'rating'].map(s => (
            <button key={s} onClick={() => setSortCourse(s)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid', fontSize: '.72rem', cursor: 'pointer', transition: 'all .2s', fontFamily: 'DM Mono,monospace', fontWeight: sortCourse === s ? 700 : 500, background: sortCourse === s ? 'rgba(245,200,66,.12)' : 'transparent', borderColor: sortCourse === s ? C.gd : 'rgba(255,255,255,.08)', color: sortCourse === s ? C.gd : C.t2, textTransform: 'capitalize' }}>{s}</button>
          ))}
          <button className="btn-sec" style={{ fontSize: '.76rem', padding: '6px 14px', marginLeft: 8 }} onClick={() => showToast('Course revenue exported!')}>📥 Export</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 22 }}>
        {[
          { l: 'Total Course Revenue', v: '₹10.8L', sub: 'Across 6 top courses', c: C.gd, ico: '💰' },
          { l: 'Best Performer', v: 'ML A–Z', sub: '₹3.7L this month', c: C.tl, ico: '🏆' },
          { l: 'Fastest Growing', v: 'K8s+Docker', sub: '+31% this month', c: C.ind, ico: '🚀' },
        ].map(({ l, v, sub, c, ico }, i) => (
          <div key={i} style={{ padding: '16px 18px', borderRadius: 16, background: 'rgba(7,16,28,.97)', border: '1px solid rgba(255,255,255,.06)', display: 'flex', gap: 12, alignItems: 'center', animation: 'cardIn .4s ' + (i * .07) + 's ease both' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: c + '14', border: '1px solid ' + c + '22', display: 'grid', placeItems: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{ico}</div>
            <div>
              <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '1.1rem', fontWeight: 700, color: c, marginBottom: 2 }}>{v}</div>
              <div style={{ fontSize: '.76rem', fontWeight: 600, marginBottom: 1 }}>{l}</div>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.62rem', color: C.t3 }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 24 }}>
        {sortedCourses.map((course, i) => {
          const rank = COURSES_REV.findIndex(c => c.title === course.title) + 1;
          return (
            <div key={course.title} className="course-rev-card" style={{ '--cg': course.g, animationDelay: (i * .07) + 's' }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  <div className="rank-badge" style={{ background: rank <= 3 ? course.col + '20' : 'rgba(255,255,255,.06)', border: '1px solid ' + (rank <= 3 ? course.col + '35' : 'rgba(255,255,255,.08)'), color: rank <= 3 ? course.col : C.t2 }}>
                    {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : '#' + rank}
                  </div>
                  <div style={{ width: 44, height: 44, borderRadius: 13, background: course.col + '16', border: '1px solid ' + course.col + '26', display: 'grid', placeItems: 'center', fontSize: '1.3rem' }}>{course.emoji}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '.95rem', fontWeight: 700, letterSpacing: '-.02em', marginBottom: 3, lineHeight: 1.3 }}>{course.title}</div>
                  <div style={{ fontSize: '.76rem', color: C.t2, marginBottom: 10 }}><span style={{ marginRight: 6 }}>👨‍🏫</span>{course.instructor}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {[{ l: 'Revenue', v: course.rev, c: C.gd }, { l: 'Students', v: course.students.toLocaleString(), c: C.tl }, { l: 'Rating', v: '⭐ ' + course.rating, c: C.vt }].map(({ l, v, c }) => (
                      <div key={l} style={{ padding: '8px 10px', borderRadius: 10, background: c + '0d', border: '1px solid ' + c + '1e', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '.88rem', fontWeight: 700, color: c }}>{v}</div>
                        <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.55rem', color: C.t3, marginTop: 2, letterSpacing: '.06em' }}>{l.toUpperCase()}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <div className="kpi-delta up" style={{ marginBottom: 8 }}>↑ {course.growth}</div>
                  <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.65rem', color: C.t3 }}>this month</div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontFamily: 'DM Mono,monospace', fontSize: '.62rem' }}>
                  <span style={{ color: C.t2 }}>Revenue share</span>
                  <span style={{ color: course.col, fontWeight: 700 }}>{course.share}%</span>
                </div>
                <div className="prog-bar"><div className="prog-fill" style={{ width: course.share + '%', background: 'linear-gradient(90deg,' + course.col + ',' + course.col + '88)' }} /></div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,.05)' }}>
                <button className="btn-sec" style={{ fontSize: '.74rem', padding: '6px 12px' }} onClick={() => showToast(course.title + ' analytics opened!')}>📊 Analytics</button>
                <button className="btn-sec" style={{ fontSize: '.74rem', padding: '6px 12px' }} onClick={() => showToast('Course report exported!')}>📥 Report</button>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'DM Mono,monospace', fontSize: '.65rem', color: C.t3 }}>
                  <span>Rank</span>
                  <div style={{ width: 22, height: 22, borderRadius: 7, background: course.col + '16', border: '1px solid ' + course.col + '28', display: 'grid', placeItems: 'center', fontWeight: 700, color: course.col, fontSize: '.7rem' }}>#{rank}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary table */}
      <div className="chart-card">
        <div style={{ marginBottom: 16 }}>
          <div className="chart-title">All Courses — Revenue Table</div>
          <div className="chart-sub">Sorted by: {sortCourse}</div>
        </div>
        <table className="tx-table" style={{ width: '100%' }}>
          <thead><tr><th>RANK</th><th>COURSE</th><th>INSTRUCTOR</th><th>REVENUE</th><th>STUDENTS</th><th>GROWTH</th><th>RATING</th><th>SHARE</th></tr></thead>
          <tbody>
            {sortedCourses.map((c, i) => {
              const rank = COURSES_REV.findIndex(x => x.title === c.title) + 1;
              return (
                <tr key={c.title} className="tx-row" style={{ animationDelay: (i * .05) + 's' }}>
                  <td className="tx-td"><div style={{ width: 28, height: 28, borderRadius: 8, background: c.col + '14', border: '1px solid ' + c.col + '22', display: 'grid', placeItems: 'center', fontFamily: 'Clash Display,sans-serif', fontSize: '.72rem', fontWeight: 700, color: c.col }}>#{rank}</div></td>
                  <td className="tx-td"><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div style={{ width: 34, height: 34, borderRadius: 10, background: c.col + '14', border: '1px solid ' + c.col + '22', display: 'grid', placeItems: 'center', fontSize: '1rem', flexShrink: 0 }}>{c.emoji}</div><div style={{ fontWeight: 600, fontSize: '.85rem' }}>{c.title}</div></div></td>
                  <td className="tx-td" style={{ fontSize: '.78rem', color: C.t2 }}>{c.instructor}</td>
                  <td className="tx-td" style={{ fontFamily: 'DM Mono,monospace', fontWeight: 700, color: C.gd, fontSize: '.88rem' }}>{c.rev}</td>
                  <td className="tx-td" style={{ fontFamily: 'DM Mono,monospace', fontSize: '.78rem', color: C.t2 }}>{c.students.toLocaleString()}</td>
                  <td className="tx-td"><div className="kpi-delta up">↑ {c.growth}</div></td>
                  <td className="tx-td" style={{ fontFamily: 'DM Mono,monospace', fontSize: '.78rem', color: C.vt }}>⭐ {c.rating}</td>
                  <td className="tx-td" style={{ minWidth: 130 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="prog-bar" style={{ flex: 1 }}><div className="prog-fill" style={{ width: c.share + '%', background: 'linear-gradient(90deg,' + c.col + ',' + c.col + '88)' }} /></div>
                      <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.66rem', color: c.col, fontWeight: 700, minWidth: 28 }}>{c.share}%</div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AnalyticsTab({ showToast }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {/* Forecast */}
      <div className="chart-card" style={{ gridColumn: '1/-1' }}>
        <div style={{ marginBottom: 16 }}>
          <div className="chart-title">Revenue Forecast — Q2 2026</div>
          <div className="chart-sub">AI-powered projection based on growth trends</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
          {[
            { month: 'April', projected: '₹8.9L', confidence: '92%', growth: '+20%', c: C.gd },
            { month: 'May', projected: '₹9.6L', confidence: '88%', growth: '+22%', c: C.tl },
            { month: 'June', projected: '₹10.8L', confidence: '82%', growth: '+28%', c: C.ind },
            { month: 'Q2 Total', projected: '₹29.3L', confidence: '87%', growth: '+23%', c: C.vt },
          ].map(({ month, projected, confidence, growth, c }) => (
            <div key={month} style={{ padding: '16px', borderRadius: 14, background: c + '0d', border: '1px solid ' + c + '1e', textAlign: 'center' }}>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.6rem', color: C.t3, marginBottom: 6, letterSpacing: '.08em' }}>{month.toUpperCase()}</div>
              <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '1.3rem', fontWeight: 700, color: c, marginBottom: 6 }}>{projected}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
                <div className="kpi-delta up">↑ {growth}</div>
                <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.6rem', color: C.t2, padding: '3px 7px', borderRadius: 99, background: 'rgba(255,255,255,.04)', border: '1px solid ' + C.bord }}>{confidence}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cohort */}
      <div className="chart-card">
        <div className="chart-title" style={{ marginBottom: 4 }}>Revenue Cohort Retention</div>
        <div className="chart-sub" style={{ marginBottom: 16 }}>Monthly cohort revenue retention %</div>
        {[
          { cohort: 'Jan 2026', vals: ['100%', '68%', '52%', '41%'] },
          { cohort: 'Feb 2026', vals: ['100%', '72%', '58%', '—'] },
          { cohort: 'Mar 2026', vals: ['100%', '75%', '—', '—'] },
        ].map(({ cohort, vals }) => (
          <div key={cohort} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.62rem', color: C.t2, width: 72, flexShrink: 0 }}>{cohort}</div>
            {vals.map((v, i) => {
              const num = parseInt(v) || 0;
              return <div key={i} style={{ flex: 1, padding: '6px', borderRadius: 8, textAlign: 'center', fontFamily: 'DM Mono,monospace', fontSize: '.72rem', fontWeight: 700, background: v === '—' ? 'rgba(255,255,255,.02)' : 'rgba(245,200,66,' + (num / 400 + .04) + ')', color: v === '—' ? C.t3 : 'rgba(245,200,66,' + (num / 150 + .4) + ')', border: '1px solid rgba(255,255,255,.05)' }}>{v}</div>;
            })}
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <div style={{ width: 72, flexShrink: 0 }} />
          {['M1', 'M2', 'M3', 'M4'].map(m => <div key={m} style={{ flex: 1, textAlign: 'center', fontFamily: 'DM Mono,monospace', fontSize: '.6rem', color: C.t3 }}>{m}</div>)}
        </div>
      </div>

      {/* Refund analysis */}
      <div className="chart-card">
        <div className="chart-title" style={{ marginBottom: 4 }}>Refund Analysis</div>
        <div className="chart-sub" style={{ marginBottom: 16 }}>Reasons & volume</div>
        {[
          { reason: 'Content Quality', pct: 34, amount: '₹24K', c: C.cr },
          { reason: 'Technical Issues', pct: 28, amount: '₹20K', c: C.ind },
          { reason: 'Duplicate Purchase', pct: 18, amount: '₹13K', c: C.vt },
          { reason: 'Accidental Purchase', pct: 12, amount: '₹8.5K', c: C.gd },
          { reason: 'Other', pct: 8, amount: '₹5.8K', c: C.t2 },
        ].map(({ reason, pct, amount, c }) => (
          <div key={reason} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '.8rem' }}>
              <span style={{ color: C.t2 }}>{reason}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ fontFamily: 'DM Mono,monospace', fontWeight: 700, color: c }}>{pct}%</span>
                <span style={{ fontFamily: 'DM Mono,monospace', fontSize: '.72rem', color: C.t3 }}>{amount}</span>
              </div>
            </div>
            <div className="prog-bar"><div className="prog-fill" style={{ width: pct + '%', background: 'linear-gradient(90deg,' + c + ',' + c + '88)' }} /></div>
          </div>
        ))}
      </div>

      {/* Tax & compliance */}
      <div className="chart-card" style={{ gridColumn: '1/-1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div className="chart-title">Tax & Compliance</div>
            <div className="chart-sub">FY 2025–2026</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-sec" style={{ fontSize: '.76rem', padding: '6px 14px' }} onClick={() => showToast('Tax report exported!')}>📥 Download</button>
            <button className="btn-primary" style={{ fontSize: '.76rem', padding: '6px 14px' }} onClick={() => showToast('GST return filed!')}>File GST Return</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
          {[
            { l: 'Gross Revenue', v: '₹84.3L', sub: 'FY 2025-26', c: C.gd },
            { l: 'GST Collected', v: '₹15.2L', sub: '18% GST rate', c: C.ind },
            { l: 'TDS Deducted', v: '₹2.1L', sub: '10% on payouts', c: C.tl },
            { l: 'Platform Fees', v: '₹16.9L', sub: '20% of gross', c: C.vt },
            { l: 'Taxable Income', v: '₹50.1L', sub: 'After deductions', c: C.cr },
          ].map(({ l, v, sub, c }) => (
            <div key={l} style={{ padding: '14px 16px', borderRadius: 14, background: c + '0d', border: '1px solid ' + c + '20', textAlign: 'center' }}>
              <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '1.1rem', fontWeight: 700, color: c, marginBottom: 3 }}>{v}</div>
              <div style={{ fontSize: '.76rem', fontWeight: 600, marginBottom: 2 }}>{l}</div>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.6rem', color: C.t3 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
