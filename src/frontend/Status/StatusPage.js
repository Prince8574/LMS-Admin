import { useState, useEffect } from 'react';
import { Sidebar } from '../../components/Sidebar';

const API = 'http://localhost:5000/api/status';

const STATUS_COLOR = { ok: '#4ade80', fail: '#ef4444', unknown: '#4d7a9e' };

function UptimeBar({ days = [] }) {
  const [tooltip, setTooltip] = useState(null);

  const bars = Array.from({ length: 90 }, (_, i) => {
    const d = days[i];
    if (!d) return { color: 'rgba(255,255,255,.06)', tip: null, date: null };
    const pct = d.uptime ?? 0;
    const color = pct >= 99 ? '#4ade80' : pct >= 90 ? '#f59e0b' : '#ef4444';
    const msg = pct >= 99 ? 'No downtime recorded on this day.' : pct >= 90 ? `${100 - pct}% downtime recorded.` : `Significant downtime — ${pct}% uptime.`;
    return { color, tip: msg, date: d.date };
  });

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 32 }}>
        {bars.map((b, i) => (
          <div key={i}
            style={{ flex: 1, height: '100%', borderRadius: 2, background: b.color, cursor: b.date ? 'pointer' : 'default', transition: 'opacity .15s' }}
            onMouseEnter={e => {
              if (!b.date) return;
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltip({ msg: b.tip, date: b.date, x: rect.left, y: rect.top });
            }}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed', left: tooltip.x, top: tooltip.y - 60,
          background: '#0f172a', border: '1px solid rgba(255,255,255,.12)',
          borderRadius: 8, padding: '8px 12px', zIndex: 9999,
          pointerEvents: 'none', minWidth: 200, boxShadow: '0 8px 24px rgba(0,0,0,.5)',
        }}>
          <div style={{ fontSize: '.72rem', fontWeight: 700, color: '#ede8ff', marginBottom: 3 }}>{tooltip.date}</div>
          <div style={{ fontSize: '.72rem', color: '#4d7a9e' }}>{tooltip.msg}</div>
        </div>
      )}
    </div>
  );
}

export default function StatusPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}?days=90`);
      const data = await res.json();
      if (data.success) {
        setServices(data.data);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Status fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 60000); // refresh every 1 min
    return () => clearInterval(id);
  }, []);

        const allOk = services.length > 0 && services.every(s => s.currentStatus === 'ok');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050814' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', marginLeft: 240 }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.12em', color: '#4d7a9e', marginBottom: 6 }}>SYSTEM</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ede8ff', margin: 0 }}>System Status</h1>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 99,
                background: loading ? 'rgba(245,158,11,.1)' : services.length === 0 ? 'rgba(77,122,158,.1)' : allOk ? 'rgba(74,222,128,.1)' : 'rgba(239,68,68,.1)',
                border: `1px solid ${loading ? 'rgba(245,158,11,.25)' : services.length === 0 ? 'rgba(77,122,158,.25)' : allOk ? 'rgba(74,222,128,.25)' : 'rgba(239,68,68,.25)'}`,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: loading ? '#f59e0b' : services.length === 0 ? '#4d7a9e' : allOk ? '#4ade80' : '#ef4444', boxShadow: `0 0 6px ${allOk ? '#4ade80' : '#f59e0b'}` }} />
                <span style={{ fontSize: '.78rem', fontWeight: 700, color: allOk ? '#4ade80' : loading ? '#f59e0b' : services.length === 0 ? '#4d7a9e' : '#ef4444' }}>
                  {loading ? 'Checking...' : services.length === 0 ? 'Awaiting Data' : allOk ? 'All Systems Operational' : 'Some Systems Degraded'}
                </span>
              </div>
            </div>
            {lastUpdated && (
              <span style={{ fontSize: '.72rem', color: '#4d7a9e' }}>Updated {lastUpdated}</span>
            )}
          </div>
        </div>

        {/* Services */}
        {loading ? (
          <div style={{ color: '#4d7a9e', textAlign: 'center', padding: '60px 0' }}>Loading status data...</div>
        ) : services.length === 0 ? (
          <div style={{ color: '#4d7a9e', textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '2rem', marginBottom: 12 }}>📊</div>
            <div>No data yet — health checks run every 30 seconds</div>
            <div style={{ fontSize: '.75rem', marginTop: 8 }}>Data will appear after the first check completes</div>
          </div>
        ) : (() => {
          const infra    = services.filter(s => !s.service.includes('Admin —') && !s.service.includes('Student —'));
          const adminSvcs   = services.filter(s => s.service.startsWith('Admin —'));
          const studentSvcs = services.filter(s => s.service.startsWith('Student —'));

          const ServiceCard = ({ svc }) => {
            const isOk = svc.currentStatus === 'ok';
            return (
              <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 14, padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: isOk ? '#4ade80' : '#ef4444', boxShadow: `0 0 5px ${isOk ? '#4ade80' : '#ef4444'}` }} />
                    <span style={{ fontSize: '.82rem', fontWeight: 700, color: '#ede8ff' }}>{svc.service.replace('Admin — ', '').replace('Student — ', '')}</span>
                    {svc.latency && <span style={{ fontSize: '.62rem', fontFamily: 'monospace', color: svc.latency < 200 ? '#4ade80' : svc.latency < 500 ? '#f59e0b' : '#ef4444', background: 'rgba(255,255,255,.05)', padding: '1px 6px', borderRadius: 99 }}>{svc.latency}ms</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '.68rem', color: '#4d7a9e' }}>{svc.uptime90d !== undefined ? `${svc.uptime90d}%` : ''}</span>
                    <span style={{ fontSize: '.72rem', fontWeight: 700, color: isOk ? '#4ade80' : '#ef4444' }}>{isOk ? 'Operational' : 'Offline'}</span>
                  </div>
                </div>
                <UptimeBar days={svc.dailyHistory || []} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, fontSize: '.62rem', color: '#4d7a9e' }}>
                  <span>90 days ago</span>
                  <span>{svc.message || ''}</span>
                  <span>Today</span>
                </div>
              </div>
            );
          };

          return (
            <div>
              {/* Infrastructure */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: '.68rem', fontWeight: 800, letterSpacing: '.12em', color: '#4d7a9e', marginBottom: 12 }}>INFRASTRUCTURE</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {infra.map(svc => <ServiceCard key={svc.service} svc={svc} />)}
                </div>
              </div>

              {/* Two column grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Admin Panel */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ fontSize: '.68rem', fontWeight: 800, letterSpacing: '.12em', color: '#7c2fff' }}>⚙ ADMIN PANEL</div>
                    <div style={{ flex: 1, height: 1, background: 'rgba(124,47,255,.2)' }} />
                    <span style={{ fontSize: '.62rem', color: '#4d7a9e' }}>:5000</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {adminSvcs.map(svc => <ServiceCard key={svc.service} svc={svc} />)}
                  </div>
                </div>

                {/* Student Panel */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ fontSize: '.68rem', fontWeight: 800, letterSpacing: '.12em', color: '#f0a500' }}>🎓 STUDENT PANEL</div>
                    <div style={{ flex: 1, height: 1, background: 'rgba(240,165,0,.2)' }} />
                    <span style={{ fontSize: '.62rem', color: '#4d7a9e' }}>:5001</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {studentSvcs.map(svc => <ServiceCard key={svc.service} svc={svc} />)}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}
