require("dotenv").config();
const express  = require("express");
const cors     = require("cors");
const passport = require("passport");
const { connectDB, dbStatus } = require("./config/db");
const authRoutes        = require("./routes/authRoutes");
const settingsRoutes    = require("./routes/settingsRoutes");
const courseRoutes      = require("./routes/courseRoutes");
const studentRoutes     = require("./routes/studentRoutes");
const studentAuthRoutes = require("./routes/studentAuthRoutes");
const revenueRoutes     = require("./routes/revenueRoutes");
const uploadRoutes      = require("./routes/uploadRoutes");
const assignmentRoutes  = require("./routes/assignmentRoutes");
const statusRoutes      = require("./routes/statusRoutes");
const { startHealthCheckScheduler } = require("./services/healthCheckService");

const app  = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:3001"];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static uploads
app.use("/uploads", require("express").static(require("path").join(__dirname, "uploads")));
app.use("/certificates", require("express").static(require("path").join(__dirname, "certificates")));

// Routes
app.use("/api/auth",         authRoutes);
app.use("/api/auth/google",  require("./routes/googleAuth"));
app.use("/api/student/auth", studentAuthRoutes);
app.use("/api/settings",     settingsRoutes);
app.use("/api/courses",      courseRoutes);
app.use("/api/students",     studentRoutes);
app.use("/api/revenue",      revenueRoutes);
app.use("/api/upload",       uploadRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/status",      statusRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", db: dbStatus() }));

// Start server
connectDB()
  .then(() => {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Admin server running on port ${PORT}`);
      startHealthCheckScheduler(() => dbStatus(), () => true, 30 * 1000);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Stop the existing process or change PORT in .env`);
      } else {
        console.error('❌ Server error:', err.message);
      }
      process.exit(1);
    });
  });
