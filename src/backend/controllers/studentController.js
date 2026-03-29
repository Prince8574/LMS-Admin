const Student = require("../models/Student");

// GET /api/students
async function getAll(req, res) {
  try {
    const { search, status, plan, sortBy, page = 1, limit = 50 } = req.query;
    const result = await Student.getAllStudents({
      search,
      status,
      plan,
      sortBy,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/students/stats
async function getStats(req, res) {
  try {
    const stats = await Student.getStudentStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/students/:id
async function getOne(req, res) {
  try {
    const student = await Student.getStudentById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/students
async function create(req, res) {
  try {
    const { name, email, phone, city, plan } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required" });
    }
    const student = await Student.createStudent({ name, email, phone, city, plan });
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    const status = err.message === "Email already registered" ? 409 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
}

// PUT /api/students/:id
async function update(req, res) {
  try {
    const student = await Student.updateStudent(req.params.id, req.body);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PATCH /api/students/:id/status
async function setStatus(req, res) {
  try {
    const { status } = req.body;
    const allowed = ["active", "inactive", "suspended"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${allowed.join(", ")}` });
    }
    const student = await Student.setStudentStatus(req.params.id, status);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// PATCH /api/students/:id/plan
async function setPlan(req, res) {
  try {
    const { plan } = req.body;
    if (!["free", "premium"].includes(plan)) {
      return res.status(400).json({ success: false, message: "Plan must be free or premium" });
    }
    const student = await Student.updateStudent(req.params.id, { plan });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/students/:id
async function remove(req, res) {
  try {
    const result = await Student.deleteStudent(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/students/bulk
async function bulkAction(req, res) {
  try {
    const { ids, action, value } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array required" });
    }

    const results = [];
    for (const id of ids) {
      try {
        if (action === "suspend")  await Student.setStudentStatus(id, "suspended");
        if (action === "activate") await Student.setStudentStatus(id, "active");
        if (action === "upgrade")  await Student.updateStudent(id, { plan: "premium" });
        if (action === "downgrade")await Student.updateStudent(id, { plan: "free" });
        if (action === "delete")   await Student.deleteStudent(id);
        results.push({ id, success: true });
      } catch (e) {
        results.push({ id, success: false, error: e.message });
      }
    }

    res.json({ success: true, results, affected: results.filter(r => r.success).length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getAll, getStats, getOne, create, update, setStatus, setPlan, remove, bulkAction };
