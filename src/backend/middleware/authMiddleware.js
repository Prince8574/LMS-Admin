const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_key_here";

function protect(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
}

// Only allow super-admin role
function superAdminOnly(req, res, next) {
  if (req.admin?.role !== "super-admin") {
    return res.status(403).json({ success: false, message: "Access denied" });
  }
  next();
}

module.exports = { protect, superAdminOnly };
