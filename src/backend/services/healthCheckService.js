const http  = require('http');
const https = require('https');
const { saveCheck } = require('../models/HealthCheck');

const ADMIN_URL   = (process.env.ADMIN_BACKEND_URL  || 'http://localhost:5000').replace(/\/$/, '');
const STUDENT_URL = (process.env.STUDENT_BACKEND_URL || 'http://localhost:5001').replace(/\/$/, '');

const SERVICES = [
  // ── Core Infrastructure ──────────────────────────────
  { name: 'Admin Backend',          url: `${ADMIN_URL}/api/health` },
  { name: 'Student Backend',        url: `${STUDENT_URL}/api/health` },
  { name: 'MongoDB',                url: null },
  { name: 'Email Service',          url: null },
  { name: 'Google OAuth',           url: `${ADMIN_URL}/api/auth/google`, expectRedirect: true },

  // ── Admin Panel APIs ─────────────────────────────────
  { name: 'Admin — Course API',     url: `${ADMIN_URL}/api/courses`,     expectAuth: true },
  { name: 'Admin — Student API',    url: `${ADMIN_URL}/api/students`,    expectAuth: true },
  { name: 'Admin — Assignment API', url: `${ADMIN_URL}/api/assignments`, expectAuth: true },
  { name: 'Admin — Revenue API',    url: `${ADMIN_URL}/api/revenue`,     expectAuth: true },
  { name: 'Admin — Settings API',   url: `${ADMIN_URL}/api/settings`,    expectAuth: true },

  // ── Student Panel APIs ───────────────────────────────
  { name: 'Student — Course API',   url: `${STUDENT_URL}/api/courses` },
  { name: 'Student — Enroll API',   url: `${STUDENT_URL}/api/enrollments/my-courses`, expectAuth: true },
  { name: 'Student — Assign API',   url: `${STUDENT_URL}/api/assignments`,            expectAuth: true },
  { name: 'Student — Community',    url: `${STUDENT_URL}/api/posts`,                  expectAuth: true },
  { name: 'Student — AI Assistant', url: `${STUDENT_URL}/api/ai/health` },
];

function httpGet(url, timeout = 4000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, (res) => {
      const latency = Date.now() - start;
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body, latency }));
    });
    req.setTimeout(timeout, () => { req.destroy(); reject(new Error('Timeout')); });
    req.on('error', reject);
  });
}

async function checkService(svc, dbStatus, emailReady) {
  const ts = new Date().toISOString();

  // MongoDB — use DB connection status
  if (svc.name === 'MongoDB') {
    const ok = dbStatus === 'connected';
    await saveCheck({ service: svc.name, ok, latency: null, message: ok ? 'Connected' : 'Disconnected' });
    console.log(`[${ts}] [HEALTH] ${svc.name.padEnd(18)} ${ok ? '✓ OK' : '✗ FAIL'}`);
    return;
  }

  // Email Service
  if (svc.name === 'Email Service') {
    const ok = emailReady === true;
    await saveCheck({ service: svc.name, ok, latency: null, message: ok ? 'Ready' : 'Not configured' });
    console.log(`[${ts}] [HEALTH] ${svc.name.padEnd(18)} ${ok ? '✓ OK' : '✗ FAIL'}`);
    return;
  }

  // HTTP-based checks
  try {
    const { status, body, latency } = await httpGet(svc.url);
    let ok = false;
    let message = '';

    if (svc.expectRedirect) {
      ok = status === 302 || status === 301;
      message = ok ? `Redirect ${status}` : `Unexpected status ${status}`;
    } else if (svc.expectAuth) {
      // 401 means endpoint exists but needs auth — that's OK
      ok = status === 401 || (status >= 200 && status < 300);
      message = ok ? `Endpoint reachable · ${latency}ms` : `HTTP ${status}`;
    } else {
      try {
        const data = JSON.parse(body);
        // Accept status:'ok', status:'OK', or success:true
        ok = status >= 200 && status < 300 && (data.status === 'ok' || data.status === 'OK' || data.success === true);
        message = ok ? `${data.db || 'ok'} · ${latency}ms` : `Status: ${data.status}`;
      } catch {
        ok = status >= 200 && status < 300;
        message = `HTTP ${status} · ${latency}ms`;
      }
    }

    await saveCheck({ service: svc.name, ok, latency, message });
    console.log(`[${ts}] [HEALTH] ${svc.name.padEnd(18)} ${ok ? '✓ OK' : '✗ FAIL'} ${latency}ms`);
  } catch (err) {
    await saveCheck({ service: svc.name, ok: false, latency: null, message: err.message });
    console.log(`[${ts}] [HEALTH] ${svc.name.padEnd(18)} ✗ FAIL ${err.message}`);
  }
}

async function runAllChecks(dbStatus, emailReady) {
  for (const svc of SERVICES) {
    await checkService(svc, dbStatus, emailReady);
  }
}

function startHealthCheckScheduler(getDbStatus, getEmailReady, intervalMs = 30 * 1000) {
  console.log(`[HEALTH] Scheduler started — interval: ${intervalMs / 1000}s`);
  // Run immediately on start
  setTimeout(() => runAllChecks(getDbStatus(), getEmailReady()), 5000);
  // Then every interval
  setInterval(() => runAllChecks(getDbStatus(), getEmailReady()), intervalMs);
}

module.exports = { startHealthCheckScheduler, runAllChecks };
