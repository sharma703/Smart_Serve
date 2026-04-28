/**
 * middleware/validate.js
 * express-validator rule sets for each route.
 * Usage: router.post('/', validateReport, handleValidation, controller)
 */

'use strict';

const { body, param, validationResult } = require('express-validator');

// ── Shared handler ────────────────────────────────────────────
/**
 * Reads validation results and returns 422 if any errors exist.
 */
function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

// ── Community Report Rules ─────────────────────────────────────
const validateReport = [
  body('areaName')
    .trim().notEmpty().withMessage('Area name is required')
    .isLength({ max: 100 }).withMessage('Area name must be 100 characters or fewer'),

  body('problemType')
    .notEmpty().withMessage('Problem type is required')
    .isIn(['Food', 'Medical', 'Education', 'Logistics', 'Shelter', 'Water'])
    .withMessage('Problem type must be one of: Food, Medical, Education, Logistics, Shelter, Water'),

  body('severity')
    .notEmpty().withMessage('Severity is required')
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Severity must be Low, Medium, or High'),

  body('location')
    .trim().notEmpty().withMessage('Location is required')
    .isLength({ max: 200 }).withMessage('Location must be 200 characters or fewer'),

  body('population')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 10000000 })
    .withMessage('Population must be a positive integer'),

  body('description')
    .optional({ nullable: true })
    .isLength({ max: 1000 }).withMessage('Description must be 1000 characters or fewer'),

  body('urgent')
    .optional()
    .isBoolean().withMessage('Urgent must be a boolean'),
];

// ── Volunteer Rules ────────────────────────────────────────────
const validateVolunteer = [
  body('name')
    .trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2–100 characters'),

  body('email')
    .trim().notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('phone')
    .trim().notEmpty().withMessage('Phone number is required')
    .matches(/^[\d\s\+\-\(\)]{7,20}$/).withMessage('Invalid phone number format'),

  body('location')
    .trim().notEmpty().withMessage('Location is required')
    .isLength({ max: 200 }).withMessage('Location must be 200 characters or fewer'),

  body('skill')
    .notEmpty().withMessage('Primary skill is required')
    .isIn(['Medical', 'Cooking', 'Teaching', 'Driving', 'Counseling', 'Construction', 'Tech', 'Admin', 'Language', 'Other'])
    .withMessage('Invalid skill value'),

  body('hoursPerWeek')
    .optional({ nullable: true })
    .isInt({ min: 1, max: 168 }).withMessage('Hours per week must be 1–168'),

  body('experience')
    .optional({ nullable: true })
    .isNumeric().withMessage('Experience must be a number'),

  body('emergency')
    .optional()
    .isBoolean().withMessage('Emergency must be a boolean'),

  body('additionalSkills')
    .optional()
    .isArray().withMessage('Additional skills must be an array'),
];

// ── ID param rule ──────────────────────────────────────────────
const validateId = [
  param('id')
    .notEmpty().withMessage('ID is required')
    .isMongoId().withMessage('ID must be a valid MongoID'),
];

// ── Status update rule ─────────────────────────────────────────
const validateStatusUpdate = [
  param('id').notEmpty().isMongoId(),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Pending', 'Assigned', 'Completed', 'Urgent', 'Cancelled'])
    .withMessage('Invalid status value'),
];

module.exports = {
  handleValidation,
  validateReport,
  validateVolunteer,
  validateId,
  validateStatusUpdate,
};
