const BASE = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace("/auth", "/settings")
  : "http://localhost:5000/api/settings";

function token() {
  return localStorage.getItem("admin_token");
}

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token()}`,
  };
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { headers: headers() });
  return res.json();
}

async function put(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers: headers(),
    body: JSON.stringify(body),
  });
  return res.json();
}

async function del(path) {
  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    headers: headers(),
  });
  return res.json();
}

export const settingsService = {
  // Profile
  getProfile:    ()       => get("/profile"),
  updateProfile: (data)   => put("/profile", data),

  // Security
  changePassword:   (currentPassword, newPassword) =>
    put("/security/password", { currentPassword, newPassword }),
  getSessions:      ()   => get("/security/sessions"),
  revokeSession:    (id) => del(`/security/sessions/${id}`),
  revokeAllSessions:()   => del("/security/sessions"),

  // Platform
  getPlatformConfig:    ()     => get("/platform"),
  updatePlatformConfig: (data) => put("/platform", data),

  // Notifications
  getNotifications:    ()      => get("/notifications"),
  updateNotifications: (prefs) => put("/notifications", prefs),
};
