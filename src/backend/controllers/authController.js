const jwt   = require("jsonwebtoken");
const Admin = require("../models/Admin");
const { sendOTPEmail } = require("../services/emailService");

const JWT_SECRET  = process.env.JWT_SECRET  || "your_super_secret_key_here";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

function generateToken(admin) {
  return jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields required" });

    const existing = await Admin.findByEmail(email);
    if (existing)
      return res.status(409).json({ success: false, message: "Email already registered" });

    const admin = await Admin.createAdmin({ name, email, password, role });
    const token = generateToken(admin);

    res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const admin = await Admin.findByEmail(email);
    if (!admin)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await Admin.verifyPassword(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = generateToken(admin);
    res.json({
      success: true,
      message: "Login successful",
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// POST /api/auth/send-otp  (also used by /forgot-password)
async function sendOTP(req, res) {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "Email required" });

    const admin = await Admin.findByEmail(email);
    if (!admin)
      return res.status(404).json({ success: false, message: "Email not registered" });

    const otp    = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await Admin.setOTP(email, otp, expiry);
    await sendOTPEmail(email, otp, { name: admin.name, purpose: "forgot-password" });

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
}

// POST /api/auth/verify-otp
async function verifyOTP(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ success: false, message: "Email and OTP required" });

    const admin = await Admin.findByOTP(email, otp);
    if (!admin)
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    await Admin.clearOTP(email);

    const token = jwt.sign({ email, purpose: "otp-verified" }, JWT_SECRET, { expiresIn: "15m" });
    res.json({ success: true, message: "OTP verified", token });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// POST /api/auth/reset-password
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ success: false, message: "Token and new password required" });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(400).json({ success: false, message: "Invalid or expired token" });
    }

    if (decoded.purpose !== "otp-verified")
      return res.status(403).json({ success: false, message: "Invalid token purpose" });

    await Admin.updatePassword(decoded.email, newPassword);
    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// GET /api/auth/me  (protected)
async function getMe(req, res) {
  try {
    const admin = await Admin.findByEmail(req.admin.email);
    if (!admin)
      return res.status(404).json({ success: false, message: "Admin not found" });

    res.json({
      success: true,
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// POST /api/auth/logout
function logout(_req, res) {
  res.json({ success: true, message: "Logged out successfully" });
}

module.exports = { register, login, sendOTP, forgotPassword: sendOTP, verifyOTP, resetPassword, getMe, logout };
