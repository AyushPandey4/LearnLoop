const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.substring(7) // Extract token after 'Bearer '
    : null;

  if (!token) {
    return res.status(401).json({ message: "Token missing, please login" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded && decoded.user) {
      req.user = decoded.user;
    } else {
      throw new Error("Invalid token structure");
    }

    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res
      .status(403)
      .json({ message: "Invalid token, please login again" });
  }
};

module.exports = authenticateToken;
