import { GR } from '../constants';

const MSGS = {
  login:    { ico: '🎉', title: 'Welcome back!',      sub: 'Redirecting you to your dashboard…',              btn: 'Go to Dashboard →' },
  register: { ico: '🚀', title: 'Account created!',   sub: 'Your LearnVerse account is ready. Start learning today!', btn: 'Start Learning →' },
  forgot:   { ico: '✅', title: 'Password reset!',    sub: 'Your password has been updated successfully.',    btn: 'Sign In →' },
};

export function SuccessState({ type, onContinue }) {
  const m = MSGS[type];
  return (
    <div className="success-state">
      <div className="success-icon">{m.ico}</div>
      <div className="success-title">{m.title}</div>
      <div className="success-sub">{m.sub}</div>
      <div style={{ height: 3, borderRadius: 99, background: 'rgba(255,255,255,.06)', overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ height: '100%', borderRadius: 99, background: GR.full, animation: 'shimmer 1.5s linear infinite', backgroundSize: '200% 100%' }} />
      </div>
      <button className="btn-cta" onClick={onContinue}>{m.btn}</button>
    </div>
  );
}
