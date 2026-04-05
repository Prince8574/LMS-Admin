const jwt   = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { sendOTPEmail } = require("../services/emailService");

const JWT_SECRET  = process.env.JWT_SECRET  || "your_super_secret_key_here";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

const log = (level, action, msg, meta = {}) => {
  const ts   = new Date().toISOString();
  const base = `[${ts}] [${level.padEnd(5)}] [AUTH] [${action.padEnd(14)}]`;
  const info = Object.keys(meta).length
    ? ' | ' + Object.entries(meta).map(([k,v]) => `${k}: ${v}`).join(' | ')
    : '';
  console[level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log'](`${base} ${msg}${info}`);
};

function generateToken(admin) {
  return jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role, name: admin.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

// POST /api/auth/register
async function register(req, res) {
  const { name, email, password, role, secretKey } = req.body;
  log('INFO', 'REGISTER', 'Registration attempt', { email: email || 'N/A' });
  try {
    if (!name || !email || !password) {
      log('WARN', 'REGISTER', 'Missing required fields', { email: email || 'N/A' });
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const existing = await Admin.findByEmail(email);
    if (existing) {
      log('WARN', 'REGISTER', 'Email already registered', { email });
      return res.status(409).json({ success: false, message: "Email already registered" });
    }

    // Determine role based on secret key
    const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'SuperAdmin2026';
    const assignedRole = secretKey && secretKey === ADMIN_SECRET ? 'super_admin' : 'instructor';

    const admin = await Admin.createAdmin({ name, email, password, role: assignedRole });
    const token = generateToken(admin);
    log('INFO', 'REGISTER', '✓ Admin registered successfully', { email, name, role: assignedRole });

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    log('ERROR', 'REGISTER', `✗ Registration failed: ${err.message}`, { email: email || 'N/A' });
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;
  log('INFO', 'LOGIN', 'Login attempt', { email: email || 'N/A', ip: req.ip });
  try {
    if (!email || !password) {
      log('WARN', 'LOGIN', 'Missing credentials', { email: email || 'N/A' });
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const admin = await Admin.findByEmail(email);
    if (!admin) {
      log('WARN', 'LOGIN', '✗ Email not found in DB', { email });
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await Admin.verifyPassword(password, admin.password);
    if (!isMatch) {
      log('WARN', 'LOGIN', '✗ Password mismatch', { email });
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(admin);
    log('INFO', 'LOGIN', '✓ Login successful', { email, name: admin.name, role: admin.role });

    res.json({
      success: true,
      message: "Login successful",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    log('ERROR', 'LOGIN', `✗ Login error: ${err.message}`, { email: email || 'N/A' });
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// POST /api/auth/send-otp
async function sendOTP(req, res) {
  const { email } = req.body;
  log('INFO', 'SEND-OTP', 'OTP request received', { email: email || 'N/A' });
  try {
    if (!email) {
      log('WARN', 'SEND-OTP', 'Email missing in request');
      return res.status(400).json({ success: false, message: "Email required" });
    }

    const admin = await Admin.findByEmail(email);
    if (!admin) {
      log('WARN', 'SEND-OTP', '✗ Email not registered', { email });
      return res.status(404).json({ success: false, message: "Email not registered" });
    }

    const otp    = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await Admin.setOTP(email, otp, expiry);
    await sendOTPEmail(email, otp, { name: admin.name, purpose: "forgot-password" });
    log('INFO', 'SEND-OTP', '✓ OTP sent successfully', { email, expiresAt: expiry.toISOString() });

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    log('ERROR', 'SEND-OTP', `✗ Failed to send OTP: ${err.message}`, { email: email || 'N/A' });
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
}

// POST /api/auth/verify-otp
async function verifyOTP(req, res) {
  const { email, otp } = req.body;
  log('INFO', 'VERIFY-OTP', 'OTP verification attempt', { email: email || 'N/A' });
  try {
    if (!email || !otp) {
      log('WARN', 'VERIFY-OTP', 'Missing email or OTP');
      return res.status(400).json({ success: false, message: "Email and OTP required" });
    }

    const admin = await Admin.findByOTP(email, otp);
    if (!admin) {
      log('WARN', 'VERIFY-OTP', '✗ Invalid or expired OTP', { email });
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    await Admin.clearOTP(email);
    const token = jwt.sign({ email, purpose: "otp-verified" }, JWT_SECRET, { expiresIn: "15m" });
    log('INFO', 'VERIFY-OTP', '✓ OTP verified successfully', { email });

    res.json({ success: true, message: "OTP verified", token });
  } catch (err) {
    log('ERROR', 'VERIFY-OTP', `✗ Verification error: ${err.message}`, { email: email || 'N/A' });
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res) {
  log('INFO', 'RESET-PWD', 'Password reset attempt');
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      log('WARN', 'RESET-PWD', 'Missing token or new password');
      return res.status(400).json({ success: false, message: "Token and new password required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      log('WARN', 'RESET-PWD', '✗ Invalid or expired reset token');
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    if (decoded.purpose !== "otp-verified") {
      log('WARN', 'RESET-PWD', '✗ Invalid token purpose', { purpose: decoded.purpose });
      return res.status(403).json({ success: false, message: "Invalid token purpose" });
    }

    await Admin.updatePassword(decoded.email, newPassword);
    log('INFO', 'RESET-PWD', '✓ Password reset successfully', { email: decoded.email });

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    log('ERROR', 'RESET-PWD', `✗ Reset error: ${err.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// GET /api/auth/me
async function getMe(req, res) {
  try {
    // Support both email-based and id-based lookup (Google OAuth uses id)
    const admin = req.admin.email
      ? await Admin.findByEmail(req.admin.email)
      : await (async () => { const db = require('../config/db').getDB(); return db.collection('admins').findOne({ _id: require('mongodb').ObjectId.createFromHexString(req.admin.id) }); })();

    if (!admin) {
      log('WARN', 'GET-ME', '✗ Admin not found', { email: req.admin.email, id: req.admin.id });
      return res.status(404).json({ success: false, message: "Admin not found" });
    }
    log('INFO', 'GET-ME', '✓ Profile fetched', { email: admin.email });
    res.json({
      success: true,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role, avatar: admin.avatar || null },
    });
  } catch (err) {
    log('ERROR', 'GET-ME', `✗ Error: ${err.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// POST /api/auth/logout
function logout(req, res) {
  log('INFO', 'LOGOUT', '✓ Admin logged out', { email: req.admin?.email || 'N/A' });
  res.json({ success: true, message: "Logged out successfully" });
}

// POST /api/auth/create-instructor  — super_admin only
async function createInstructor(req, res) {
  const { name, email, password } = req.body;
  log('INFO', 'CREATE-INST', 'Create instructor attempt', { by: req.admin?.email, email });
  try {
    if (req.admin?.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: "Only super_admin can create instructors" });
    }
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password required" });
    }
    const existing = await Admin.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    const instructor = await Admin.createAdmin({ name, email, password, role: 'instructor' });
    log('INFO', 'CREATE-INST', '✓ Instructor created', { email, name });
    res.status(201).json({
      success: true,
      message: "Instructor created successfully",
      instructor: { id: instructor._id, name: instructor.name, email: instructor.email, role: instructor.role },
    });
  } catch (err) {
    log('ERROR', 'CREATE-INST', `✗ Failed: ${err.message}`);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// GET /api/auth/instructors  — super_admin only: list all instructors + admins
async function listInstructors(req, res) {
  try {
    if (req.admin?.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const { getDB } = require('../config/db');
    const db = getDB();
    // Return ALL admins (instructor + super_admin) so drawer can show their details
    const instructors = await db.collection('admins')
      .find({}, { projection: { password: 0, otp: 0, resetToken: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ success: true, data: instructors });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}
// DELETE /api/auth/instructors/:id  — super_admin only
async function deleteInstructor(req, res) {
  try {
    if (req.admin?.role !== 'super_admin') {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    const { getDB } = require('../config/db');
    const { ObjectId } = require('mongodb');
    const db = getDB();
    await db.collection('admins').deleteOne({ _id: new ObjectId(req.params.id), role: 'instructor' });
    res.json({ success: true, message: "Instructor removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { register, login, sendOTP, forgotPassword: sendOTP, verifyOTP, resetPassword, getMe, logout, createInstructor, listInstructors, deleteInstructor };
