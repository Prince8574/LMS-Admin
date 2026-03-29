const express = require("express");
const router  = express.Router();
const { protect, superAdminOnly } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/settingsController");

// All settings routes are protected
router.use(protect);

// Profile
router.get ("/profile",  ctrl.getProfile);
router.put ("/profile",  ctrl.updateProfile);

// Security
router.put ("/security/password",       ctrl.changePassword);
router.get ("/security/sessions",       ctrl.getSessions);
router.delete("/security/sessions/:id", ctrl.revokeSession);
router.delete("/security/sessions",     ctrl.revokeAllSessions);

// Platform config — super-admin only
router.get("/platform", superAdminOnly, ctrl.getPlatformConfig);
router.put("/platform", superAdminOnly, ctrl.updatePlatformConfig);

// Notifications
router.get("/notifications", ctrl.getNotifications);
router.put("/notifications", ctrl.updateNotifications);

module.exports = router;
