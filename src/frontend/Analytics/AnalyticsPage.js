import { Sidebar } from '../../components/Sidebar';

export default function AnalyticsPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#050814' }}>
      <Sidebar />
      <main style={{ flex: 1, padding: '40px', color: '#ede8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>📊</div>
          <h2 style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '1.6rem', marginBottom: 8 }}>Analytics</h2>
          <p style={{ color: '#6b5b8e' }}>Coming soon — detailed analytics dashboard</p>
        </div>
      </main>
    </div>
  );
}
