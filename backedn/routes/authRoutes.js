// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken")
const { signup, login } = require("../controllers/authController");
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"; // Use env in production



router.post("/signup", signup);
router.post("/login", login);

router.post("/verify-token", (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ valid: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Optionally check expiry or user status here
    return res.json({ valid: true, userId: decoded.id });
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return res.status(401).json({ valid: false, message: "Invalid or expired token" });
  }
});


module.exports = router;