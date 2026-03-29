const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

const COLLECTION = "users"; // same collection as student-panel users

// Get all students with optional filters & pagination
async function getAllStudents({ search, status, plan, sortBy = "createdAt", page = 1, limit = 50 } = {}) {
  const db = getDB();
  const filter = { role: "student" };

  if (status && status !== "all") filter.status = status;
  if (plan && plan !== "all") filter.plan = plan;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const sortMap = {
    lastActive: { lastActive: -1 },
    name: { name: 1 },
    joinDate: { createdAt: -1 },
    progress: { avgProgress: -1 },
    spent: { totalSpent: -1 },
  };

  const skip = (page - 1) * limit;
  const total = await db.collection(COLLECTION).countDocuments(filter);
  const students = await db
    .collection(COLLECTION)
    .find(filter)
    .sort(sortMap[sortBy] || { createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .project({ password: 0 }) // never return password
    .toArray();

  return { students, total, page, pages: Math.ceil(total / limit) };
}

// Get single student by ID
async function getStudentById(id) {
  const db = getDB();
  return db.collection(COLLECTION).findOne(
    { _id: new ObjectId(id), role: "student" },
    { projection: { password: 0 } }
  );
}

// Create student (admin adds manually)
async function createStudent({ name, email, password = "Student@123", phone, city, plan = "free" }) {
  const db = getDB();

  const existing = await db.collection(COLLECTION).findOne({ email: email.toLowerCase() });
  if (existing) throw new Error("Email already registered");

  const hash = await bcrypt.hash(password, 10);
  const doc = {
    name,
    email: email.toLowerCase(),
    password: hash,
    phone: phone || "",
    role: "student",
    plan: plan || "free",
    status: "active",
    city: city || "",
    avatar: "default-avatar.png",
    enrolledCourses: [],
    completedCourses: [],
    wishlist: [],
    totalSpent: 0,
    avgProgress: 0,
    streak: 0,
    rating: 0,
    lastActive: new Date(),
    createdAt: new Date(),
  };

  const result = await db.collection(COLLECTION).insertOne(doc);
  const { password: _, ...safe } = doc;
  return { ...safe, _id: result.insertedId };
}

// Update student (status, plan, etc.)
async function updateStudent(id, updates) {
  const db = getDB();
  // Never allow password update through this path
  delete updates.password;
  updates.updatedAt = new Date();

  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id), role: "student" },
    { $set: updates },
    { returnDocument: "after", projection: { password: 0 } }
  );
  return result;
}

// Suspend / activate student
async function setStudentStatus(id, status) {
  return updateStudent(id, { status });
}

// Delete student
async function deleteStudent(id) {
  const db = getDB();
  return db.collection(COLLECTION).deleteOne({ _id: new ObjectId(id), role: "student" });
}

// Get student stats summary for dashboard
async function getStudentStats() {
  const db = getDB();
  const col = db.collection(COLLECTION);

  const [total, activeToday, premium] = await Promise.all([
    col.countDocuments({ role: "student" }),
    col.countDocuments({
      role: "student",
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }),
    col.countDocuments({ role: "student", plan: "premium" }),
  ]);

  // Avg progress across all students
  const aggResult = await col
    .aggregate([
      { $match: { role: "student" } },
      { $group: { _id: null, avgProgress: { $avg: "$avgProgress" }, totalRevenue: { $sum: "$totalSpent" } } },
    ])
    .toArray();

  const agg = aggResult[0] || { avgProgress: 0, totalRevenue: 0 };

  return {
    total,
    activeToday,
    premium,
    avgProgress: Math.round(agg.avgProgress || 0),
    totalRevenue: agg.totalRevenue || 0,
  };
}

module.exports = { getAllStudents, getStudentById, createStudent, updateStudent, setStudentStatus, deleteStudent, getStudentStats };

// ── OTP helpers ──────────────────────────────────────────────────────────────
async function setOTP(email, otp, expiry) {
  const db = getDB();
  return db.collection(COLLECTION).updateOne(
    { email: email.toLowerCase(), role: "student" },
    { $set: { otp, otpExpiry: expiry } }
  );
}

async function findByOTP(email, otp) {
  const db = getDB();
  return db.collection(COLLECTION).findOne({
    email: email.toLowerCase(),
    role: "student",
    otp,
    otpExpiry: { $gt: new Date() },
  });
}

async function clearOTP(email) {
  const db = getDB();
  return db.collection(COLLECTION).updateOne(
    { email: email.toLowerCase(), role: "student" },
    { $set: { otp: null, otpExpiry: null } }
  );
}

async function findByEmail(email) {
  const db = getDB();
  return db.collection(COLLECTION).findOne({ email: email.toLowerCase(), role: "student" });
}

async function updatePassword(email, newPassword) {
  const db = getDB();
  const hash = await bcrypt.hash(newPassword, 10);
  return db.collection(COLLECTION).updateOne(
    { email: email.toLowerCase(), role: "student" },
    { $set: { password: hash } }
  );
}

module.exports = {
  getAllStudents, getStudentById, createStudent, updateStudent,
  setStudentStatus, deleteStudent, getStudentStats,
  setOTP, findByOTP, clearOTP, findByEmail, updatePassword,
};
