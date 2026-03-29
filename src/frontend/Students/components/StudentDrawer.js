const C = {
  em: "#7c2fff", am: "#f02079", ro: "#ff6b9d", cy: "#8b5cf6", vt: "#e8187c",
  text: "#ede8ff", t2: "#6b5b8e", t3: "#1a1540",
};
const GR = {
  em: "linear-gradient(135deg,#7c2fff,#8b5cf6)",
  am: "linear-gradient(135deg,#f02079,#ff6b9d)",
  cy: "linear-gradient(135deg,#8b5cf6,#e8187c)",
  ro: "linear-gradient(135deg,#ff6b9d,#f02079)",
  vt: "linear-gradient(135deg,#e8187c,#8b5cf6)",
};
const AVATAR_COLORS = [GR.em, GR.am, GR.cy, GR.ro, GR.vt];

function initials(name = "") {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function StudentDrawer({ student, onClose, onAction, onStatusChange }) {
  if (!student) return null;

  const colIdx = (student.name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  const col = AVATAR_COLORS[colIdx];
  const statusMap = { active: "badge-active", inactive: "badge-inactive", suspended: "badge-suspended" };

  const enrolledCount   = (student.enrolledCourses || []).length;
  const completedCount  = (student.completedCourses || []).length;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        {/* Header */}
        <div className="drawer-head">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: col, display: "grid", placeItems: "center", fontFamily: "Clash Display,sans-serif", fontSize: "1.3rem", fontWeight: 900, color: "#050814", boxShadow: "0 0 28px rgba(124,47,255,.4),inset 0 1px 0 rgba(255,255,255,.2)" }}>
                {initials(student.name)}
              </div>
              <div style={{ position: "absolute", bottom: -3, right: -3, width: 14, height: 14, borderRadius: "50%", background: student.status === "active" ? C.em : student.status === "suspended" ? C.ro : C.t2, border: "2.5px solid #030a12", boxShadow: `0 0 8px ${student.status === "active" ? C.em : C.ro}66` }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <div style={{ fontFamily: "Clash Display,sans-serif", fontSize: "1.12rem", fontWeight: 700 }}>{student.name}</div>
                {student.plan === "premium" && (
                  <div style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(240,32,121,.15)", border: "1px solid rgba(240,32,121,.3)", fontFamily: "DM Mono,monospace", fontSize: ".58rem", color: C.am, fontWeight: 700 }}>💎 PREMIUM</div>
                )}
              </div>
              <div style={{ fontSize: ".8rem", color: C.t2, marginBottom: 8 }}>{student.email}</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                <div className={`badge ${statusMap[student.status] || "badge-inactive"}`}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "currentColor" }} />
                  {(student.status || "inactive").toUpperCase()}
                </div>
                {student.streak > 0 && (
                  <div style={{ fontFamily: "DM Mono,monospace", fontSize: ".6rem", color: C.t2, padding: "3px 9px", borderRadius: 7, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}>
                    🔥 {student.streak} day streak
                  </div>
                )}
              </div>
            </div>

            <button className="btn-icon" onClick={onClose}>✕</button>
          </div>

          {/* Quick stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {[
              { l: "Enrolled",  v: enrolledCount,                          c: C.em },
              { l: "Completed", v: completedCount,                         c: C.cy },
              { l: "Spent",     v: "₹" + (student.totalSpent || 0).toLocaleString(), c: C.am },
              { l: "Progress",  v: (student.avgProgress || 0) + "%",       c: C.vt },
            ].map(({ l, v, c }) => (
              <div key={l} style={{ padding: "10px", borderRadius: 11, background: `${c}0d`, border: `1px solid ${c}20`, textAlign: "center" }}>
                <div style={{ fontFamily: "Clash Display,sans-serif", fontSize: "1rem", fontWeight: 700, color: c }}>{v}</div>
                <div style={{ fontFamily: "DM Mono,monospace", fontSize: ".58rem", color: C.t2, marginTop: 2 }}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Profile info */}
        <div className="drawer-section">
          <div style={{ fontFamily: "DM Mono,monospace", fontSize: ".62rem", letterSpacing: ".1em", color: C.t3, textTransform: "uppercase", marginBottom: 14 }}>Profile Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { l: "Phone",       v: student.phone || "—",          ico: "📱" },
              { l: "City",        v: student.city || "—",           ico: "📍" },
              { l: "Member Since",v: fmtDate(student.createdAt),    ico: "📅" },
              { l: "Last Active", v: fmtDate(student.lastActive),   ico: "⏱" },
            ].map(({ l, v, ico }) => (
              <div key={l} style={{ padding: "10px 12px", borderRadius: 11, background: "rgba(8,11,26,.97)", border: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ fontFamily: "DM Mono,monospace", fontSize: ".58rem", color: C.t3, marginBottom: 4 }}>{ico} {l.toUpperCase()}</div>
                <div style={{ fontSize: ".82rem", fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Enrolled courses count */}
        <div className="drawer-section">
          <div style={{ fontFamily: "DM Mono,monospace", fontSize: ".62rem", letterSpacing: ".1em", color: C.t3, textTransform: "uppercase", marginBottom: 14 }}>Course Summary</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ padding: "14px", borderRadius: 12, background: `${C.em}0d`, border: `1px solid ${C.em}20`, textAlign: "center" }}>
              <div style={{ fontFamily: "Clash Display,sans-serif", fontSize: "1.4rem", fontWeight: 700, color: C.em }}>{enrolledCount}</div>
              <div style={{ fontFamily: "DM Mono,monospace", fontSize: ".6rem", color: C.t2, marginTop: 4 }}>ENROLLED</div>
            </div>
            <div style={{ padding: "14px", borderRadius: 12, background: `${C.cy}0d`, border: `1px solid ${C.cy}20`, textAlign: "center" }}>
              <div style={{ fontFamily: "Clash Display,sans-serif", fontSize: "1.4rem", fontWeight: 700, color: C.cy }}>{completedCount}</div>
              <div style={{ fontFamily: "DM Mono,monospace", fontSize: ".6rem", color: C.t2, marginTop: 4 }}>COMPLETED</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: "DM Mono,monospace", fontSize: ".62rem", color: C.t2 }}>AVG PROGRESS</span>
              <span style={{ fontFamily: "DM Mono,monospace", fontSize: ".62rem", color: C.vt, fontWeight: 700 }}>{student.avgProgress || 0}%</span>
            </div>
            <div className="prog-bar">
              <div className="prog-fill" style={{ width: `${student.avgProgress || 0}%`, background: GR.cy }} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: "20px 24px", display: "flex", flexWrap: "wrap", gap: 8, borderTop: "1px solid rgba(255,255,255,.06)" }}>
          <button className="btn-em" style={{ fontSize: ".78rem", padding: "8px 16px" }} onClick={() => onAction("Message sent to " + student.name + "!")}>✉ Message</button>
          <button className="btn-sec" style={{ fontSize: ".78rem", padding: "8px 14px" }} onClick={() => onAction("Profile exported!")}>📥 Export</button>

          {student.plan !== "premium" ? (
            <button className="btn-sec" style={{ fontSize: ".78rem", padding: "8px 14px", borderColor: "rgba(240,32,121,.3)", color: C.am }} onClick={() => onAction("Upgraded to Premium!")}>💎 Upgrade</button>
          ) : (
            <button className="btn-sec" style={{ fontSize: ".78rem", padding: "8px 14px" }} onClick={() => onAction("Downgraded to Free!")}>↓ Downgrade</button>
          )}

          {student.status === "active" ? (
            <button className="btn-danger" style={{ fontSize: ".78rem", padding: "8px 14px", marginLeft: "auto" }} onClick={() => onStatusChange(student._id, "suspended")}>🚫 Suspend</button>
          ) : (
            <button className="btn-sec" style={{ fontSize: ".78rem", padding: "8px 14px", marginLeft: "auto", borderColor: "rgba(124,47,255,.3)", color: C.em }} onClick={() => onStatusChange(student._id, "active")}>✓ Activate</button>
          )}
        </div>
      </div>
    </>
  );
}
