// ← NEW FILE | Issue #59 | Centralized Socket Event Manager

// Track connected users per room
// roomId -> Map of userId -> { username, socketId, role }
const roomUsers = new Map();

module.exports = { roomUsers };
