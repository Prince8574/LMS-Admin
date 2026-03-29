import { useState } from 'react';
import { SectionCard } from '../components/SectionCard';
import { FieldGroup } from '../components/FieldGroup';
import { Toggle } from '../components/Toggle';

// Integrations Section
export const IntegrationsSection = ({ save }) => {
  const [visible, setVisible] = useState({});
  const toggle = k => setVisible(v => ({ ...v, [k]: !v[k] }));

  const KEYS = [
    { name: 'Production API Key', key: 'sk_live_••••••••••••••••••••••••••4f2a', created: 'Jan 15, 2026', last: '2 min ago', status: 'active' },
    { name: 'Development API Key', key: 'sk_test_••••••••••••••••••••••••••9d1c', created: 'Dec 8, 2025', last: '3 days ago', status: 'active' },
    { name: 'Webhook Secret', key: 'whsec_••••••••••••••••••••••••••••7b3e', created: 'Feb 2, 2026', last: 'Never', status: 'inactive' }
  ];

  const INTEGRATIONS = [
    { ico: '📊', name: 'Google Analytics', desc: 'Track platform-level events and goals', connected: true },
    { ico: '💳', name: 'Razorpay', desc: 'Payment processing & auto-payouts', connected: true },
    { ico: '📧', name: 'SendGrid', desc: 'Transactional email delivery', connected: true },
    { ico: '💬', name: 'Slack', desc: 'Admin alerts & notifications', connected: false },
    { ico: '🔍', name: 'Mixpanel', desc: 'Advanced user behaviour analytics', connected: false },
    { ico: '☁️', name: 'AWS S3', desc: 'Video & asset storage bucket', connected: true }
  ];

  return (
    <div className="settings-section">
      <SectionCard title="API Keys" description="Manage your API keys">
        {KEYS.map(({ name, key, status }) => (
          <div key={name} className="api-key-row">
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '.84rem', marginBottom: 2 }}>{name}</div>
              <div className="api-key-code">{visible[name] ? key.replace(/•/g, 'x') : key}</div>
            </div>
            <div className={`status-pill ${status === 'active' ? 'status-active' : 'status-warning'}`}>
              {status.toUpperCase()}
            </div>
            <button className="btn-icon" onClick={() => toggle(name)}>
              {visible[name] ? '🙈' : '👁'}
            </button>
          </div>
        ))}
        <button className="btn-em" onClick={() => save('New API key generated!')}>+ Generate Key</button>
      </SectionCard>

      <SectionCard title="Connected Services" description="Manage third-party integrations">
        <div className="integrations-grid">
          {INTEGRATIONS.map(({ ico, name, desc, connected }) => (
            <div key={name} className="integration-card">
              <div className="integration-icon">{ico}</div>
              <div className="integration-info">
                <h4>{name}</h4>
                <p>{desc}</p>
              </div>
              <Toggle checked={connected} onChange={() => save(`${name} ${connected ? 'disconnected' : 'connected'}!`)} />
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Webhook" description="Configure webhook endpoint">
        <FieldGroup label="Webhook URL">
          <input className="field-input" defaultValue="https://api.learnverse.io/webhooks/admin" />
        </FieldGroup>
        <button className="btn-em" onClick={() => save('Webhook URL saved!')}>Save URL</button>
      </SectionCard>
    </div>
  );
};

// Billing Section
export const BillingSection = ({ save }) => {
  const [plan, setPlan] = useState('pro');

  const PLANS = [
    { id: 'starter', name: 'Starter', price: '₹0', period: '/mo', desc: 'Up to 500 students', features: ['5 courses', 'Basic analytics', 'Email support'] },
    { id: 'pro', name: 'Pro', price: '₹4,999', period: '/mo', desc: 'Up to 10,000 students', features: ['Unlimited courses', 'Advanced analytics', 'Priority support', 'Custom domain', 'Revenue splits'], popular: true },
    { id: 'enterprise', name: 'Enterprise', price: 'Custom', period: '', desc: 'Unlimited students', features: ['Everything in Pro', 'White-label', 'Dedicated support', 'SLA guarantee', 'SSO & SCIM'] },
  ];

  return (
    <div className="settings-section">
      <SectionCard title="Current Plan" description="Manage your subscription">
        <div style={{ padding: 18, borderRadius: 16, background: 'linear-gradient(135deg,rgba(240,32,121,.06),rgba(255,107,157,.04))', border: '1px solid rgba(240,32,121,.14)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>LearnVerse Pro</div>
              <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.62rem', color: '#6b5b8e' }}>Renews March 15, 2026 · Auto-pay enabled</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '1.4rem', fontWeight: 700, color: '#f02079' }}>
                ₹4,999<span style={{ fontFamily: 'Outfit', fontSize: '.8rem', color: '#6b5b8e' }}>/mo</span>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Change Plan" description="Select a different plan">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {PLANS.map(({ id, name, price, period, desc, features, popular }) => (
            <div
              key={id}
              className="plan-card"
              onClick={() => setPlan(id)}
              style={{
                padding: '20px',
                borderRadius: 16,
                border: `1.5px solid ${plan === id ? '#7c2fff' : 'rgba(255,255,255,.06)'}`,
                background: plan === id ? 'rgba(124,47,255,.07)' : 'rgba(8,11,26,.97)',
                cursor: 'pointer',
                transition: 'all .26s',
                position: 'relative'
              }}
            >
              {popular && <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', padding: '2px 10px', borderRadius: '0 0 8px 8px', background: '#7c2fff', fontFamily: 'DM Mono,monospace', fontSize: '.58rem', color: '#050814', fontWeight: 900 }}>POPULAR</div>}
              <div style={{ marginTop: popular ? 12 : 0 }}>
                <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '.95rem', fontWeight: 700, marginBottom: 2 }}>{name}</div>
                <div style={{ fontSize: '.72rem', color: '#6b5b8e', marginBottom: 12 }}>{desc}</div>
                <div style={{ fontFamily: 'Clash Display,sans-serif', fontSize: '1.5rem', fontWeight: 700, marginBottom: 16 }}>
                  {price}<span style={{ fontFamily: 'Outfit', fontSize: '.7rem', color: '#6b5b8e' }}>{period}</span>
                </div>
                {features.map(f => <div key={f} style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 6, fontSize: '.76rem' }}><span>✓</span>{f}</div>)}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Payment Method" description="Manage payment information">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, background: 'rgba(8,11,26,.97)', border: '1px solid rgba(124,47,255,.14)' }}>
          <div style={{ width: 48, height: 32, borderRadius: 7, background: 'linear-gradient(135deg,#1a1a2e,#16213e)', border: '1px solid rgba(255,255,255,.1)', display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: '.65rem', fontWeight: 700, color: '#f02079', fontFamily: 'DM Mono,monospace' }}>VISA</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '.86rem' }}>Visa ending in 4242</div>
            <div style={{ fontFamily: 'DM Mono,monospace', fontSize: '.65rem', color: '#6b5b8e' }}>Expires 04/2028</div>
          </div>
          <div className="status-pill status-active" style={{ marginLeft: 'auto' }}>DEFAULT</div>
          <button className="btn-sec" style={{ fontSize: '.74rem', padding: '6px 12px' }}>Change</button>
        </div>
      </SectionCard>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-em" onClick={() => save('Billing updated!')}>Upgrade Plan</button>
        <button className="btn-sec">View Invoices</button>
        <button className="btn-danger" style={{ marginLeft: 'auto' }}>Cancel Subscription</button>
      </div>
    </div>
  );
};

