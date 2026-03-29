const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getAll,
  getStats,
  getOne,
  create,
  update,
  setStatus,
  setPlan,
  remove,
  bulkAction,
} = require("../controllers/studentController");

// All student routes require admin login
router.use(protect);

// GET  /api/students/stats  — must be before /:id
router.get("/stats", getStats);

// POST /api/students/bulk
router.post("/bulk", bulkAction);

// CRUD
router.get("/",    getAll);
router.post("/",   create);
router.get("/:id", getOne);
router.put("/:id", update);
router.delete("/:id", remove);

// Status & plan toggles
router.patch("/:id/status", setStatus);
router.patch("/:id/plan",   setPlan);

module.exports = router;
