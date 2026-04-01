const express = require("express");
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware");

// Ensure uploads dir exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Student backend uploads dir — copy files here so student server can serve them independently
const studentUploadDir = path.join(__dirname, "../../../student-panel/src/backend/uploads");
if (!fs.existsSync(studentUploadDir)) fs.mkdirSync(studentUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const ext  = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg","image/png","image/webp","image/gif"];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error("Only images allowed"), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/upload/thumbnail
router.post("/thumbnail", protect, upload.single("thumbnail"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

  // Copy to student backend uploads so it's available without admin server
  try {
    const src  = path.join(uploadDir, req.file.filename);
    const dest = path.join(studentUploadDir, req.file.filename);
    fs.copyFileSync(src, dest);
  } catch (e) {
    console.warn("Could not copy to student uploads:", e.message);
  }

  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  // Also return student-server URL so it works without admin server
  const studentUrl = `http://localhost:5001/uploads/${req.file.filename}`;
  res.json({ success: true, url: studentUrl });
});

module.exports = router;