// Activity Log Section
export const ActivityLogSection = () => {
  const activities = [
    { id: 1, action: 'User login', user: 'john@example.com', time: '2 minutes ago', type: 'auth' },
    { id: 2, action: 'Course created', user: 'admin@example.com', time: '15 minutes ago', type: 'course' },
    { id: 3, action: 'Settings updated', user: 'admin@example.com', time: '1 hour ago', type: 'settings' },
    { id: 4, action: 'User registered', user: 'jane@example.com', time: '2 hours ago', type: 'auth' },
    { id: 5, action: 'Payment received', user: 'john@example.com', time: '3 hours ago', type: 'billing' },
    { id: 6, action: 'Course published', user: 'editor@example.com', time: '5 hours ago', type: 'course' },
    { id: 7, action: 'User deleted', user: 'admin@example.com', time: '1 day ago', type: 'user' },
    { id: 8, action: 'Integration connected', user: 'admin@example.com', time: '2 days ago', type: 'integration' },
  ];

  const getActivityIcon = (type) => {
    const icons = {
      auth: '🔐',
      course: '📚',
      settings: '⚙️',
      billing: '💳',
      user: '👤',
      integration: '🔌',
    };
    return icons[type] || '📝';
  };

  return (
    <div className="settings-section">
      <SectionCard title="Recent Activity" description="Monitor platform activity">
        <div className="activity-filters">
          <select defaultValue="all">
            <option value="all">All Activities</option>
            <option value="auth">Authentication</option>
            <option value="course">Courses</option>
            <option value="settings">Settings</option>
            <option value="billing">Billing</option>
          </select>
          <input type="date" />
        </div>

        <div className="activity-log">
          {activities.map(activity => (
            <div key={activity.id} className="activity-item">
              <span className="activity-icon">{getActivityIcon(activity.type)}</span>
              <div className="activity-details">
                <p className="activity-action">{activity.action}</p>
                <p className="activity-meta">
                  <span className="activity-user">{activity.user}</span>
                  <span className="activity-time">{activity.time}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <button className="btn-secondary load-more">Load More</button>
      </SectionCard>

      <SectionCard title="Export Activity" description="Download activity logs">
        <FieldGroup label="Date Range">
          <div className="date-range">
            <input type="date" />
            <span>to</span>
            <input type="date" />
          </div>
        </FieldGroup>
        <FieldGroup label="Format">
          <select defaultValue="csv">
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="pdf">PDF</option>
          </select>
        </FieldGroup>
        <button className="btn-primary">Export Logs</button>
      </SectionCard>
    </div>
  );
};
