const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

const COLLECTION = "users"; // same collection as student-panel users

// Get all students with optional filters & pagination
async function getAllStudents({ search, status, plan, sortBy = "createdAt", page = 1, limit = 50, instructorCourseIds = null } = {}) {
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

  // If instructor: only students enrolled in their courses
  let enrolledStudentIds = null;
  if (instructorCourseIds !== null) {
    const enrollments = await db.collection("enrollments").find(
      { course: { $in: instructorCourseIds } }
    ).project({ user: 1, student: 1 }).toArray();
    const ids = [...new Set(enrollments.map(e => (e.user || e.student)?.toString()).filter(Boolean))];
    enrolledStudentIds = ids.map(id => { try { return new ObjectId(id); } catch { return null; } }).filter(Boolean);
    if (enrolledStudentIds.length === 0) return { students: [], total: 0, page, pages: 0 };
    filter._id = { $in: enrolledStudentIds };
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
    .project({ password: 0 })
    .toArray();

  // Enrich each student with computed fields from enrollments
  const enriched = await Promise.all(students.map(async (s) => {
    const enrollments = await db.collection("enrollments").find({
      $or: [
        { user: s._id },
        { user: s._id.toString() },
        { student: s._id },
        { student: s._id.toString() },
      ]
    }).toArray();

    const enrolledCount = enrollments.length || (s.enrolledCourses?.length) || 0;
    const completedCount = enrollments.filter(e => e.progress >= 100).length || (s.completedCourses?.length) || 0;
    const avgProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
      : (s.avgProgress || 0);
    const totalSpent = enrollments.reduce((sum, e) => sum + (e.payment?.amount || e.amountPaid || 0), 0) || s.totalSpent || 0;
    const hasPaid = enrollments.some(e => e.payment?.status === "paid" && e.payment?.amount > 0);
    const lastEnrollDate = enrollments.reduce((latest, e) => {
      const d = e.enrolledAt || e.updatedAt;
      return d && (!latest || new Date(d) > new Date(latest)) ? d : latest;
    }, null);

    return {
      ...s,
      plan: s.plan === "premium" ? "premium" : (hasPaid ? "premium" : "free"),
      status: s.status || "inactive",
      enrolledCourses: s.enrolledCourses || [],
      enrolledCount,
      completedCount,
      avgProgress,
      totalSpent,
      lastActive: s.lastActive || lastEnrollDate || s.updatedAt || s.createdAt || null,
    };
  }));

  return { students: enriched, total, page, pages: Math.ceil(total / limit) };
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

  const [total, premium] = await Promise.all([
    col.countDocuments({ role: "student" }),
    col.countDocuments({ role: "student", plan: "premium" }),
  ]);

  // Active today — use updatedAt or lastActive
  const activeToday = await col.countDocuments({
    role: "student",
    $or: [
      { lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
      { updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    ]
  });

  // Avg progress from enrollments
  const enrollAgg = await db.collection("enrollments").aggregate([
    { $group: { _id: null, avgProgress: { $avg: "$progress" }, totalRevenue: { $sum: "$amountPaid" } } }
  ]).toArray();

  const agg = enrollAgg[0] || { avgProgress: 0, totalRevenue: 0 };

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
