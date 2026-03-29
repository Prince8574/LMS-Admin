const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { getDB } = require("../config/db");
const { studentProtect } = require("../middleware/studentAuth");
const { sendOTPEmail } = require("../services/emailService");
const Student = require("../models/Student");

const JWT_SECRET = process.env.JWT_SECRET || "admin_secret_key_change_in_prod";
const JWT_EXPIRES = process.env.JWT_EXPIRES || "7d";

// POST /api/student/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields required" });

    const db = getDB();
    const existing = await db.collection("users").findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ success: false, message: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    const doc = {
      name, email: email.toLowerCase(), password: hash,
      role: "student", plan: "free", status: "active",
      avatar: "", enrolledCourses: [], completedCourses: [],
      wishlist: [], totalSpent: 0, avgProgress: 0,
      streak: 0, lastActive: new Date(), createdAt: new Date(),
    };
    const result = await db.collection("users").insertOne(doc);
    const token = jwt.sign({ id: result.insertedId, email: doc.email, role: "student" }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    res.status(201).json({ success: true, token, user: { id: result.insertedId, name, email: doc.email, role: "student" } });
  } catch (err) {
    console.error("Student register error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/student/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const db = getDB();
    const user = await db.collection("users").findOne({ email: email.toLowerCase(), role: "student" });
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid credentials" });

    await db.collection("users").updateOne({ _id: user._id }, { $set: { lastActive: new Date() } });

    const token = jwt.sign({ id: user._id, email: user.email, role: "student" }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: "student", avatar: user.avatar } });
  } catch (err) {
    console.error("Student login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/student/auth/me
router.get("/me", studentProtect, async (req, res) => {
  try {
    const { ObjectId } = require("mongodb");
    const db = getDB();
    const user = await db.collection("users").findOne(
      { _id: new ObjectId(req.user.id) },
      { projection: { password: 0 } }
    );
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/student/auth/logout
router.post("/logout", studentProtect, (req, res) => {
  res.json({ success: true, message: "Logged out" });
});

// POST /api/student/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  res.json({ success: true, message: "If that email exists, a reset link was sent" });
});

// POST /api/student/auth/send-otp
router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: "Email required" });

    const student = await Student.findByEmail(email);
    if (!student)
      return res.status(404).json({ success: false, message: "Email not registered" });

    const otp    = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await Student.setOTP(email, otp, expiry);
    await sendOTPEmail(email, otp);

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (err) {
    console.error("Student send-otp error:", err);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

// POST /api/student/auth/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ success: false, message: "Email and OTP required" });

    const student = await Student.findByOTP(email, otp);
    if (!student)
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });

    await Student.clearOTP(email);

    const token = jwt.sign(
      { email, purpose: "otp-verified", role: "student" },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ success: true, message: "OTP verified", token });
  } catch (err) {
    console.error("Student verify-otp error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST /api/student/auth/reset-password  (requires otp-verified token)
router.post("/reset-password", async (req, res) => {
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

    if (decoded.purpose !== "otp-verified" || decoded.role !== "student")
      return res.status(403).json({ success: false, message: "Invalid token purpose" });

    await Student.updatePassword(decoded.email, newPassword);

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("Student reset-password error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
