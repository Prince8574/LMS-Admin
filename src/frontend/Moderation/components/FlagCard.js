export function FlagCard({ flag, onApprove, onReject, onWarn, SEV_MAP, C }) {
  const sev = SEV_MAP[flag.severity];

  return (
    <div className={`flag-card ${flag.urgent ? 'urgent' : ''}`}>
      <div className="flag-card-head">
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: '1.1rem' }}>🚩</span>
            <span style={{ fontWeight: 700, fontSize: '.92rem' }}>{flag.type}</span>
            <span className={sev.cls}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: sev.dot, display: 'inline-block' }} />
              {sev.label}
            </span>
            {flag.urgent && <span style={{ fontSize: '.7rem', color: C.ro }}>⚡ URGENT</span>}
            <div className="ai-badge">
              <span className="ai-dot" />
              AI: {flag.aiScore}%
            </div>
          </div>
          <div style={{ fontSize: '.78rem', color: C.t2, marginBottom: 6 }}>
            <span style={{ fontWeight: 600, color: C.text }}>{flag.course}</span> → {flag.lesson}
          </div>
          <div style={{ fontSize: '.76rem', color: C.t2 }}>
            Reported by <span style={{ color: C.am }}>{flag.reporter}</span> ({flag.reporterEmail}) • {flag.time}
          </div>
        </div>
        <div style={{ fontSize: '.72rem', color: C.t2, textAlign: 'right' }}>
          <div style={{ fontFamily: 'DM Mono, monospace', color: C.ro, fontWeight: 700 }}>{flag.reports} reports</div>
        </div>
      </div>

      <div className="flag-card-body">
        <div style={{ fontSize: '.82rem', lineHeight: 1.6, marginBottom: 12, color: C.text }}>
          {flag.content}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {flag.aiTags.map((tag, i) => (
            <span key={i} className="keyword-tag">{tag}</span>
          ))}
        </div>
      </div>

      {flag.status === 'pending' && (
        <div className="flag-card-foot">
          <button className="btn-approve" onClick={() => onApprove(flag.id)}>
            ✓ Approve & Remove
          </button>
          <button className="btn-reject" onClick={() => onReject(flag.id)}>
            ✗ Reject Flag
          </button>
          <button className="btn-warn" onClick={() => onWarn(flag.id)}>
            ⚠ Warn Instructor
          </button>
          <button className="btn-sec" style={{ marginLeft: 'auto' }}>View Details →</button>
        </div>
      )}

      {flag.status === 'approved' && (
        <div className="flag-card-foot" style={{ background: 'rgba(124,47,255,.08)' }}>
          <span style={{ fontSize: '.78rem', color: C.em }}>✓ Approved — Content removed</span>
        </div>
      )}

      {flag.status === 'rejected' && (
        <div className="flag-card-foot" style={{ background: 'rgba(77,122,158,.05)' }}>
          <span style={{ fontSize: '.78rem', color: C.t2 }}>✗ Rejected — No action taken</span>
        </div>
      )}

      {flag.status === 'warned' && (
        <div className="flag-card-foot" style={{ background: 'rgba(240,32,121,.08)' }}>
          <span style={{ fontSize: '.78rem', color: C.am }}>⚠ Warning issued to instructor</span>
        </div>
      )}
    </div>
  );
}
