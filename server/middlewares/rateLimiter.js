const rateLimit = require('express-rate-limit'); // ← NEW
                                                                              // ← NEW
// Helper to determine dynamic retry-after seconds                            // ← NEW
const getRetryAfter = (req, options) => { // ← NEW
    if (req.rateLimit && req.rateLimit.resetTime) { // ← NEW
        const remainingMs = req.rateLimit.resetTime.getTime() - Date.now(); // ← NEW
        return Math.max(0, Math.ceil(remainingMs / 1000)); // ← NEW
    } // ← NEW
    return Math.ceil(options.windowMs / 1000); // ← NEW
}; // ← NEW
                                                                              // ← NEW
// Common handler to return JSON with { message, retryAfter } and set Retry-After header // ← NEW
const createLimiterHandler = (customMessage) => (req, res, next, options) => { // ← NEW
    const retryAfter = getRetryAfter(req, options); // ← NEW
    res.setHeader('Retry-After', retryAfter.toString()); // ← NEW
    res.status(429).json({ // ← NEW
        message: customMessage || 'Too many requests, please try again later.', // ← NEW
        retryAfter // ← NEW
    }); // ← NEW
}; // ← NEW
                                                                              // ← NEW
// 1. authLimiter: for /login and /register (strict — 10 req / 15 min)        // ← NEW
const authLimiter = rateLimit({ // ← NEW
    windowMs: parseInt(process.env.AUTH_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // ← NEW
    max: parseInt(process.env.AUTH_LIMIT_MAX, 10) || 10, // ← NEW
    standardHeaders: true, // ← NEW
    legacyHeaders: false, // ← NEW
    handler: createLimiterHandler('Too many login or registration attempts. Please try again after some time.'), // ← NEW
}); // ← NEW
                                                                              // ← NEW
// 2. otpLimiter: for /verify-otp and /forgot-password (5 req / 10 min)       // ← NEW
const otpLimiter = rateLimit({ // ← NEW
    windowMs: parseInt(process.env.OTP_LIMIT_WINDOW_MS, 10) || 10 * 60 * 1000, // ← NEW
    max: parseInt(process.env.OTP_LIMIT_MAX, 10) || 5, // ← NEW
    standardHeaders: true, // ← NEW
    legacyHeaders: false, // ← NEW
    handler: createLimiterHandler('Too many OTP or password reset requests. Please try again later.'), // ← NEW
}); // ← NEW
                                                                              // ← NEW
// 3. globalAuthLimiter: loose fallback for all /api/auth/* routes            // ← NEW
const globalAuthLimiter = rateLimit({ // ← NEW
    windowMs: parseInt(process.env.GLOBAL_AUTH_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // ← NEW
    max: parseInt(process.env.GLOBAL_AUTH_LIMIT_MAX, 10) || 100, // ← NEW
    standardHeaders: true, // ← NEW
    legacyHeaders: false, // ← NEW
    handler: createLimiterHandler('Too many requests to authentication endpoints. Please try again later.'), // ← NEW
}); // ← NEW
                                                                              // ← NEW
module.exports = { // ← NEW
    authLimiter, // ← NEW
    otpLimiter, // ← NEW
    globalAuthLimiter // ← NEW
}; // ← NEW
