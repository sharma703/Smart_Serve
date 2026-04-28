/**
 * routes/volunteers.js
 * Volunteer Registry — CRUD API
 */

'use strict';

const express = require('express');
const router  = express.Router();
const Volunteer = require('../models/Volunteer');
const {
  handleValidation,
  validateVolunteer,
  validateId,
} = require('../middleware/validate');
const { body, param } = require('express-validator');

// ── GET /api/volunteers ──────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { skill, available, emergency, search, page = 1, limit = 20 } = req.query;

    const query = {};
    if (skill) query.skill = skill;
    if (available !== undefined) query.available = available === 'true';
    if (emergency === 'true') query.emergency = true;
    
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { name: regex },
        { skill: regex },
        { location: regex },
        { email: regex }
      ];
    }

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip    = (pageNum - 1) * limitNum;

    const total = await Volunteer.countDocuments(query);
    const volunteers = await Volunteer.find(query)
      .sort({ assignmentCount: -1 })
      .skip(skip)
      .limit(limitNum);

    const safe = volunteers.map(sanitize);

    res.json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
      data: safe,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/volunteers/:id ──────────────────────────────────
router.get('/:id', validateId, handleValidation, async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found.' });
    }
    res.json({ success: true, data: sanitize(volunteer) });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/volunteers ─────────────────────────────────────
router.post('/', validateVolunteer, handleValidation, async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const emailExists = await Volunteer.findOne({ email: email?.trim().toLowerCase() });
    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: 'A volunteer with this email already exists.',
        errors: [{ field: 'email', message: 'Email already registered.' }],
      });
    }

    const {
      name, phone, location, age,
      skill, additionalSkills = [], experience,
      bio, availability, hoursPerWeek,
      startDate, emergency = false,
    } = req.body;

    const volunteer = new Volunteer({
      name:             name.trim(),
      email:            email.trim().toLowerCase(),
      phone:            phone.trim(),
      location:         location.trim(),
      age:              age || null,
      skill,
      additionalSkills: Array.isArray(additionalSkills) ? additionalSkills : [],
      experience:       experience ? parseInt(experience) : 0,
      bio:              bio?.trim() || '',
      availability:     availability || { days: [], timeSlot: 'Anytime' },
      hoursPerWeek:     hoursPerWeek ? parseInt(hoursPerWeek) : null,
      startDate:        startDate || null,
      emergency:        Boolean(emergency),
    });

    await volunteer.save();

    res.status(201).json({
      success: true,
      message: 'Volunteer registered successfully. Welcome to SmartServe!',
      data: sanitize(volunteer),
    });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/volunteers/:id ────────────────────────────────
router.patch('/:id', validateId, handleValidation, async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'location', 'skill', 'additionalSkills',
                     'experience', 'bio', 'availability', 'hoursPerWeek', 'emergency', 'startDate'];
    const updates = {};
    allowed.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const updated = await Volunteer.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Volunteer not found.' });
    }

    res.json({ success: true, message: 'Volunteer profile updated.', data: sanitize(updated) });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/volunteers/:id/availability ───────────────────
router.patch('/:id/availability',
  [param('id').isMongoId().withMessage('Valid volunteer ID required'), body('available').isBoolean()],
  handleValidation,
  async (req, res, next) => {
    try {
      const updated = await Volunteer.findByIdAndUpdate(
        req.params.id,
        { available: req.body.available },
        { new: true, runValidators: true }
      );
      
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Volunteer not found.' });
      }
      res.json({
        success: true,
        message: `Volunteer marked as ${req.body.available ? 'available' : 'unavailable'}.`,
        data: sanitize(updated),
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── DELETE /api/volunteers/:id ───────────────────────────────
router.delete('/:id', validateId, handleValidation, async (req, res, next) => {
  try {
    const deleted = await Volunteer.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Volunteer not found.' });
    }
    res.json({ success: true, message: 'Volunteer removed from registry.' });
  } catch (err) {
    next(err);
  }
});

// ── Sanitize ─────────────────────────────────────────────────
function sanitize(v) {
  if (!v) return v;
  // If v is a Mongoose document, convert to JSON object
  const safe = v.toObject ? v.toObject() : { ...v };
  return safe;
}

module.exports = router;
