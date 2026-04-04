const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key_here";

const log = (level, msg, meta = {}) => {
  const ts   = new Date().toISOString();
  const info = Object.keys(meta).length
    ? ' | ' + Object.entries(meta).map(([k,v]) => `${k}: ${v}`).join(' | ')
    : '';
  console[level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log'](
    `[${ts}] [${level.padEnd(5)}] [MIDDLEWARE] [AUTH          ] ${msg}${info}`
  );
};

function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    log('WARN', '✗ No token provided', { path: req.path, ip: req.ip });
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    log('INFO', '✓ Token verified', { email: decoded.email, role: decoded.role, path: req.path });
    next();
  } catch (err) {
    log('WARN', `✗ Token invalid: ${err.message}`, { path: req.path, ip: req.ip });
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

function superAdminOnly(req, res, next) {
  if (req.admin?.role !== "super-admin") {
    log('WARN', '✗ Access denied — super-admin required', { email: req.admin?.email, role: req.admin?.role, path: req.path });
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  log('INFO', '✓ Super-admin access granted', { email: req.admin.email, path: req.path });
  next();
}

module.exports = { protect, superAdminOnly };
