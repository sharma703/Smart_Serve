/**
 * routes/reports.js
 * Community Problem Reports — CRUD API
 */

'use strict';

const express = require('express');
const router  = express.Router();
const Report = require('../models/Report');
const {
  handleValidation,
  validateReport,
  validateId,
  validateStatusUpdate,
} = require('../middleware/validate');

// ── GET /api/reports ─────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const { status, severity, problemType, search, urgent, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (problemType) query.problemType = problemType;
    if (urgent === 'true') query.urgent = true;
    
    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { areaName: regex },
        { location: regex },
        { description: regex },
        { problemType: regex }
      ];
    }

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip    = (pageNum - 1) * limitNum;

    const total = await Report.countDocuments(query);
    const reports = await Report.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
      data: reports,
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/reports/:id ─────────────────────────────────────
router.get('/:id', validateId, handleValidation, async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/reports ────────────────────────────────────────
router.post('/', validateReport, handleValidation, async (req, res, next) => {
  try {
    const {
      areaName, problemType, severity, location,
      population, description, urgent = false,
    } = req.body;

    const status = (urgent && severity === 'High') ? 'Urgent' : 'Pending';

    const report = new Report({
      areaName:    areaName.trim(),
      problemType,
      severity,
      location:    location.trim(),
      population:  population ? parseInt(population) : null,
      description: description?.trim() || '',
      urgent:      Boolean(urgent),
      status,
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Community report submitted successfully.',
      data: report,
    });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/reports/:id ───────────────────────────────────
router.patch('/:id', validateId, handleValidation, async (req, res, next) => {
  try {
    const allowed = ['areaName', 'problemType', 'severity', 'location', 'population', 'description', 'urgent'];
    const updates = {};
    allowed.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const updated = await Report.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    res.json({ success: true, message: 'Report updated.', data: updated });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /api/reports/:id/status ───────────────────────────
router.patch('/:id/status', validateStatusUpdate, handleValidation, async (req, res, next) => {
  try {
    const updated = await Report.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }
    
    res.json({ success: true, message: `Status updated to "${req.body.status}".`, data: updated });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/reports/:id ──────────────────────────────────
router.delete('/:id', validateId, handleValidation, async (req, res, next) => {
  try {
    const deleted = await Report.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }
    res.json({ success: true, message: 'Report deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
