const bcrypt   = require("bcryptjs");
const Settings = require("../models/Settings");
const Admin    = require("../models/Admin");

// ── PROFILE ──────────────────────────────────

// GET /api/settings/profile
async function getProfile(req, res) {
  try {
    const profile = await Settings.getProfile(req.admin.id);
    const admin   = await Admin.findByEmail(req.admin.email);
    // Merge DB profile with base admin data
    const data = {
      name:     profile?.name     || admin.name,
      email:    profile?.email    || admin.email,
      phone:    profile?.phone    || "",
      bio:      profile?.bio      || "",
      role:     admin.role,
      timezone: profile?.timezone || "Asia/Kolkata",
      language: profile?.language || "English (India)",
    };
    res.json({ success: true, profile: data });
  } catch (err) {
    console.error("getProfile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// PUT /api/settings/profile
async function updateProfile(req, res) {
  try {
    const { name, email, phone, bio, timezone, language } = req.body;
    await Settings.upsertProfile(req.admin.id, { name, email, phone, bio, timezone, language });
    // Also update name in admins collection
    if (name) {
      const db = require("../config/db").getDB();
      const { ObjectId } = require("mongodb");
      await db.collection("admins").updateOne(
        { _id: new ObjectId(req.admin.id) },
        { $set: { name } }
      );
    }
    res.json({ success: true, message: "Profile updated successfully!" });
  } catch (err) {
    console.error("updateProfile:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// ── SECURITY ─────────────────────────────────

// PUT /api/settings/security/password
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: "All fields required" });
    if (newPassword.length < 8)
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });

    const admin   = await Admin.findByEmail(req.admin.email);
    const isMatch = await Admin.verifyPassword(currentPassword, admin.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Current password is incorrect" });

    await Admin.updatePassword(req.admin.email, newPassword);
    res.json({ success: true, message: "Password changed successfully!" });
  } catch (err) {
    console.error("changePassword:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// GET /api/settings/security/sessions
async function getSessions(req, res) {
  try {
    const sessions = await Settings.getSessions(req.admin.id);
    res.json({ success: true, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// DELETE /api/settings/security/sessions/:id
async function revokeSession(req, res) {
  try {
    await Settings.revokeSession(req.admin.id, req.params.id);
    res.json({ success: true, message: "Session revoked" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// DELETE /api/settings/security/sessions
async function revokeAllSessions(req, res) {
  try {
    await Settings.revokeAllSessions(req.admin.id);
    res.json({ success: true, message: "All sessions revoked" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// ── PLATFORM CONFIG ───────────────────────────

// GET /api/settings/platform
async function getPlatformConfig(req, res) {
  try {
    const config = await Settings.getPlatformConfig();
    res.json({ success: true, config: config || {} });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// PUT /api/settings/platform
async function updatePlatformConfig(req, res) {
  try {
    const allowed = [
      "platformName","tagline","supportEmail",
      "maxFileSize","videoQuality","maintenanceMode",
      "publicRegistration","emailVerification","autoApprove",
      "reviewDays","platformFee","minPayout"
    ];
    const data = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) data[k] = req.body[k]; });
    await Settings.upsertPlatformConfig(data);
    res.json({ success: true, message: "Platform config saved!" });
  } catch (err) {
    console.error("updatePlatformConfig:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// ── NOTIFICATIONS ─────────────────────────────

// GET /api/settings/notifications
async function getNotifications(req, res) {
  try {
    const prefs = await Settings.getNotificationPrefs(req.admin.id);
    res.json({ success: true, prefs: prefs || {} });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// PUT /api/settings/notifications
async function updateNotifications(req, res) {
  try {
    await Settings.upsertNotificationPrefs(req.admin.id, req.body);
    res.json({ success: true, message: "Notification preferences saved!" });
  } catch (err) {
    console.error("updateNotifications:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = {
  getProfile, updateProfile,
  changePassword, getSessions, revokeSession, revokeAllSessions,
  getPlatformConfig, updatePlatformConfig,
  getNotifications, updateNotifications,
};
