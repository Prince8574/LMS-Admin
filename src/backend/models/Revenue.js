const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const TX_COL      = "transactions";
const PAYOUT_COL  = "payouts";
const ENROLL_COL  = "enrollments";
const COURSE_COL  = "courses";
const USER_COL    = "users";

// ─── Transactions ────────────────────────────────────────

async function getAllTransactions({ status, search, page = 1, limit = 50 } = {}) {
  const db = getDB();
  const filter = {};
  if (status && status !== "all") filter.status = status;
  if (search) {
    filter.$or = [
      { studentName: { $regex: search, $options: "i" } },
      { courseTitle: { $regex: search, $options: "i" } },
      { txId: { $regex: search, $options: "i" } },
    ];
  }
  const skip  = (page - 1) * limit;
  const total = await db.collection(TX_COL).countDocuments(filter);
  const data  = await db.collection(TX_COL).find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
  return { data, total, page, pages: Math.ceil(total / limit) };
}

async function getTransactionById(id) {
  const db = getDB();
  return db.collection(TX_COL).findOne({ _id: new ObjectId(id) });
}

async function createTransaction(doc) {
  const db = getDB();
  const tx = {
    txId:        "TXN-" + Date.now(),
    studentId:   doc.studentId ? new ObjectId(doc.studentId) : null,
    studentName: doc.studentName,
    courseId:    doc.courseId ? new ObjectId(doc.courseId) : null,
    courseTitle: doc.courseTitle,
    amount:      parseFloat(doc.amount) || 0,
    fee:         parseFloat(doc.fee)    || 0,
    net:         parseFloat(doc.net)    || parseFloat(doc.amount) - parseFloat(doc.fee) || 0,
    method:      doc.method || "UPI",
    status:      doc.status || "success",
    type:        doc.type   || "enrollment",
    createdAt:   new Date(),
  };
  const result = await db.collection(TX_COL).insertOne(tx);
  return { ...tx, _id: result.insertedId };
}

async function updateTransactionStatus(id, status) {
  const db = getDB();
  return db.collection(TX_COL).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
}

// ─── Payouts ─────────────────────────────────────────────

async function getAllPayouts({ status } = {}) {
  const db = getDB();
  const filter = {};
  if (status && status !== "all") filter.status = status;
  return db.collection(PAYOUT_COL).find(filter).sort({ createdAt: -1 }).toArray();
}

async function createPayout(doc) {
  const db = getDB();
  const payout = {
    instructorId:   doc.instructorId ? new ObjectId(doc.instructorId) : null,
    instructorName: doc.instructorName,
    role:           doc.role || "Instructor",
    amount:         parseFloat(doc.amount) || 0,
    courses:        parseInt(doc.courses)  || 0,
    students:       parseInt(doc.students) || 0,
    status:         doc.status || "scheduled",
    scheduledDate:  doc.scheduledDate ? new Date(doc.scheduledDate) : null,
    paidAt:         null,
    createdAt:      new Date(),
  };
  const result = await db.collection(PAYOUT_COL).insertOne(payout);
  return { ...payout, _id: result.insertedId };
}

async function updatePayoutStatus(id, status) {
  const db = getDB();
  const update = { status, updatedAt: new Date() };
  if (status === "paid") update.paidAt = new Date();
  return db.collection(PAYOUT_COL).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: update },
    { returnDocument: "after" }
  );
}

async function processAllPayouts() {
  const db = getDB();
  const result = await db.collection(PAYOUT_COL).updateMany(
    { status: "scheduled" },
    { $set: { status: "paid", paidAt: new Date(), updatedAt: new Date() } }
  );
  return result.modifiedCount;
}

// ─── Revenue Stats ────────────────────────────────────────

async function getRevenueStats() {
  const db = getDB();
  const col = db.collection(TX_COL);

  const [totals, refunds, methodAgg, monthlyAgg] = await Promise.all([
    // Total revenue from successful transactions
    col.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" }, totalFees: { $sum: "$fee" }, totalNet: { $sum: "$net" }, count: { $sum: 1 } } }
    ]).toArray(),

    // Refund stats
    col.aggregate([
      { $match: { status: "refunded" } },
      { $group: { _id: null, refundAmount: { $sum: "$amount" }, refundCount: { $sum: 1 } } }
    ]).toArray(),

    // Payment method breakdown
    col.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: "$method", total: { $sum: "$amount" }, count: { $sum: 1 } } },
      { $sort: { total: -1 } }
    ]).toArray(),

    // Monthly revenue (last 8 months)
    col.aggregate([
      { $match: { status: "success", createdAt: { $gte: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000) } } },
      { $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        revenue: { $sum: "$amount" },
        expenses: { $sum: "$fee" },
        count: { $sum: 1 }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]).toArray(),
  ]);

  const t = totals[0] || { totalRevenue: 0, totalFees: 0, totalNet: 0, count: 0 };
  const r = refunds[0] || { refundAmount: 0, refundCount: 0 };
  const refundRate = t.count > 0 ? ((r.refundCount / (t.count + r.refundCount)) * 100).toFixed(1) : 0;

  // Payment method percentages
  const totalMethodRev = methodAgg.reduce((s, m) => s + m.total, 0);
  const paymentMethods = methodAgg.map(m => ({
    method: m._id,
    pct: totalMethodRev > 0 ? Math.round((m.total / totalMethodRev) * 100) : 0,
    amount: m.total,
  }));

  return {
    totalRevenue:    t.totalRevenue,
    platformEarnings: t.totalFees,
    netInstructorPay: t.totalNet,
    refundRate:      parseFloat(refundRate),
    totalTransactions: t.count,
    paymentMethods,
    monthly: monthlyAgg,
  };
}

// ─── Course Revenue ───────────────────────────────────────

async function getCourseRevenue({ sortBy = "revenue" } = {}) {
  const db = getDB();

  const agg = await db.collection(TX_COL).aggregate([
    { $match: { status: "success", courseId: { $ne: null } } },
    { $group: {
      _id: "$courseId",
      courseTitle: { $first: "$courseTitle" },
      revenue: { $sum: "$amount" },
      students: { $sum: 1 },
    }},
    { $sort: { revenue: -1 } },
    { $limit: 20 },
  ]).toArray();

  return agg;
}

module.exports = {
  getAllTransactions, getTransactionById, createTransaction, updateTransactionStatus,
  getAllPayouts, createPayout, updatePayoutStatus, processAllPayouts,
  getRevenueStats, getCourseRevenue,
};
