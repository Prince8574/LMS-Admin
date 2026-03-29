import { C, MONTHS, REV_DATA, EXP_DATA, ACOLS } from '../constants';

/* ── Animated counter ── */
import { useState, useRef, useEffect } from 'react';

export function Count({ to, prefix = '', suffix = '', dec = 0 }) {
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
          const ease = 1 - Math.pow(1 - p, 4);
          setV(to * ease);
          if (p < 1) requestAnimationFrame(tick); else setV(to);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: .3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);

  const fmt = n => dec ? n.toFixed(dec) : n >= 1e7 ? (n / 1e7).toFixed(1) + 'Cr' : n >= 1e5 ? (n / 1e5).toFixed(1) + 'L' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : Math.round(n).toLocaleString();
  return <span ref={ref}>{prefix}{fmt(v)}{suffix}</span>;
}

/* ── Revenue Line Chart ── */
export function RevenueLineChart() {
  const maxV = Math.max(...REV_DATA, ...EXP_DATA);
  const W = 520, H = 150, PX = 16, PY = 12;
  const iw = W - PX * 2, ih = H - PY * 2;
  const xStep = iw / (REV_DATA.length - 1);
  const toX = i => PX + i * xStep;
  const toY = v => H - PY - (v / maxV) * ih;
  const revPoints = REV_DATA.map((v, i) => [toX(i), toY(v)]);
  const expPoints = EXP_DATA.map((v, i) => [toX(i), toY(v)]);
  const toPolyline = pts => pts.map(p => p[0] + ',' + p[1]).join(' ');
  const toArea = pts => 'M ' + pts[0][0] + ',' + pts[0][1] + ' ' + pts.slice(1).map(p => 'L' + p[0] + ',' + p[1]).join(' ') + ' L' + pts[pts.length - 1][0] + ',' + (H - PY) + ' L' + pts[0][0] + ',' + (H - PY) + ' Z';

  return (
    <svg viewBox={'0 0 ' + W + ' ' + H} width="100%" height={H} style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.gd} stopOpacity="0.28" />
          <stop offset="100%" stopColor={C.gd} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.cr} stopOpacity="0.14" />
          <stop offset="100%" stopColor={C.cr} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="revLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={C.gd} />
          <stop offset="100%" stopColor={C.tl} />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <line key={i} x1={PX} y1={PY + ih * (1 - f)} x2={W - PX} y2={PY + ih * (1 - f)} stroke="rgba(255,255,255,.04)" strokeWidth="1" />
      ))}
      <path d={toArea(revPoints)} fill="url(#revGrad)" />
      <path d={toArea(expPoints)} fill="url(#expGrad)" />
      <polyline points={toPolyline(expPoints)} fill="none" stroke={C.cr} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="600" strokeDashoffset="600" style={{ animation: 'lineDraw 1.8s .3s ease forwards' }} />
      <polyline points={toPolyline(revPoints)} fill="none" stroke="url(#revLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="600" strokeDashoffset="600" style={{ animation: 'lineDraw 1.8s ease forwards' }} />
      {revPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === revPoints.length - 1 ? 5 : 3.5} fill={C.gd}
          style={{ filter: 'drop-shadow(0 0 5px ' + C.gd + '99)', opacity: 0, animation: 'countUp .4s ' + (.8 + i * .1) + 's ease both' }} />
      ))}
      {MONTHS.map((m, i) => (
        <text key={m} x={toX(i)} y={H + 14} textAnchor="middle" fill="rgba(255,255,255,.22)" fontSize="9.5" fontFamily="DM Mono,monospace">{m}</text>
      ))}
    </svg>
  );
}

/* ── Bar Chart ── */
export function BarChartComp() {
  const CATS = ['Dev', 'Design', 'Data', 'Cloud', 'Biz', 'Other'];
  const VALS = [42, 24, 19, 9, 4, 2];
  const COLS = [C.gd, C.tl, C.ind, C.vt, C.cr, C.t2];
  const maxV = 42;
  const barW = 28, gap = 24, H = 120, baseY = 100;

  return (
    <svg viewBox="0 0 320 130" width="100%" height={130} style={{ display: 'block' }}>
      {VALS.map((v, i) => {
        const x = i * (barW + gap) + barW / 2 + 8;
        const bh = (v / maxV) * 80;
        const y = baseY - bh;
        return (
          <g key={i}>
            <rect x={x - barW / 2} y={y} width={barW} height={bh} rx={6} fill={COLS[i]} opacity=".88"
              style={{ transformOrigin: x + 'px ' + baseY + 'px', animation: 'barRise .7s ' + (i * .09) + 's ease both' }} />
            <text x={x} y={y - 4} textAnchor="middle" fill={COLS[i]} fontSize="9" fontFamily="DM Mono,monospace" fontWeight="700">{v}%</text>
            <text x={x} y={116} textAnchor="middle" fill="rgba(255,255,255,.22)" fontSize="8.5" fontFamily="DM Mono,monospace">{CATS[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Donut Chart ── */
export function DonutChartComp({ items }) {
  const total = items.reduce((a, d) => a + d.pct, 0);
  const r = 40, cx = 60, cy = 60, circ = 2 * Math.PI * r;
  let off = 0;
  const slices = items.map((d, i) => {
    const dash = (d.pct / total) * circ;
    const gap = circ - dash;
    const el = (
      <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.col}
        strokeWidth="14" strokeLinecap="round"
        strokeDasharray={dash + ' ' + gap}
        strokeDashoffset={-off}
        transform="rotate(-90,60,60)"
        style={{ filter: 'drop-shadow(0 0 5px ' + d.col + '66)' }} />
    );
    off += dash;
    return el;
  });

  return (
    <svg viewBox="0 0 120 120" width={120} height={120} style={{ display: 'block' }}>
      {slices}
      <circle cx={cx} cy={cy} r={26} fill="rgba(7,16,28,.97)" />
      <text x={cx} y={cy + 3} textAnchor="middle" fill="white" fontSize="10" fontFamily="Clash Display,sans-serif" fontWeight="700">100%</text>
      <text x={cx} y={cy + 13} textAnchor="middle" fill="rgba(255,255,255,.28)" fontSize="7" fontFamily="DM Mono,monospace">SHARE</text>
    </svg>
  );
}
