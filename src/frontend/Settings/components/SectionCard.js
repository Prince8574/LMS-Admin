export const SectionCard = ({ id, icon, title, sub, color, g, children, delay = 0 }) => (
  <div className="section-card" style={{ animationDelay: `${delay}s` }}>
    <div className="section-card-head">
      <div
        className="section-icon"
        style={{
          background: `${color}14`,
          border: `1px solid ${color}22`
        }}
      >
        {icon}
      </div>
      <div>
        <div className="section-title">{title}</div>
        <div className="section-sub">{sub}</div>
      </div>
      <div
        style={{
          marginLeft: 'auto',
          height: 2,
          width: 40,
          background: g,
          borderRadius: 99,
          opacity: .6
        }}
      />
    </div>
    <div className="section-body">{children}</div>
  </div>
);
