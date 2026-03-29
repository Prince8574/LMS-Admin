const { getDB } = require("../config/db");
const bcrypt    = require("bcryptjs");

const COLLECTION = "admins";

// Create a new admin
async function createAdmin({ name, email, password, role = "admin" }) {
  const db   = getDB();
  const hash = await bcrypt.hash(password, 12);
  const doc  = {
    name,
    email: email.toLowerCase(),
    password: hash,
    role,
    createdAt: new Date(),
    resetToken: null,
    resetTokenExpiry: null,
  };
  const result = await db.collection(COLLECTION).insertOne(doc);
  return { ...doc, _id: result.insertedId };
}

// Find admin by email
async function findByEmail(email) {
  const db = getDB();
  return db.collection(COLLECTION).findOne({ email: email.toLowerCase() });
}

// Find admin by reset token
async function findByResetToken(token) {
  const db = getDB();
  return db.collection(COLLECTION).findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: new Date() },
  });
}

// Update reset token
async function setResetToken(email, token, expiry) {
  const db = getDB();
  return db.collection(COLLECTION).updateOne(
    { email: email.toLowerCase() },
    { $set: { resetToken: token, resetTokenExpiry: expiry } }
  );
}

// Update password & clear reset token
async function updatePassword(email, newPassword) {
  const db   = getDB();
  const hash = await bcrypt.hash(newPassword, 12);
  return db.collection(COLLECTION).updateOne(
    { email: email.toLowerCase() },
    { $set: { password: hash, resetToken: null, resetTokenExpiry: null } }
  );
}

// Compare plain password with hash
async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// Save OTP for email verification
async function setOTP(email, otp, expiry) {
  const db = getDB();
  return db.collection(COLLECTION).updateOne(
    { email: email.toLowerCase() },
    { $set: { otp, otpExpiry: expiry, otpVerified: false } }
  );
}

// Find admin by valid OTP
async function findByOTP(email, otp) {
  const db = getDB();
  return db.collection(COLLECTION).findOne({
    email: email.toLowerCase(),
    otp,
    otpExpiry: { $gt: new Date() },
  });
}

// Mark OTP as verified / clear it
async function clearOTP(email) {
  const db = getDB();
  return db.collection(COLLECTION).updateOne(
    { email: email.toLowerCase() },
    { $set: { otp: null, otpExpiry: null, otpVerified: true } }
  );
}

module.exports = {
  createAdmin, findByEmail, findByResetToken, setResetToken,
  updatePassword, verifyPassword, setOTP, findByOTP, clearOTP,
};
