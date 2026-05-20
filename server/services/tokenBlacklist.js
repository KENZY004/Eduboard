/**
 * tokenBlacklist.js
 *
 * In-memory JWT blacklist with automatic expiry cleanup.
 *
 * Strategy:
 *   - Store the token's `jti` (JWT ID) as the key, with its expiry
 *     timestamp as the value.
 *   - If JWTs don't include a `jti`, fall back to storing a SHA-256
 *     hash of the raw token string so we never store the token itself.
 *   - A periodic cleanup interval removes entries that have already
 *     expired, keeping memory bounded.
 *
 * For production at scale, swap the Map for a Redis SET with TTL:
 *   await redis.set(`bl:${jti}`, 1, 'EX', secondsUntilExpiry);
 *   const isBlacklisted = await redis.exists(`bl:${jti}`);
 */

const crypto = require("crypto");

// Map<tokenId, expiryTimestampMs>
const blacklist = new Map();

// Run cleanup every 15 minutes
const CLEANUP_INTERVAL_MS = 15 * 60 * 1000;

/**
 * Derive a stable identifier from a decoded JWT payload.
 * Prefers the standard `jti` claim; falls back to a hash of
 * sub + iat so every issued token gets a unique ID even without jti.
 *
 * @param {object} decoded  - The decoded JWT payload
 * @param {string} rawToken - The raw JWT string (used only if decoded is unavailable)
 * @returns {string}
 */
function getTokenId(decoded, rawToken) {
  if (decoded?.jti) return decoded.jti;
  if (decoded?.sub && decoded?.iat) {
    return crypto
      .createHash("sha256")
      .update(`${decoded.sub}:${decoded.iat}`)
      .digest("hex");
  }
  // Last resort: hash the raw token
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Add a token to the blacklist.
 *
 * @param {object} decoded  - The decoded JWT payload (from jwt.verify / jwt.decode)
 * @param {string} rawToken - The original token string
 */
function blacklistToken(decoded, rawToken) {
  const id = getTokenId(decoded, rawToken);

  // exp is in seconds (JWT standard); convert to ms for Date comparison
  const expiryMs = decoded?.exp
    ? decoded.exp * 1000
    : Date.now() + 24 * 60 * 60 * 1000; // default 24 h if exp missing

  blacklist.set(id, expiryMs);
}

/**
 * Check whether a token is blacklisted.
 *
 * @param {object} decoded  - The decoded JWT payload
 * @param {string} rawToken - The original token string
 * @returns {boolean}
 */
function isBlacklisted(decoded, rawToken) {
  const id = getTokenId(decoded, rawToken);
  if (!blacklist.has(id)) return false;

  // Double-check: if the entry is past its own expiry, treat as clean
  // (cleanup hasn't run yet)
  if (Date.now() > blacklist.get(id)) {
    blacklist.delete(id);
    return false;
  }

  return true;
}

/**
 * Remove all entries whose expiry timestamp has passed.
 * Called automatically on the cleanup interval.
 */
function cleanupExpired() {
  const now = Date.now();
  for (const [id, expiryMs] of blacklist.entries()) {
    if (now > expiryMs) {
      blacklist.delete(id);
    }
  }
}

/** Return the number of currently tracked (non-expired) blacklist entries. */
function size() {
  return blacklist.size;
}

// Start the automatic cleanup timer
const cleanupTimer = setInterval(cleanupExpired, CLEANUP_INTERVAL_MS);

// Allow tests / graceful shutdown to stop the timer
function stopCleanup() {
  clearInterval(cleanupTimer);
}

module.exports = { blacklistToken, isBlacklisted, cleanupExpired, stopCleanup, size };