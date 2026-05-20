/**
 * auth.js  (middleware)
 *
 * Drop-in replacement / update for the existing token-verification
 * middleware.  Adds a blacklist check after the standard JWT
 * signature + expiry verification.
 *
 * Usage (unchanged from the original):
 *   router.get("/protected", verifyToken, handler);
 */

const jwt = require("jsonwebtoken");
const { isBlacklisted } = require("../services/tokenBlacklist");

/**
 * Extract the raw Bearer token from the Authorization header.
 * Returns null if the header is absent or malformed.
 *
 * @param {import("express").Request} req
 * @returns {string|null}
 */
function extractBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.slice(7).trim() || null;
}

/**
 * verifyToken
 *
 * Middleware that:
 *  1. Extracts the JWT from the Authorization header.
 *  2. Verifies signature and expiry via jsonwebtoken.
 *  3. Rejects tokens that appear in the blacklist (logged-out sessions).
 *  4. Attaches the decoded payload to req.user and calls next().
 */
function verifyToken(req, res, next) {
  const token = extractBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: "No token provided. Access denied." });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired. Please log in again." });
    }
    return res.status(401).json({ message: "Invalid token. Access denied." });
  }

  // ── Blacklist check ────────────────────────────────────────────────
  if (isBlacklisted(decoded, token)) {
    return res.status(401).json({
      message: "Token has been invalidated. Please log in again.",
    });
  }
  // ──────────────────────────────────────────────────────────────────

  req.user = decoded;
  next();
}

/**
 * requireRole(...roles)
 *
 * Optional role-guard factory – unchanged from common EduBoard patterns.
 * Example: router.delete("/user/:id", verifyToken, requireRole("admin"), handler)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: insufficient permissions." });
    }
    next();
  };
}

module.exports = { verifyToken, requireRole, extractBearerToken };