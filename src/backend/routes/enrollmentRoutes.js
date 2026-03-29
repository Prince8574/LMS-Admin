const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { studentProtect } = require("../middleware/studentAuth");

router.use(studentProtect);

// POST /api/enrollments/:courseId
router.post("/:courseId", async (req, res) => {
  try {
    const db = getDB();
    const courseId = req.params.courseId;
    const userId = req.user.id;

    const existing = await db.collection("enrollments").findOne({ userId, courseId });
    if (existing)
      return res.status(409).json({ success: false, message: "Already enrolled" });

    const enrollment = {
      userId, courseId,
      progress: 0, completedLessons: [],
      enrolledAt: new Date(), updatedAt: new Date(),
      completed: false,
    };
    const result = await db.collection("enrollments").insertOne(enrollment);

    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $addToSet: { enrolledCourses: courseId } }
    );

    res.status(201).json({ success: true, data: { ...enrollment, _id: result.insertedId } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/enrollments/my-courses
router.get("/my-courses", async (req, res) => {
  try {
    const db = getDB();
    const enrollments = await db.collection("enrollments").find({ userId: req.user.id }).toArray();
    res.json({ success: true, data: enrollments });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/enrollments/course/:courseId
router.get("/course/:courseId", async (req, res) => {
  try {
    const db = getDB();
    const enrollment = await db.collection("enrollments").findOne({
      userId: req.user.id, courseId: req.params.courseId
    });
    if (!enrollment) return res.status(404).json({ success: false, message: "Not enrolled" });
    res.json({ success: true, data: enrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/enrollments/:enrollmentId/progress
router.put("/:enrollmentId/progress", async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection("enrollments").findOneAndUpdate(
      { _id: new ObjectId(req.params.enrollmentId), userId: req.user.id },
      { $set: { progress: req.body.progress, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/enrollments/:enrollmentId/lesson
router.put("/:enrollmentId/lesson", async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection("enrollments").findOneAndUpdate(
      { _id: new ObjectId(req.params.enrollmentId), userId: req.user.id },
      { $addToSet: { completedLessons: req.body.lessonId }, $set: { updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// PUT /api/enrollments/:enrollmentId/complete
router.put("/:enrollmentId/complete", async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection("enrollments").findOneAndUpdate(
      { _id: new ObjectId(req.params.enrollmentId), userId: req.user.id },
      { $set: { completed: true, completedAt: new Date(), updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
