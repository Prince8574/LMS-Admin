const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/auth";

async function request(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  return res.json();
}

function getToken() {
  return localStorage.getItem("admin_token");
}

function saveToken(token) {
  localStorage.setItem("admin_token", token);
}

function clearToken() {
  localStorage.removeItem("admin_token");
}

export const authService = {
  login: (email, password) =>
    request("/login", { email, password }).then((data) => {
      if (data.success) saveToken(data.token);
      return data;
    }),

  register: (name, email, password) =>
    request("/register", { name, email, password }).then((data) => {
      if (data.success) saveToken(data.token);
      return data;
    }),

  forgotPassword: (email) =>
    request("/forgot-password", { email }),

  // OTP flow
  sendOtp: (email) =>
    request("/send-otp", { email }),

  verifyOtp: (email, otp) =>
    request("/verify-otp", { email, otp }),

  resetPassword: (token, newPassword) =>
    request("/reset-password", { token, newPassword }),

  getMe: async () => {
    const token = getToken();
    if (!token) return { success: false };
    try {
      const res = await fetch(`${BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.json();
    } catch {
      return { success: false };
    }
  },

  logout: async () => {
    const token = getToken();
    if (token) {
      try {
        await fetch(`${BASE_URL}/logout`, {
          method:  "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch { /* ignore if backend offline */ }
    }
    clearToken();
  },

  isLoggedIn: () => !!getToken(),
};
