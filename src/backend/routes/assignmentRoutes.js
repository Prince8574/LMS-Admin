const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignmentController");
const { protect } = require("../middleware/authMiddleware");

// Admin routes
router.get("/", protect, assignmentController.getAll);
router.get("/submissions", protect, assignmentController.getAllSubmissions);
router.post("/:id/grade", protect, assignmentController.gradeSubmission);
router.get("/:id", protect, assignmentController.getOne);
router.post("/", protect, assignmentController.create);
router.put("/:id", protect, assignmentController.update);
router.delete("/:id", protect, assignmentController.remove);

module.exports = router;
