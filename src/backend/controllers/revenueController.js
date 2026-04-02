const Revenue = require("../models/Revenue");

// GET /api/revenue/stats
async function getStats(req, res) {
  try {
    const adminId = req.admin?.id;
    const stats = await Revenue.getRevenueStats(adminId);
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/revenue/transactions
async function getTransactions(req, res) {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const adminId = req.admin?.id;
    const result = await Revenue.getAllTransactions({ status, search, page: parseInt(page), limit: parseInt(limit), adminId });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/revenue/transactions/:id
async function getTransaction(req, res) {
  try {
    const tx = await Revenue.getTransactionById(req.params.id);
    if (!tx) return res.status(404).json({ success: false, message: "Transaction not found" });
    res.json({ success: true, data: tx });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/revenue/transactions
async function createTransaction(req, res) {
  try {
    const { studentName, courseTitle, amount } = req.body;
    if (!studentName || !courseTitle || !amount) {
      return res.status(400).json({ success: false, message: "studentName, courseTitle, amount required" });
    }
    const tx = await Revenue.createTransaction(req.body);
    res.status(201).json({ success: true, data: tx });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PATCH /api/revenue/transactions/:id/status
async function updateTxStatus(req, res) {
  try {
    const { status } = req.body;
    const allowed = ["success", "pending", "failed", "refunded", "processing"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(", ")}` });
    }
    const tx = await Revenue.updateTransactionStatus(req.params.id, status);
    if (!tx) return res.status(404).json({ success: false, message: "Transaction not found" });
    res.json({ success: true, data: tx });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/revenue/payouts
async function getPayouts(req, res) {
  try {
    const { status } = req.query;
    const data = await Revenue.getAllPayouts({ status });
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/revenue/payouts
async function createPayout(req, res) {
  try {
    const { instructorName, amount } = req.body;
    if (!instructorName || !amount) {
      return res.status(400).json({ success: false, message: "instructorName and amount required" });
    }
    const payout = await Revenue.createPayout(req.body);
    res.status(201).json({ success: true, data: payout });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PATCH /api/revenue/payouts/:id/status
async function updatePayoutStatus(req, res) {
  try {
    const { status } = req.body;
    const allowed = ["scheduled", "paid", "pending", "processing"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(", ")}` });
    }
    const payout = await Revenue.updatePayoutStatus(req.params.id, status);
    if (!payout) return res.status(404).json({ success: false, message: "Payout not found" });
    res.json({ success: true, data: payout });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/revenue/payouts/process-all
async function processAllPayouts(req, res) {
  try {
    const count = await Revenue.processAllPayouts();
    res.json({ success: true, message: `${count} payouts processed successfully`, affected: count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/revenue/courses
async function getCourseRevenue(req, res) {
  try {
    const { sortBy } = req.query;
    const data = await Revenue.getCourseRevenue({ sortBy });
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getStats,
  getTransactions, getTransaction, createTransaction, updateTxStatus,
  getPayouts, createPayout, updatePayoutStatus, processAllPayouts,
  getCourseRevenue,
};
