import { useState } from "react";

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
import API_BASE from '../../../config/api';
const BASE = `${API_BASE}/api`;

function initials(name = "") {
  return name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

async function exportPDF(student, token) {
  try {
    const res = await fetch(`${BASE}/students/${student._id}/export`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!data.success) { alert("Export failed"); return; }

    const { student: s, enrollments, submissions } = data.data;
    const totalSpent = enrollments.reduce((sum, e) => sum + (e.payment?.amount || 0), 0);
    const avgProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
      : 0;

    const courseRows = enrollments.map((e, i) => `
      <tr style="border-bottom:1px solid #e2e8f0">
        <td style="padding:10px 12px">${i + 1}</td>
        <td style="padding:10px 12px;font-weight:600">${e.courseDetails?.title || "Unknown Course"}</td>
        <td style="padding:10px 12px">${e.courseDetails?.category || "—"}</td>
        <td style="padding:10px 12px">${e.progress || 0}%</td>
        <td style="padding:10px 12px">₹${e.payment?.amount || 0}</td>
        <td style="padding:10px 12px">${e.payment?.method || "—"}</td>
        <td style="padding:10px 12px">${e.payment?.status || "—"}</td>
        <td style="padding:10px 12px">${fmtDate(e.enrolledAt)}</td>
      </tr>
    `).join("");

    const submissionRows = submissions.length > 0 ? submissions.map((sub, i) => `
      <tr style="border-bottom:1px solid #e2e8f0">
        <td style="padding:8px 12px">${i + 1}</td>
        <td style="padding:8px 12px">${sub.assignmentTitle || "—"}</td>
        <td style="padding:8px 12px">${sub.courseName || "—"}</td>
        <td style="padding:8px 12px">${sub.score !== undefined ? sub.score + "/" + (sub.maxScore || 100) : "—"}</td>
        <td style="padding:8px 12px">${sub.status || "—"}</td>
        <td style="padding:8px 12px">${fmtDate(sub.submittedAt)}</td>
      </tr>
    `).join("") : `<tr><td colspan="6" style="padding:12px;text-align:center;color:#94a3b8">No submissions</td></tr>`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <title>Student Report - ${s.name}</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; color:#1e293b; background:#fff; padding:32px; }
          .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; padding-bottom:20px; border-bottom:3px solid #7c2fff; }
          .logo { font-size:22px; font-weight:800; color:#7c2fff; }
          .logo span { color:#1e293b; }
          .report-title { font-size:13px; color:#64748b; margin-top:4px; }
          .student-header { display:flex; align-items:center; gap:20px; background:linear-gradient(135deg,#f8f4ff,#fdf2f8); border-radius:14px; padding:20px 24px; margin-bottom:24px; border:1px solid #e9d5ff; }
          .avatar { width:64px; height:64px; border-radius:16px; background:linear-gradient(135deg,#7c2fff,#8b5cf6); display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:900; color:#fff; flex-shrink:0; }
          .student-name { font-size:20px; font-weight:800; color:#1e293b; }
          .student-email { font-size:13px; color:#64748b; margin-top:2px; }
          .badges { display:flex; gap:8px; margin-top:8px; flex-wrap:wrap; }
          .badge { padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
          .badge-active { background:#dcfce7; color:#16a34a; }
          .badge-inactive { background:#f1f5f9; color:#64748b; }
          .badge-premium { background:#fdf4ff; color:#9333ea; border:1px solid #e9d5ff; }
          .badge-free { background:#f0f9ff; color:#0284c7; }
          .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:24px; }
          .stat-card { background:#f8fafc; border-radius:12px; padding:16px; border:1px solid #e2e8f0; text-align:center; }
          .stat-val { font-size:22px; font-weight:800; color:#7c2fff; }
          .stat-label { font-size:11px; color:#94a3b8; margin-top:4px; font-weight:600; text-transform:uppercase; letter-spacing:.05em; }
          .section { margin-bottom:24px; }
          .section-title { font-size:14px; font-weight:700; color:#1e293b; margin-bottom:12px; padding-bottom:8px; border-bottom:2px solid #f1f5f9; display:flex; align-items:center; gap:8px; }
          .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
          .info-item { background:#f8fafc; border-radius:10px; padding:12px 14px; border:1px solid #e2e8f0; }
          .info-label { font-size:10px; color:#94a3b8; font-weight:700; text-transform:uppercase; letter-spacing:.06em; margin-bottom:4px; }
          .info-val { font-size:14px; font-weight:600; color:#1e293b; }
          table { width:100%; border-collapse:collapse; font-size:13px; }
          thead tr { background:#f8f4ff; }
          th { padding:10px 12px; text-align:left; font-size:11px; font-weight:700; color:#7c2fff; text-transform:uppercase; letter-spacing:.05em; }
          .footer { margin-top:32px; padding-top:16px; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; font-size:11px; color:#94a3b8; }
          @media print { body { padding:20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">Learn<span>Verse</span></div>
            <div class="report-title">Student Report — Generated ${new Date().toLocaleString("en-IN")}</div>
          </div>
          <div style="text-align:right;font-size:12px;color:#94a3b8">
            <div>Admin Export</div>
            <div>LearnVerse Platform</div>
          </div>
        </div>

        <div class="student-header">
          <div class="avatar">${(s.name || "?").slice(0,2).toUpperCase()}</div>
          <div>
            <div class="student-name">${s.name}</div>
            <div class="student-email">${s.email}</div>
            <div class="badges">
              <span class="badge ${s.status === 'active' ? 'badge-active' : 'badge-inactive'}">${(s.status || 'inactive').toUpperCase()}</span>
              <span class="badge ${s.plan === 'premium' ? 'badge-premium' : 'badge-free'}">${s.plan === 'premium' ? '💎 PREMIUM' : 'FREE'}</span>
            </div>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card"><div class="stat-val">${enrollments.length}</div><div class="stat-label">Courses Enrolled</div></div>
          <div class="stat-card"><div class="stat-val">${avgProgress}%</div><div class="stat-label">Avg Progress</div></div>
          <div class="stat-card"><div class="stat-val">₹${totalSpent.toLocaleString()}</div><div class="stat-label">Total Spent</div></div>
          <div class="stat-card"><div class="stat-val">${submissions.length}</div><div class="stat-label">Assignments</div></div>
        </div>

        <div class="section">
          <div class="section-title">👤 Personal Information</div>
          <div class="info-grid">
            <div class="info-item"><div class="info-label">📱 Phone</div><div class="info-val">${s.phone || "—"}</div></div>
            <div class="info-item"><div class="info-label">📍 City</div><div class="info-val">${s.city || "—"}</div></div>
            <div class="info-item"><div class="info-label">📅 Member Since</div><div class="info-val">${fmtDate(s.createdAt)}</div></div>
            <div class="info-item"><div class="info-label">⏱ Last Active</div><div class="info-val">${fmtDate(s.lastActive || s.updatedAt)}</div></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">📚 Enrolled Courses (${enrollments.length})</div>
          <table>
            <thead><tr>
              <th>#</th><th>Course Name</th><th>Category</th><th>Progress</th><th>Amount Paid</th><th>Payment Method</th><th>Payment Status</th><th>Enrolled On</th>
            </tr></thead>
            <tbody>${courseRows || '<tr><td colspan="8" style="padding:12px;text-align:center;color:#94a3b8">No enrollments</td></tr>'}</tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">📝 Assignment Submissions (${submissions.length})</div>
          <table>
            <thead><tr>
              <th>#</th><th>Assignment</th><th>Course</th><th>Score</th><th>Status</th><th>Submitted On</th>
            </tr></thead>
            <tbody>${submissionRows}</tbody>
          </table>
        </div>

        <div class="footer">
          <div>LearnVerse Admin Panel • Confidential</div>
          <div>Report ID: ${s._id}</div>
        </div>
      </body>
      </html>
    `;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  } catch (e) {
    alert("Export error: " + e.message);
  }
}

export function StudentDrawer({ student, onClose, onAction, onStatusChange }) {
  const [loading, setLoading] = useState(null);
  const [localStudent, setLocalStudent] = useState(student);
  const [suspendModal, setSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  // Sync when student prop changes
  useState(() => { setLocalStudent(student); }, [student]);

  if (!localStudent) return null;

  const token = localStorage.getItem("admin_token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const handlePlanChange = async (plan) => {
    setLoading("plan");
    try {
      const res = await fetch(`${BASE}/students/${localStudent._id}/plan`, {
        method: "PATCH", headers, body: JSON.stringify({ plan })
      });
      const data = await res.json();
      if (data.success) {
        setLocalStudent(s => ({ ...s, plan }));
        onAction(`Plan changed to ${plan}!`);
      } else {
        onAction("Error: " + data.message);
      }
    } catch { onAction("Server error"); }
    finally { setLoading(null); }
  };

  const handleStatusChange2 = async (status, reason = "") => {
    setLoading("status");
    try {
      const res = await fetch(`${BASE}/students/${localStudent._id}/status`, {
        method: "PATCH", headers,
        body: JSON.stringify({ status, suspendReason: reason })
      });
      const data = await res.json();
      if (data.success) {
        setLocalStudent(s => ({ ...s, status, suspendReason: reason }));
        onAction(`Status changed to ${status}!`);
      } else {
        onAction("Error: " + data.message);
      }
    } catch { onAction("Server error"); }
    finally { setLoading(null); setSuspendModal(false); setSuspendReason(""); }
  };

  const colIdx = (localStudent.name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  const col = AVATAR_COLORS[colIdx];
  const statusMap = { active: "badge-active", inactive: "badge-inactive", suspended: "badge-suspended" };

  const enrolledCount   = localStudent.enrolledCount ?? (localStudent.enrolledCourses || []).length;
  const completedCount  = localStudent.completedCount ?? (localStudent.completedCourses || []).length;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className="drawer">
        <div className="drawer-head">
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: col, display: "grid", placeItems: "center", fontFamily: "Clash Display,sans-serif", fontSize: "1.3rem", fontWeight: 900, color: "#050814", boxShadow: "0 0 28px rgba(124,47,255,.4),inset 0 1px 0 rgba(255,255,255,.2)", overflow: "hidden" }}>
                {localStudent.avatar && localStudent.avatar !== "default-avatar.png"
                  ? <img src={localStudent.avatar} alt={localStudent.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }}/>
                  : initials(localStudent.name)
                }
              </div>
              <div style={{ position: "absolute", bottom: -3, right: -3, width: 14, height: 14, borderRadius: "50%", background: localStudent.status === "active" ? C.em : localStudent.status === "suspended" ? C.ro : C.t2, border: "2.5px solid #030a12", boxShadow: `0 0 8px ${localStudent.status === "active" ? C.em : C.ro}66` }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                <div style={{ fontFamily: "Clash Display,sans-serif", fontSize: "1.12rem", fontWeight: 700 }}>{localStudent.name}</div>
                {localStudent.plan === "premium" && (
                  <div style={{ padding: "2px 8px", borderRadius: 6, background: "rgba(240,32,121,.15)", border: "1px solid rgba(240,32,121,.3)", fontFamily: "DM Mono,monospace", fontSize: ".58rem", color: C.am, fontWeight: 700 }}>💎 PREMIUM</div>
                )}
              </div>
              <div style={{ fontSize: ".8rem", color: C.t2, marginBottom: 8 }}>{localStudent.email}</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                <div className={`badge ${statusMap[localStudent.status] || "badge-inactive"}`}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: "currentColor" }} />
                  {(localStudent.status || "inactive").toUpperCase()}
                </div>
                {localStudent.streak > 0 && (
                  <div style={{ fontFamily: "DM Mono,monospace", fontSize: ".6rem", color: C.t2, padding: "3px 9px", borderRadius: 7, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.07)" }}>
                    🔥 {localStudent.streak} day streak
                  </div>
                )}
              </div>
            </div>
            <button className="btn-icon" onClick={onClose}>✕</button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {[
              { l: "Enrolled",  v: enrolledCount,                                    c: C.em },
              { l: "Completed", v: completedCount,                                   c: C.cy },
              { l: "Spent",     v: "₹" + (localStudent.totalSpent || 0).toLocaleString(), c: C.am },
              { l: "Progress",  v: (localStudent.avgProgress || 0) + "%",            c: C.vt },
            ].map(({ l, v, c }) => (
              <div key={l} style={{ padding: "10px", borderRadius: 11, background: `${c}0d`, border: `1px solid ${c}20`, textAlign: "center" }}>
                <div style={{ fontFamily: "Clash Display,sans-serif", fontSize: "1rem", fontWeight: 700, color: c }}>{v}</div>
                <div style={{ fontFamily: "DM Mono,monospace", fontSize: ".58rem", color: C.t2, marginTop: 2 }}>{l.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="drawer-section">
          <div style={{ fontFamily: "DM Mono,monospace", fontSize: ".62rem", letterSpacing: ".1em", color: C.t3, textTransform: "uppercase", marginBottom: 14 }}>Profile Details</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { l: "Phone",       v: localStudent.phone || "—",        ico: "📱" },
              { l: "City",        v: localStudent.city || "—",         ico: "📍" },
              { l: "Member Since",v: fmtDate(localStudent.createdAt),  ico: "📅" },
              { l: "Last Active", v: fmtDate(localStudent.lastActive), ico: "⏱" },
            ].map(({ l, v, ico }) => (
              <div key={l} style={{ padding: "10px 12px", borderRadius: 11, background: "rgba(8,11,26,.97)", border: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ fontFamily: "DM Mono,monospace", fontSize: ".58rem", color: C.t3, marginBottom: 4 }}>{ico} {l.toUpperCase()}</div>
                <div style={{ fontSize: ".82rem", fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

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
          <div style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontFamily: "DM Mono,monospace", fontSize: ".62rem", color: C.t2 }}>AVG PROGRESS</span>
              <span style={{ fontFamily: "DM Mono,monospace", fontSize: ".62rem", color: C.vt, fontWeight: 700 }}>{localStudent.avgProgress || 0}%</span>
            </div>
            <div className="prog-bar">
              <div className="prog-fill" style={{ width: `${localStudent.avgProgress || 0}%`, background: GR.cy }} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: "20px 24px", display: "flex", gap: 8, borderTop: "1px solid rgba(255,255,255,.06)", flexWrap: "nowrap", alignItems: "center" }}>
          <button className="btn-em" style={{ fontSize: ".78rem", padding: "8px 14px" }}
            onClick={() => onAction("Message sent to " + localStudent.name + "!")}>
            ✉ Message
          </button>
          <button className="btn-sec" style={{ fontSize: ".78rem", padding: "8px 14px" }}
            onClick={() => { exportPDF(localStudent, token); onAction("Generating PDF report..."); }}>
            📥 Export PDF
          </button>
          {localStudent.plan !== "premium" ? (
            <button className="btn-sec"
              style={{ fontSize: ".78rem", padding: "8px 14px", borderColor: "rgba(240,32,121,.3)", color: C.am, opacity: loading === "plan" ? 0.6 : 1 }}
              disabled={loading === "plan"}
              onClick={() => handlePlanChange("premium")}>
              {loading === "plan" ? "..." : "💎 Upgrade"}
            </button>
          ) : (
            <button className="btn-sec"
              style={{ fontSize: ".78rem", padding: "8px 14px", opacity: loading === "plan" ? 0.6 : 1 }}
              disabled={loading === "plan"}
              onClick={() => handlePlanChange("free")}>
              {loading === "plan" ? "..." : "↓ Downgrade"}
            </button>
          )}
          <div style={{ flex: 1 }} />
          {localStudent.status === "active" ? (
            <button className="btn-danger"
              style={{ fontSize: ".78rem", padding: "8px 14px", opacity: loading === "status" ? 0.6 : 1 }}
              disabled={loading === "status"}
              onClick={() => setSuspendModal(true)}>
              🚫 Suspend
            </button>
          ) : (
            <button className="btn-sec"
              style={{ fontSize: ".78rem", padding: "8px 14px", borderColor: "rgba(124,47,255,.3)", color: C.em, opacity: loading === "status" ? 0.6 : 1 }}
              disabled={loading === "status"}
              onClick={() => handleStatusChange2("active")}>
              {loading === "status" ? "..." : "✓ Activate"}
            </button>
          )}
        </div>
      </div>

      {/* Suspend Reason Modal */}
      {suspendModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(6px)" }}>
          <div style={{ background: "#080d1a", border: "1px solid rgba(239,68,68,.3)", borderRadius: 18, padding: 28, width: 400, boxShadow: "0 24px 64px rgba(0,0,0,.7)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <span style={{ fontSize: "1.4rem" }}>🚫</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#ede8ff" }}>Suspend Account</div>
                <div style={{ fontSize: ".76rem", color: "#6b5b8e", marginTop: 2 }}>{localStudent.name}</div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: ".76rem", color: "#6b5b8e", fontWeight: 600, display: "block", marginBottom: 8 }}>
                Reason for suspension <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                value={suspendReason}
                onChange={e => setSuspendReason(e.target.value)}
                placeholder="e.g. Violation of terms, spam activity, payment fraud..."
                rows={4}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(239,68,68,.3)", background: "rgba(239,68,68,.05)", color: "#ede8ff", fontSize: ".82rem", resize: "none", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => { setSuspendModal(false); setSuspendReason(""); }}
                style={{ flex: 1, padding: "9px", borderRadius: 10, border: "1px solid rgba(255,255,255,.08)", background: "transparent", color: "#6b5b8e", fontSize: ".82rem", fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button
                onClick={() => { if (suspendReason.trim()) handleStatusChange2("suspended", suspendReason.trim()); }}
                disabled={!suspendReason.trim() || loading === "status"}
                style={{ flex: 2, padding: "9px", borderRadius: 10, border: "none", background: suspendReason.trim() ? "linear-gradient(135deg,#ef4444,#dc2626)" : "rgba(239,68,68,.3)", color: "#fff", fontSize: ".82rem", fontWeight: 700, cursor: suspendReason.trim() ? "pointer" : "not-allowed" }}>
                {loading === "status" ? "Suspending..." : "🚫 Confirm Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
