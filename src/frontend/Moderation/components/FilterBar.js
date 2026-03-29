export function FilterBar({ categories, filter, setFilter }) {
  return (
    <div className="filter-row">
      {categories.map(cat => (
        <div
          key={cat}
          className="filter-chip"
          onClick={() => setFilter(cat)}
          style={{
            borderColor: filter === cat ? '#f02079' : 'rgba(255,255,255,.08)',
            background: filter === cat ? 'rgba(240,32,121,.12)' : 'transparent',
            color: filter === cat ? '#f02079' : '#6b5b8e'
          }}
        >
          {cat.replace('_', ' ')}
        </div>
      ))}
    </div>
  );
}
