export const FieldGroup = ({ label, hint, children }) => (
  <div className="field-group">
    <div className="field-label">{label}</div>
    {children}
    {hint && <div className="field-hint">{hint}</div>}
  </div>
);
