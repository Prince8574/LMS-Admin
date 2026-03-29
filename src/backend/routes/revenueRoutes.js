const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getStats,
  getTransactions, getTransaction, createTransaction, updateTxStatus,
  getPayouts, createPayout, updatePayoutStatus, processAllPayouts,
  getCourseRevenue,
} = require("../controllers/revenueController");

router.use(protect);

// Stats
router.get("/stats", getStats);

// Transactions
router.get("/transactions",              getTransactions);
router.post("/transactions",             createTransaction);
router.get("/transactions/:id",          getTransaction);
router.patch("/transactions/:id/status", updateTxStatus);

// Payouts
router.get("/payouts",                   getPayouts);
router.post("/payouts",                  createPayout);
router.post("/payouts/process-all",      processAllPayouts);
router.patch("/payouts/:id/status",      updatePayoutStatus);

// Course revenue
router.get("/courses", getCourseRevenue);

module.exports = router;
