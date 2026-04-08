import API_BASE from '../../config/api';
const BASE = `${API_BASE}/api`;

function getToken() {
  return localStorage.getItem("admin_token") || "";
}

function authHeaders() {
  return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function uploadThumbnail(file) {
  const form = new FormData();
  form.append("thumbnail", file);
  const res = await fetch(`${BASE}/upload/thumbnail`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: form,
  });
  return res.json();
}

export const courseService = {
  getAll:    (params = "") => req("GET",    `/courses${params}`),
  getOne:    (id)          => req("GET",    `/courses/${id}`),
  getStats:  ()            => req("GET",    "/courses/stats"),
  create:    (data)        => req("POST",   "/courses",          data),
  update:    (id, data)    => req("PUT",    `/courses/${id}`,    data),
  remove:    (id)          => req("DELETE", `/courses/${id}`),
  publish:   (id, val)     => req("PATCH",  `/courses/${id}/publish`, { isPublished: val }),
  uploadThumbnail,
};
