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

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/upload/thumbnail
router.post("/thumbnail", protect, upload.single("thumbnail"), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

  // Copy to student backend uploads
  try {
    const src  = path.join(uploadDir, req.file.filename);
    const dest = path.join(studentUploadDir, req.file.filename);
    fs.copyFileSync(src, dest);
  } catch (e) {
    console.error("Could not copy to student uploads:", e.message);
  }

  const BASE = process.env.SERVER_URL || 'http://localhost:5000';
  const adminUrl = `${BASE}/uploads/${req.file.filename}`;

  // If this is an avatar upload (query param ?type=avatar), save to admins collection
  if (req.query.type === 'avatar' && req.admin?.id) {
    try {
      const { getDB } = require("../config/db");
      const { ObjectId } = require("mongodb");
      await getDB().collection("admins").updateOne(
        { _id: new ObjectId(req.admin.id) },
        { $set: { avatar: adminUrl } }
      );
    } catch (e) {
      console.error("Could not save avatar to admins:", e.message);
    }
  }

  res.json({ success: true, url: adminUrl });
});

module.exports = router;
