export function TabBar({ tab, setTab, flags, stats, C }) {
  const tabs = [
    { key: 'all', label: 'All Flags', count: flags.length },
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'under_review', label: 'Under Review', count: stats.under_review },
    { key: 'approved', label: 'Approved', count: flags.filter(f => f.status === 'approved').length },
    { key: 'rejected', label: 'Rejected', count: flags.filter(f => f.status === 'rejected').length }
  ];

  return (
    <div className="page-tabs">
      {tabs.map(t => (
        <div key={t.key} className={`page-tab ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
          {t.label}
          <span className="tab-count" style={{ background: tab === t.key ? C.am : 'rgba(255,255,255,.06)', color: tab === t.key ? '#fff' : C.t2 }}>
            {t.count}
          </span>
        </div>
      ))}
    </div>
  );
}
