import { useState } from 'react';

export function Field({ label, icon, type = 'text', placeholder, value, onChange, hint, error, success, rightLabel, rightAction, autoComplete }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (show ? 'text' : 'password') : type;
  const cls = 'field-input' + (error ? ' error' : success ? ' success' : '');

  return (
    <div className="field-wrap">
      <div className="field-label">
        <span>{label}</span>
        {rightLabel && <a onClick={rightAction}>{rightLabel}</a>}
      </div>
      <div className="field-box">
        <span className="field-icon">{icon}</span>
        <input
          className={cls}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          autoComplete={autoComplete}
        />
        <div className="field-focus-line" />
        {isPassword && (
          <button className="field-suffix-btn" type="button" onClick={() => setShow(s => !s)}>
            {show ? '🙈' : '👁'}
          </button>
        )}
      </div>
      {hint && (
        <div className={'field-hint' + (error ? ' error' : success ? ' success' : '')}>
          <span>{error ? '⚠' : success ? '✓' : 'ℹ'}</span> {hint}
        </div>
      )}
    </div>
  );
}
