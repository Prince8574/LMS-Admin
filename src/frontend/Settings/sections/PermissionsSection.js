import { useState } from 'react';

const C = {
  bg: "#050814", b1: "#080d1e", b2: "#0c1228",
  em: "#7c2fff", em2: "#b47eff",
  am: "#f02079", am2: "#fa7db8",
  ro: "#ff6b9d", ro2: "#ffacc7",
  cy: "#8b5cf6", cy2: "#c4b5fd",
  vt: "#e8187c", vt2: "#ff85c0",
  text: "#ede8ff", t2: "#6b5b8e", t3: "#1a1540",
  bord: "rgba(255,255,255,0.07)",
};

const GR = {
  em: "linear-gradient(135deg,#7c2fff,#8b5cf6)",
  am: "linear-gradient(135deg,#f02079,#ff6b9d)",
  cy: "linear-gradient(135deg,#8b5cf6,#e8187c)",
  ro: "linear-gradient(135deg,#ff6b9d,#f02079)",
};

const ROLES = [
  { name: 'Super Admin', desc: 'Full platform access', badge: C.ro, perms: ['courses', 'users', 'revenue', 'settings', 'moderation', 'instructors'] },
  { name: 'Moderator', desc: 'Content review only', badge: C.am, perms: ['courses', 'moderation'] },
  { name: 'Finance', desc: 'Revenue & billing', badge: C.em, perms: ['revenue'] },
  { name: 'Instructor', desc: 'Own courses only', badge: C.cy, perms: ['courses'] },
];

const PERM_MODULES = ['Courses', 'Users', 'Revenue', 'Settings', 'Moderation', 'Instructors', 'Analytics'];

const SectionCard = ({ id, icon, title, sub, color, g, children, delay = 0 }) => (
  <div className="section-card" style={{ animationDelay: `${delay}s` }}>
    <div className="section-card-head">
      <div className="section-icon" style={{ background: `${color}14`, border: `1px solid ${color}22` }}>{icon}</div>
      <div>
        <div className="section-title">{title}</div>
        <div className="section-sub">{sub}</div>
      </div>
      <div style={{ marginLeft: 'auto', height: 2, width: 40, background: g, borderRadius: 99, opacity: .6 }} />
    </div>
    <div className="section-body">{children}</div>
  </div>
);

export function PermissionsSection({ save }) {
  const [perms, setPerms] = useState(() => {
    const init = {};
    ROLES.forEach(r => {
      init[r.name] = {};
      PERM_MODULES.forEach(m => {
        init[r.name][m] = r.perms.includes(m.toLowerCase())
      })
    });
    return init;
  });

  return (
    <SectionCard id="permissions" icon="🛡️" title="Roles & Permissions" sub="Control access levels for each admin role" color={C.cy} g={GR.cy} delay={.12}>
      <div style={{ overflowX: 'auto' }}>
        <table className="perm-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ fontFamily: 'DM Mono,monospace', fontSize: '.6rem', letterSpacing: '.1em', color: '#193348', padding: '8px 14px', textAlign: 'left' }}>MODULE</th>
              {ROLES.map(r => (
                <th key={r.name} style={{ fontFamily: 'DM Mono,monospace', fontSize: '.6rem', letterSpacing: '.1em', color: '#193348', padding: '8px 14px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ padding: '2px 8px', borderRadius: 6, background: `${r.badge}18`, border: `1px solid ${r.badge}28`, color: r.badge }}>
                      {r.name.split(' ')[0].toUpperCase()}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERM_MODULES.map((mod, i) => (
              <tr key={mod} className="perm-row" style={{ animationDelay: `${i * .05}s` }}>
                <td className="perm-td">
                  <div style={{ fontWeight: 600, fontSize: '.84rem' }}>{mod}</div>
                </td>
                {ROLES.map(r => (
                  <td key={r.name} className="perm-td" style={{ textAlign: 'center' }}>
                    <label className="toggle" style={{ margin: '0 auto' }}>
                      <input
                        type="checkbox"
                        checked={perms[r.name]?.[mod] || false}
                        onChange={e => setPerms(p => ({ ...p, [r.name]: { ...p[r.name], [mod]: e.target.checked } }))}
                      />
                      <div className="toggle-slider" />
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 4 }}>
        {ROLES.map(r => (
          <div
            key={r.name}
            style={{ padding: '14px 16px', borderRadius: 14, background: 'rgba(8,11,26,.97)', border: `1px solid ${r.badge}22`, transition: 'all .22s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = `${r.badge}44`}
            onMouseLeave={e => e.currentTarget.style.borderColor = `${r.badge}22`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ padding: '3px 10px', borderRadius: 7, background: `${r.badge}18`, border: `1px solid ${r.badge}28`, fontFamily: 'DM Mono,monospace', fontSize: '.62rem', color: r.badge, fontWeight: 700 }}>
                {r.name.toUpperCase()}
              </div>
            </div>
            <div style={{ fontSize: '.78rem', color: C.t2, marginBottom: 8 }}>{r.desc}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {r.perms.map(p =>
                <div key={p} style={{ padding: '2px 8px', borderRadius: 5, background: `${r.badge}10`, fontFamily: 'DM Mono,monospace', fontSize: '.58rem', color: r.badge, textTransform: 'capitalize' }}>
                  {p}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-em" onClick={() => save('Permissions updated!')}>Save Permissions</button>
        <button className="btn-sec">Add New Role</button>
      </div>
    </SectionCard>
  );
}
