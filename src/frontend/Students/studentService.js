import API_BASE from '../../config/api';
const API = `${API_BASE}/api/students`;

function authHeaders() {
  const token = localStorage.getItem("admin_token"); // matches authService.js key
  return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
}

async function handleRes(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const studentService = {
  // GET /api/students?search=&status=&plan=&sortBy=&page=&limit=
  getAll: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return fetch(`${API}${qs ? "?" + qs : ""}`, { headers: authHeaders() }).then(handleRes);
  },

  // GET /api/students/stats
  getStats: () =>
    fetch(`${API}/stats`, { headers: authHeaders() }).then(handleRes),

  // GET /api/students/:id
  getOne: (id) =>
    fetch(`${API}/${id}`, { headers: authHeaders() }).then(handleRes),

  // POST /api/students
  create: (data) =>
    fetch(API, { method: "POST", headers: authHeaders(), body: JSON.stringify(data) }).then(handleRes),

  // PUT /api/students/:id
  update: (id, data) =>
    fetch(`${API}/${id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(data) }).then(handleRes),

  // PATCH /api/students/:id/status
  setStatus: (id, status) =>
    fetch(`${API}/${id}/status`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ status }) }).then(handleRes),

  // PATCH /api/students/:id/plan
  setPlan: (id, plan) =>
    fetch(`${API}/${id}/plan`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ plan }) }).then(handleRes),

  // DELETE /api/students/:id
  delete: (id) =>
    fetch(`${API}/${id}`, { method: "DELETE", headers: authHeaders() }).then(handleRes),

  // POST /api/students/bulk  — action: suspend | activate | upgrade | downgrade | delete
  bulk: (ids, action) =>
    fetch(`${API}/bulk`, { method: "POST", headers: authHeaders(), body: JSON.stringify({ ids, action }) }).then(handleRes),
};
