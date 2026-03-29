/* ═══════════════════════════════PALETTE — Midnight Ember═══════════════════════════════ */
export const C = {
  bg: "#01080f",
  b1: "#04101a",
  b2: "#071520",
  em: "#00d97e",
  em2: "#4dffa0",
  am: "#f59e0b",
  am2: "#fcd34d",
  ro: "#fb7185",
  ro2: "#fda4af",
  cy: "#22d3ee",
  cy2: "#67e8f9",
  vt: "#a78bfa",
  vt2: "#c4b5fd",
  text: "#e2f0ff",
  t2: "#4d7a9e",
  t3: "#193348",
  bord: "rgba(255,255,255,0.055)",
};

export const GR = {
  em: "linear-gradient(135deg,#00d97e,#22d3ee)",
  am: "linear-gradient(135deg,#f59e0b,#fb7185)",
  cy: "linear-gradient(135deg,#22d3ee,#a78bfa)",
  ro: "linear-gradient(135deg,#fb7185,#f59e0b)",
  vt: "linear-gradient(135deg,#a78bfa,#22d3ee)",
  dark: "linear-gradient(135deg,rgba(4,16,26,.98),rgba(7,21,32,.98))",
};

/* ═══════════════════════════════SETTINGS SECTIONS DATA═══════════════════════════════ */
export const SECTIONS = [
  { id: 'profile', icon: '👤', label: 'Profile', sub: 'Personal & account info', color: C.em, g: GR.em },
  { id: 'appearance', icon: '🎨', label: 'Appearance', sub: 'Theme & display preferences', color: C.vt, g: GR.vt },
  { id: 'security', icon: '🔐', label: 'Security', sub: 'Password, 2FA & sessions', color: C.ro, g: GR.ro },
  { id: 'notifications', icon: '🔔', label: 'Notifications', sub: 'Alerts & email preferences', color: C.am, g: GR.am },
  { id: 'permissions', icon: '🛡️', label: 'Permissions', sub: 'Roles & access control', color: C.cy, g: GR.cy },
  { id: 'integrations', icon: '⚡', label: 'Integrations', sub: 'API keys & webhooks', color: C.vt, g: GR.vt },
  { id: 'billing', icon: '💰', label: 'Billing & Plan', sub: 'Subscription & payments', color: C.am, g: GR.am },
  { id: 'platform', icon: '⚙', label: 'Platform Config', sub: 'General platform settings', color: C.em, g: GR.em },
  { id: 'data', icon: '🗄️', label: 'Data & Privacy', sub: 'Export, backup & GDPR', color: C.cy, g: GR.cy },
  { id: 'activity', icon: '📋', label: 'Activity Log', sub: 'Audit trail & history', color: C.t2, g: `linear-gradient(135deg,#4d7a9e,#22d3ee)` },
];

export const ROLES = [
  { name: 'Super Admin', desc: 'Full platform access', badge: C.ro, perms: ['courses', 'users', 'revenue', 'settings', 'moderation', 'instructors'] },
  { name: 'Moderator', desc: 'Content review only', badge: C.am, perms: ['courses', 'moderation'] },
  { name: 'Finance', desc: 'Revenue & billing', badge: C.em, perms: ['revenue'] },
  { name: 'Instructor', desc: 'Own courses only', badge: C.cy, perms: ['courses'] },
];

export const PERM_MODULES = ['Courses', 'Users', 'Revenue', 'Settings', 'Moderation', 'Instructors', 'Analytics'];

export const SB_ITEMS = [
  { id: 'dashboard', ico: '⬡', l: 'Dashboard' },
  { id: 'courses', ico: '📚', l: 'Courses', badge: 84, bc: C.em },
  { id: 'students', ico: '👥', l: 'Students', badge: '52K', bc: C.cy },
  { id: 'revenue', ico: '💰', l: 'Revenue' },
  { id: 'analytics', ico: '📊', l: 'Analytics' },
  { id: 'moderation', ico: '🛡️', l: 'Moderation', badge: 3, bc: C.ro },
  { id: 'instructors', ico: '👨‍🏫', l: 'Instructors' },
  { id: 'settings', ico: '⚙', l: 'Settings' },
];

