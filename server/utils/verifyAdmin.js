const User = require('../models/User');

/**
 * Middleware to verify user has admin role
 * Must be used AFTER verifyToken middleware
 */
const verifyAdmin = async (req, res, next) => {
    try {
        // req.user is set by verifyToken middleware
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Fetch user from database to check role
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({
                message: 'Access denied. Admin privileges required.',
                error: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        // Attach user object to request for use in route handlers
        req.userObject = user;
        next();
    } catch (err) {
        console.error('Admin verification error:', err);
        res.status(500).json({ message: 'Server error during authorization' });
    }
};

module.exports = verifyAdmin;
