const {
  createCourse, getAllCourses, getCourseById,
  updateCourse, deleteCourse, togglePublish, getCourseStats,
} = require("../models/Course");

// POST /api/courses
async function create(req, res) {
  try {
    const { title, category } = req.body;
    if (!title || !category)
      return res.status(400).json({ success: false, message: "Title and category are required" });

    // Fetch admin name from DB
    let adminName = "Admin";
    try {
      const { getDB } = require("../config/db");
      const { ObjectId } = require("mongodb");
      const adminDoc = await getDB().collection("admins").findOne({ _id: new ObjectId(req.admin.id) });
      adminName = adminDoc?.name || adminDoc?.username || adminDoc?.email?.split("@")[0] || "Admin";
    } catch (_) {}

    const initials = adminName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
    const instructor = req.body.instructor?.name
      ? req.body.instructor
      : { id: req.admin.id, name: adminName, initials };

    const course = await createCourse({ ...req.body, instructor, adminId: req.admin.id });
    res.status(201).json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/courses
async function getAll(req, res) {
  try {
    const filter = {};
    if (req.query.category)   filter.category   = req.query.category;
    if (req.query.level)      filter.level       = req.query.level;
    if (req.query.status)     filter.status      = req.query.status;
    if (req.query.published !== undefined)
      filter.isPublished = req.query.published === "true";
    const courses = await getAllCourses(filter);
    res.json({ success: true, count: courses.length, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/courses/stats
async function stats(req, res) {
  try {
    const data = await getCourseStats();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/courses/:id
async function getOne(req, res) {
  try {
    const course = await getCourseById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /api/courses/:id  — full update from builder
async function update(req, res) {
  try {
    const course = await getCourseById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    const updated = await updateCourse(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/courses/:id
async function remove(req, res) {
  try {
    const course = await getCourseById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    await deleteCourse(req.params.id);
    res.json({ success: true, message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PATCH /api/courses/:id/publish
async function publish(req, res) {
  try {
    const { isPublished } = req.body;
    if (typeof isPublished !== "boolean")
      return res.status(400).json({ success: false, message: "isPublished must be boolean" });
    const updated = await togglePublish(req.params.id, isPublished);
    if (!updated) return res.status(404).json({ success: false, message: "Course not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { create, getAll, getOne, update, remove, publish, stats };
