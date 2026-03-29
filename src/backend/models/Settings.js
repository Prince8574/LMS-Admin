const { getDB } = require("../config/db");

const COL_PROFILE      = "admin_profiles";
const COL_PLATFORM     = "platform_settings";
const COL_NOTIFICATIONS = "notification_prefs";
const COL_SESSIONS     = "admin_sessions";

// ── PROFILE ──────────────────────────────────
async function getProfile(adminId) {
  const db = getDB();
  return db.collection(COL_PROFILE).findOne({ adminId });
}

async function upsertProfile(adminId, data) {
  const db = getDB();
  const { role, ...safe } = data; // role cannot be changed via profile
  return db.collection(COL_PROFILE).updateOne(
    { adminId },
    { $set: { ...safe, adminId, updatedAt: new Date() } },
    { upsert: true }
  );
}

// ── PLATFORM CONFIG ───────────────────────────
async function getPlatformConfig() {
  const db = getDB();
  return db.collection(COL_PLATFORM).findOne({ _id: "global" });
}

async function upsertPlatformConfig(data) {
  const db = getDB();
  return db.collection(COL_PLATFORM).updateOne(
    { _id: "global" },
    { $set: { ...data, updatedAt: new Date() } },
    { upsert: true }
  );
}

// ── NOTIFICATIONS ─────────────────────────────
async function getNotificationPrefs(adminId) {
  const db = getDB();
  return db.collection(COL_NOTIFICATIONS).findOne({ adminId });
}

async function upsertNotificationPrefs(adminId, prefs) {
  const db = getDB();
  return db.collection(COL_NOTIFICATIONS).updateOne(
    { adminId },
    { $set: { ...prefs, adminId, updatedAt: new Date() } },
    { upsert: true }
  );
}

// ── SESSIONS ──────────────────────────────────
async function getSessions(adminId) {
  const db = getDB();
  return db.collection(COL_SESSIONS).find({ adminId }).toArray();
}

async function revokeSession(adminId, sessionId) {
  const { ObjectId } = require("mongodb");
  const db = getDB();
  return db.collection(COL_SESSIONS).deleteOne({
    _id: new ObjectId(sessionId),
    adminId,
  });
}

async function revokeAllSessions(adminId, keepCurrent) {
  const db = getDB();
  const query = keepCurrent
    ? { adminId, _id: { $ne: keepCurrent } }
    : { adminId };
  return db.collection(COL_SESSIONS).deleteMany(query);
}

module.exports = {
  getProfile, upsertProfile,
  getPlatformConfig, upsertPlatformConfig,
  getNotificationPrefs, upsertNotificationPrefs,
  getSessions, revokeSession, revokeAllSessions,
};
