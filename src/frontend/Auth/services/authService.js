const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/auth";

// ─── Browser Console Logger ──────────────────────────────
const clog = (type, action, msg, data = null) => {
  const cfg = {
    INFO:    { bg: '#1e1b4b', color: '#a78bfa', icon: 'ℹ️' },
    SUCCESS: { bg: '#052e16', color: '#4ade80', icon: '✅' },
    WARN:    { bg: '#2d1b00', color: '#fbbf24', icon: '⚠️' },
    ERROR:   { bg: '#2d0a0a', color: '#f87171', icon: '❌' },
  };
  const { bg, color, icon } = cfg[type] || cfg.INFO;
  const ts = new Date().toLocaleTimeString();
  console.log(
    `%c ${icon} %c [AUTH] %c ${action} %c ${msg} %c ${ts}`,
    `background:${bg};color:${color};font-weight:900;padding:3px 6px;border-radius:4px 0 0 4px`,
    `background:#0f172a;color:#7c3aed;font-weight:700;padding:3px 6px`,
    `background:#1e293b;color:${color};font-weight:700;padding:3px 8px`,
    `background:#0f172a;color:#e2e8f0;padding:3px 8px`,
    `background:#0f172a;color:#475569;font-size:0.75em;padding:3px 6px;border-radius:0 4px 4px 0`
  );
  if (data) console.log('%c   ↳', 'color:#475569', data);
};

async function request(endpoint, body, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method:  "POST",
    headers,
    body:    JSON.stringify(body),
  });
  return res.json();
}

function getToken()        { return localStorage.getItem("admin_token"); }
function saveToken(token)  { localStorage.setItem("admin_token", token); }
function clearToken()      { localStorage.removeItem("admin_token"); }

export const authService = {
  login: async (email, password) => {
    clog('INFO', 'LOGIN', `Login attempt for ${email}`);
    const data = await request("/login", { email, password });
    if (data.success) {
      saveToken(data.token);
      clog('SUCCESS', 'LOGIN', `Credentials verified — OTP step triggered`);
    } else {
      clog('WARN', 'LOGIN', data.message || 'Login failed');
    }
    return data;
  },

  register: async (name, email, password, secretKey = '') => {
    clog('INFO', 'REGISTER', `Registering admin account for ${email}`);
    const data = await request("/register", { name, email, password, secretKey });
    if (data.success) {
      saveToken(data.token);
      clog('SUCCESS', 'REGISTER', `Admin account created — role: ${data.admin?.role}`, { name, email });
    } else {
      clog('WARN', 'REGISTER', data.message || 'Registration failed');
    }
    return data;
  },

  forgotPassword: async (email) => {
    clog('INFO', 'FORGOT-PWD', `Password reset requested for ${email}`);
    const data = await request("/forgot-password", { email });
    if (data.success) clog('SUCCESS', 'FORGOT-PWD', 'Reset OTP sent to email');
    else clog('WARN', 'FORGOT-PWD', data.message || 'Failed');
    return data;
  },

  sendOtp: async (email) => {
    clog('INFO', 'SEND-OTP', `Sending OTP to ${email}`);
    const data = await request("/send-otp", { email });
    if (data.success) clog('SUCCESS', 'SEND-OTP', 'OTP sent successfully');
    else clog('WARN', 'SEND-OTP', data.message || 'Failed to send OTP');
    return data;
  },

  verifyOtp: async (email, otp) => {
    clog('INFO', 'VERIFY-OTP', `Verifying OTP for ${email}`);
    const data = await request("/verify-otp", { email, otp });
    if (data.success) clog('SUCCESS', 'VERIFY-OTP', 'OTP verified — session started');
    else clog('WARN', 'VERIFY-OTP', data.message || 'Invalid or expired OTP');
    return data;
  },

  resetPassword: async (token, newPassword) => {
    clog('INFO', 'RESET-PWD', 'Submitting new password');
    const data = await request("/reset-password", { token, newPassword });
    if (data.success) clog('SUCCESS', 'RESET-PWD', 'Password reset successfully');
    else clog('WARN', 'RESET-PWD', data.message || 'Reset failed');
    return data;
  },

  getMe: async () => {
    const token = getToken();
    if (!token) {
      clog('WARN', 'GET-ME', 'No token found in storage');
      return { success: false };
    }
    try {
      const res = await fetch(`${BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) clog('INFO', 'GET-ME', `Session active — ${data.admin?.name || ''}`);
      return data;
    } catch {
      clog('ERROR', 'GET-ME', 'Failed to fetch session');
      return { success: false };
    }
  },

  logout: async () => {
    const token = getToken();
    clog('INFO', 'LOGOUT', 'Logging out admin session');
    if (token) {
      try {
        await fetch(`${BASE_URL}/logout`, {
          method:  "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch { /* ignore if backend offline */ }
    }
    clearToken();
    clog('SUCCESS', 'LOGOUT', 'Session cleared');
  },

  isLoggedIn: () => !!getToken(),

  getRole: () => {
    try {
      const token = getToken();
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch { return null; }
  },

  isSuperAdmin: () => {
    try {
      const token = getToken();
      if (!token) return false;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'super_admin';
    } catch { return false; }
  },

  // Create instructor (super_admin only)
  createInstructor: async ({ name, email, password }) => {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/instructors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, email, password }),
    });
    return res.json();
  },

  // List all instructors (super_admin only)
  listInstructors: async () => {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/instructors`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  // Delete instructor (super_admin only)
  deleteInstructor: async (id) => {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/instructors/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};
