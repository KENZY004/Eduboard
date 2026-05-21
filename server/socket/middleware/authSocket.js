// ← NEW FILE | Issue #59 | Centralized Socket Event Manager
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

const authSocket = (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
        return next(new Error('Authentication required'));
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.userId = decoded.id; // Attach user ID to socket
        socket.user = decoded; // Attach full payload if needed
        next();
    } catch (err) {
        return next(new Error('Invalid token'));
    }
};

module.exports = authSocket;
