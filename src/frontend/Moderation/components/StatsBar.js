export function StatsBar({ stats, GR, C }) {
  return (
    <div className="stats-band">
      <div className="stat-mini" style={{ '--g': GR.am }}>
        <div className="stat-mini-val" style={{ color: C.am }}>{stats.pending}</div>
        <div className="stat-mini-label">Pending Review</div>
        <div className="stat-mini-sub" style={{ color: C.am2 }}>↑ 12% from last week</div>
      </div>
      <div className="stat-mini" style={{ '--g': GR.vt }}>
        <div className="stat-mini-val" style={{ color: C.vt }}>{stats.under_review}</div>
        <div className="stat-mini-label">Under Review</div>
        <div className="stat-mini-sub" style={{ color: C.vt2 }}>Active investigations</div>
      </div>
      <div className="stat-mini" style={{ '--g': GR.em }}>
        <div className="stat-mini-val" style={{ color: C.em }}>{stats.resolved}</div>
        <div className="stat-mini-label">Resolved</div>
        <div className="stat-mini-sub" style={{ color: C.em2 }}>Last 30 days</div>
      </div>
      <div className="stat-mini" style={{ '--g': GR.ro }}>
        <div className="stat-mini-val" style={{ color: C.ro }}>{stats.urgent}</div>
        <div className="stat-mini-label">Urgent</div>
        <div className="stat-mini-sub" style={{ color: C.ro2 }}>Requires immediate action</div>
      </div>
      <div className="stat-mini" style={{ '--g': GR.cy }}>
        <div className="stat-mini-val" style={{ color: C.cy }}>{stats.aiScore}%</div>
        <div className="stat-mini-label">Avg AI Score</div>
        <div className="stat-mini-sub" style={{ color: C.cy2 }}>Confidence level</div>
      </div>
    </div>
  );
}
