const { body, validationResult } = require("express-validator");

// Password validation rules
const registerValidation = [
  body("password")
    .trim()
    .isLength({ min: 8, max: 64 })
    .withMessage(
      "Password must be between 8 and 64 characters long"
    )
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain at least one special character"),
];

// Middleware to handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  next();
};

module.exports = {
  registerValidation,
  validate,
};