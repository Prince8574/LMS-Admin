const API = "http://localhost:5000/api/revenue";

function authHeaders() {
  const token = localStorage.getItem("admin_token"); // matches authService.js key
  return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
}

async function handleRes(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const revenueService = {
  // Stats
  getStats: () =>
    fetch(`${API}/stats`, { headers: authHeaders() }).then(handleRes),

  // Transactions
  getTransactions: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return fetch(`${API}/transactions${qs ? "?" + qs : ""}`, { headers: authHeaders() }).then(handleRes);
  },
  createTransaction: (data) =>
    fetch(`${API}/transactions`, { method: "POST", headers: authHeaders(), body: JSON.stringify(data) }).then(handleRes),
  updateTxStatus: (id, status) =>
    fetch(`${API}/transactions/${id}/status`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ status }) }).then(handleRes),

  // Payouts
  getPayouts: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return fetch(`${API}/payouts${qs ? "?" + qs : ""}`, { headers: authHeaders() }).then(handleRes);
  },
  createPayout: (data) =>
    fetch(`${API}/payouts`, { method: "POST", headers: authHeaders(), body: JSON.stringify(data) }).then(handleRes),
  updatePayoutStatus: (id, status) =>
    fetch(`${API}/payouts/${id}/status`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ status }) }).then(handleRes),
  processAllPayouts: () =>
    fetch(`${API}/payouts/process-all`, { method: "POST", headers: authHeaders() }).then(handleRes),

  // Course revenue
  getCourseRevenue: (sortBy) => {
    const qs = sortBy ? `?sortBy=${sortBy}` : "";
    return fetch(`${API}/courses${qs}`, { headers: authHeaders() }).then(handleRes);
  },
};
