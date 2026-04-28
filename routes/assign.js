/**
 * routes/assign.js
 * Auto-Assignment API
 */

'use strict';

const express = require('express');
const router  = express.Router();
const Report = require('../models/Report');
const Volunteer = require('../models/Volunteer');
const { runAssignment } = require('../utils/assignEngine');
const { body, param, validationResult } = require('express-validator');

// ── POST /api/assign ─────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    console.log('[ASSIGN] Running auto-assignment algorithm…');

    const result = await runAssignment();

    console.log(`[ASSIGN] Done. Assigned: ${result.assignments.length}, Skipped: ${result.skipped}`);

    res.json({
      success: true,
      message: result.message,
      assigned: result.assignments.length,
      skipped:  result.skipped,
      data:     result.assignments,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/assign/manual ───────────────────────────────────
router.post('/manual',
  [
    body('reportId').notEmpty().isMongoId().withMessage('Valid report ID is required'),
    body('volunteerId').notEmpty().isMongoId().withMessage('Valid volunteer ID is required'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    try {
      const { reportId, volunteerId } = req.body;

      const report    = await Report.findById(reportId);
      const volunteer = await Volunteer.findById(volunteerId);

      if (!report)    return res.status(404).json({ success: false, message: 'Report not found.' });
      if (!volunteer) return res.status(404).json({ success: false, message: 'Volunteer not found.' });

      if (report.status === 'Completed') {
        return res.status(409).json({ success: false, message: 'Cannot assign a completed task.' });
      }
      if (volunteer.available === false) {
        return res.status(409).json({ success: false, message: 'Volunteer is marked unavailable.' });
      }

      const assignedAt = new Date();

      // Update report
      report.status = 'Assigned';
      report.volunteerId = volunteer._id;
      report.volunteerName = volunteer.name;
      report.volunteerSkill = volunteer.skill;
      report.assignedAt = assignedAt;
      await report.save();

      // Update volunteer
      volunteer.assignmentCount = (volunteer.assignmentCount || 0) + 1;
      volunteer.lastAssignedAt = assignedAt;
      await volunteer.save();

      res.json({
        success: true,
        message: `${volunteer.name} manually assigned to "${report.areaName}" (${report.problemType}).`,
        data: {
          report,
          volunteer: { id: volunteer._id, name: volunteer.name, skill: volunteer.skill },
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /api/assign/history ───────────────────────────────────
router.get('/history', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip    = (pageNum - 1) * limitNum;

    const query = { volunteerId: { $ne: null } };
    
    const total = await Report.countDocuments(query);
    const assigned = await Report.find(query)
      .sort({ assignedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
      data: assigned,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/assign/:reportId/complete ───────────────────────
router.post('/:reportId/complete',
  param('reportId').isMongoId().withMessage('Valid report ID is required'),
  async (req, res, next) => {
    try {
      const report = await Report.findById(req.params.reportId);
      if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
      if (report.status !== 'Assigned') {
        return res.status(409).json({ success: false, message: 'Only assigned tasks can be marked complete.' });
      }

      report.status = 'Completed';
      report.completedAt = new Date();
      await report.save();

      res.json({ success: true, message: 'Task marked as completed.', data: report });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
