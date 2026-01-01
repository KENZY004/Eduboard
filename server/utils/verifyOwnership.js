/**
 * Middleware to verify user owns the resource they're trying to access
 * Must be used AFTER verifyToken middleware
 * 
 * Usage: verifyOwnership('userId') - checks if req.params.userId matches req.user.id
 */
const verifyOwnership = (paramName = 'userId') => {
    return (req, res, next) => {
        try {
            // req.user is set by verifyToken middleware
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            // Get the resource owner ID from params or query
            const resourceOwnerId = req.params[paramName] || req.query[paramName];

            if (!resourceOwnerId) {
                return res.status(400).json({
                    message: `Missing ${paramName} parameter`,
                    error: 'MISSING_PARAMETER'
                });
            }

            // Check if authenticated user matches the resource owner
            if (req.user.id !== resourceOwnerId) {
                return res.status(403).json({
                    message: 'Access denied. You can only access your own resources.',
                    error: 'UNAUTHORIZED_ACCESS'
                });
            }

            next();
        } catch (err) {
            console.error('Ownership verification error:', err);
            res.status(500).json({ message: 'Server error during authorization' });
        }
    };
};

module.exports = verifyOwnership;
