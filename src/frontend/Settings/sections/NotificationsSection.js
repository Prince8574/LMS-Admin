import { useState, useEffect } from 'react';
import { C, GR } from '../constants';
import { SectionCard } from '../components/SectionCard';
import { FieldGroup } from '../components/FieldGroup';
import { Toggle } from '../components/Toggle';
import { settingsService } from '../services/settingsService';

export function NotificationsSection({ save }) {
  const [prefs, setPrefs] = useState({
    email_enrollment: true, email_revenue: true, email_moderation: true,
    email_system: false, email_weekly: true, push_enrollment: false,
    push_revenue: true, push_moderation: true, push_security: true,
    sms_security: true, sms_revenue: false,
    digest: 'daily', quietStart: '22:00', quietEnd: '08:00',
  });

  useEffect(() => {
    settingsService.getNotifications().then(data => {
      if (data.success && data.prefs && Object.keys(data.prefs).length > 0)
        setPrefs(p => ({ ...p, ...data.prefs }));
    });
  }, []);

  const up = (k, v) => setPrefs(p => ({ ...p, [k]: v }));

  const handleSave = async () => {
    const data = await settingsService.updateNotifications(prefs);
    save(data.message || 'Saved');
  };

  const groups = [
    {
      label: 'Email Notifications',
      icon: '📧',
      color: C.em,
      items: [
        { k: 'email_enrollment', l: 'New Enrollments', d: 'When a student enrolls in a course' },
        { k: 'email_revenue', l: 'Revenue Alerts', d: 'Daily revenue summaries & milestones' },
        { k: 'email_moderation', l: 'Content Flags', d: 'When content is flagged for review' },
        { k: 'email_system', l: 'System Alerts', d: 'Critical infrastructure & downtime alerts' },
        { k: 'email_weekly', l: 'Weekly Digest', d: 'Weekly performance report every Monday' }
      ]
    },
    {
      label: 'Push Notifications',
      icon: '🔔',
      color: C.cy,
      items: [
        { k: 'push_enrollment', l: 'Enrollment Spikes', d: 'When enrollment exceeds 50 in 1 hour' },
        { k: 'push_revenue', l: 'Revenue Milestones', d: 'Reaching ₹1L, ₹5L, ₹10L milestones' },
        { k: 'push_moderation', l: 'Urgent Flags', d: 'High-priority content moderation' },
        { k: 'push_security', l: 'Security Events', d: 'Login from new device or location' }
      ]
    },
    {
      label: 'SMS Alerts',
      icon: '💬',
      color: C.am,
      items: [
        { k: 'sms_security', l: 'Security Codes', d: 'OTP and 2FA verification codes' },
        { k: 'sms_revenue', l: 'Large Transactions', d: 'Transactions above ₹50,000' }
      ]
    },
  ];

  return (
    <SectionCard
      id="notifications"
      icon="🔔"
      title="Notification Preferences"
      sub="Control what alerts you receive and how"
      color={C.am}
      g={GR.am}
      delay={.1}
    >
      {groups.map(({ label, icon, color, items }) => (
        <div key={label} className="notif-section">
          <div className="notif-head">
            <div style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: `${color}14`,
              border: `1px solid ${color}22`,
              display: 'grid',
              placeItems: 'center',
              fontSize: '.85rem'
            }}>
              {icon}
            </div>
            <div style={{ fontWeight: 700, fontSize: '.88rem' }}>{label}</div>
          </div>
          <div style={{
            background: 'rgba(6,18,30,.97)',
            borderRadius: 14,
            border: `1px solid ${C.bord}`,
            padding: '4px 16px'
          }}>
            {items.map(({ k, l, d }) => (
              <div key={k} className="toggle-row">
                <div className="toggle-info">
                  <div className="toggle-label">{l}</div>
                  <div className="toggle-desc">{d}</div>
                </div>
                <Toggle checked={prefs[k]} onChange={v => up(k, v)} />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Digest & quiet hours */}
      <div className="field-row">
        <FieldGroup label="Digest Frequency">
          <select
            className="field-input field-select"
            value={prefs.digest}
            onChange={e => up('digest', e.target.value)}
          >
            {['realtime', 'hourly', 'daily', 'weekly'].map(d => (
              <option key={d} style={{ background: '#04090f', textTransform: 'capitalize' }}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </option>
            ))}
          </select>
        </FieldGroup>
        <FieldGroup label="Quiet Hours">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              className="field-input"
              type="time"
              value={prefs.quietStart}
              onChange={e => up('quietStart', e.target.value)}
              style={{ flex: 1 }}
            />
            <span style={{ color: C.t2, fontSize: '.8rem' }}>to</span>
            <input
              className="field-input"
              type="time"
              value={prefs.quietEnd}
              onChange={e => up('quietEnd', e.target.value)}
              style={{ flex: 1 }}
            />
          </div>
        </FieldGroup>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-em" onClick={handleSave}>
          Save Preferences
        </button>
        <button className="btn-sec">Send Test Email</button>
      </div>
    </SectionCard>
  );
}