export const SESSIONS = [
  { device: 'Chrome · MacBook Pro', loc: 'Mumbai, IN', time: 'Active now', cur: true },
  { device: 'Safari · iPhone 14', loc: 'Pune, IN', time: '2h ago', cur: false },
  { device: 'Firefox · Windows PC', loc: 'Delhi, IN', time: 'Yesterday', cur: false }
];

export const API_KEYS = [
  { name: 'Production API Key', key: 'sk_live_••••••••••••••••••••••••••4f2a', created: 'Jan 15, 2026', last: '2 min ago', status: 'active' },
  { name: 'Development API Key', key: 'sk_test_••••••••••••••••••••••••••9d1c', created: 'Dec 8, 2025', last: '3 days ago', status: 'active' },
  { name: 'Webhook Secret', key: 'whsec_••••••••••••••••••••••••••••7b3e', created: 'Feb 2, 2026', last: 'Never', status: 'inactive' }
];

export const INTEGRATIONS = [
  { ico: '📊', name: 'Google Analytics', desc: 'Track platform-level events and goals', connected: true, col: C.am },
  { ico: '💳', name: 'Razorpay', desc: 'Payment processing & auto-payouts', connected: true, col: C.em },
  { ico: '📧', name: 'SendGrid', desc: 'Transactional email delivery', connected: true, col: C.cy },
  { ico: '💬', name: 'Slack', desc: 'Admin alerts & notifications', connected: false, col: C.vt },
  { ico: '🔍', name: 'Mixpanel', desc: 'Advanced user behaviour analytics', connected: false, col: C.ro },
  { ico: '☁️', name: 'AWS S3', desc: 'Video & asset storage bucket', connected: true, col: C.am }
];

export const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: '₹0',
    period: '/mo',
    desc: 'Up to 500 students',
    features: ['5 courses', 'Basic analytics', 'Email support'],
    color: C.t2,
    g: `linear-gradient(135deg,#4d7a9e,#193348)`
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹4,999',
    period: '/mo',
    desc: 'Up to 10,000 students',
    features: ['Unlimited courses', 'Advanced analytics', 'Priority support', 'Custom domain', 'Revenue splits'],
    color: C.em,
    g: GR.em,
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    desc: 'Unlimited students',
    features: ['Everything in Pro', 'White-label', 'Dedicated support', 'SLA guarantee', 'SSO & SCIM'],
    color: C.am,
    g: GR.am
  },
];

export const ACTIVITY_LOGS = [
  { dot: C.em, action: 'Course published', detail: '"AWS Solutions Architect" went live', time: '2 min ago', user: 'Super Admin' },
  { dot: C.cy, action: 'User role updated', detail: 'vikram.iyer@gmail.com → Instructor', time: '18 min ago', user: 'Super Admin' },
  { dot: C.am, action: 'Payout processed', detail: '₹28,400 sent to 12 instructors', time: '1h ago', user: 'System' },
  { dot: C.ro, action: 'Content flagged', detail: 'Reported inappropriate content in React course', time: '3h ago', user: 'AI Moderator' },
  { dot: C.vt, action: 'API key generated', detail: 'New production key created', time: '6h ago', user: 'Super Admin' },
  { dot: C.em, action: 'Platform config changed', detail: 'Platform fee updated 18% → 20%', time: 'Yesterday', user: 'Super Admin' },
  { dot: C.cy, action: 'Bulk enrollment', detail: '384 students enrolled via promo code', time: '2 days ago', user: 'System' },
  { dot: C.am, action: 'Instructor approved', detail: 'dr.priya.nair@edu.in verified', time: '3 days ago', user: 'Moderator' },
  { dot: C.t2, action: 'Backup completed', detail: 'Full platform backup · 42 GB', time: '4 days ago', user: 'System' },
  { dot: C.ro, action: 'Failed login attempt', detail: '3 failed attempts from 182.x.x.x', time: '5 days ago', user: 'Security' },
];

export const ACCENT_COLORS = ['#00d97e', '#22d3ee', '#a78bfa', '#f59e0b', '#fb7185', '#ff6b6b', '#00d4ff', '#a8e6cf'];
