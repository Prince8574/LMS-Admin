export const Toggle = ({ checked, onChange }) => (
  <label className="toggle">
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
    />
    <div className="toggle-slider" />
  </label>
);
