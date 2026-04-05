const express = require("express");
const router  = express.Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  logout,
  sendOTP,
  verifyOTP,
  createInstructor,
  listInstructors,
  deleteInstructor,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register",        register);
router.post("/login",           login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);
router.post("/send-otp",        sendOTP);
router.post("/verify-otp",      verifyOTP);

// Protected routes
router.get ("/me",     protect, getMe);
router.post("/logout", protect, logout);

// Instructor management (super_admin only)
router.post  ("/instructors",     protect, createInstructor);
router.get   ("/instructors",     protect, listInstructors);
router.delete("/instructors/:id", protect, deleteInstructor);

module.exports = router;
