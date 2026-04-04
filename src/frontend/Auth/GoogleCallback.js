import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function GoogleCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (error || !token) {
      navigate('/auth?error=google_failed');
      return;
    }

    localStorage.setItem('admin_token', token);
    navigate('/');
  }, []);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#050814', color: '#ede8ff', flexDirection: 'column', gap: 16
    }}>
      <div style={{
        width: 40, height: 40, border: '3px solid rgba(124,47,255,.3)',
        borderTopColor: '#7c2fff', borderRadius: '50%',
        animation: 'spin .7s linear infinite'
      }} />
      <div style={{ fontSize: '.9rem', color: '#4d7a9e' }}>Signing you in with Google…</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
