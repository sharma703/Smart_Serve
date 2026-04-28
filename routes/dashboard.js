/**
 * routes/dashboard.js
 * Dashboard analytics and summary endpoints.
 */

'use strict';

const express = require('express');
const router  = express.Router();
const Report = require('../models/Report');
const Volunteer = require('../models/Volunteer');

// ── GET /api/dashboard/stats ─────────────────────────────────
router.get('/stats', async (req, res, next) => {
  try {
    const reports    = await Report.find({});
    const volunteers = await Volunteer.find({});

    const total          = reports.length;
    const totalVols      = volunteers.length;
    const urgentCount    = reports.filter(r => r.status === 'Urgent' || (r.urgent && r.status === 'Pending')).length;
    const pendingCount   = reports.filter(r => r.status === 'Pending').length;
    const assignedCount  = reports.filter(r => r.status === 'Assigned').length;
    const completedCount = reports.filter(r => r.status === 'Completed').length;
    const availableVols  = volunteers.filter(v => v.available !== false).length;
    const emergencyVols  = volunteers.filter(v => v.emergency).length;

    const totalPop = reports.reduce((acc, r) => acc + (parseInt(r.population) || 0), 0);

    // Match rate: how many reports have a volunteer
    const matchRate = total > 0
      ? Math.round(((assignedCount + completedCount) / total) * 100)
      : 0;

    // New today
    const today = new Date().toDateString();
    const newReportsToday = reports.filter(r => new Date(r.createdAt).toDateString() === today).length;
    const newVolsToday    = volunteers.filter(v => new Date(v.createdAt).toDateString() === today).length;

    res.json({
      success: true,
      data: {
        reports: {
          total, urgent: urgentCount, pending: pendingCount,
          assigned: assignedCount, completed: completedCount,
          newToday: newReportsToday,
        },
        volunteers: {
          total: totalVols, available: availableVols,
          emergency: emergencyVols, newToday: newVolsToday,
        },
        impact: {
          peopleServed: totalPop,
          matchRate,
          tasksCompleted: completedCount,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/dashboard/breakdown ────────────────────────────
router.get('/breakdown', async (req, res, next) => {
  try {
    const reports = await Report.find({});
    const types   = ['Food', 'Medical', 'Education', 'Logistics', 'Shelter', 'Water'];

    const breakdown = types.map(type => {
      const typeReports = reports.filter(r => r.problemType === type);
      const assigned    = typeReports.filter(r => r.status === 'Assigned' || r.status === 'Completed').length;
      const pending     = typeReports.filter(r => r.status === 'Pending' || r.status === 'Urgent').length;
      const population  = typeReports.reduce((s, r) => s + (parseInt(r.population) || 0), 0);
      const pct         = reports.length > 0 ? Math.round((typeReports.length / reports.length) * 100) : 0;

      return { type, total: typeReports.length, assigned, pending, population, percentage: pct };
    });

    // Sort by total desc
    breakdown.sort((a, b) => b.total - a.total);

    res.json({ success: true, data: breakdown });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/dashboard/urgent ────────────────────────────────
router.get('/urgent', async (req, res, next) => {
  try {
    const reports = await Report.find({});
    const urgent  = reports
      .filter(r => r.status === 'Urgent' || (r.urgent && r.status === 'Pending'))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.json({ success: true, count: urgent.length, data: urgent });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/dashboard/top-volunteers ────────────────────────
router.get('/top-volunteers', async (req, res, next) => {
  try {
    const limit = Math.min(20, parseInt(req.query.limit) || 5);
    const volunteers = await Volunteer.find({ available: true })
      .sort({ assignmentCount: -1 })
      .limit(limit);

    const top = volunteers.map(v => ({
      id: v._id, name: v.name, skill: v.skill,
      location: v.location, assignmentCount: v.assignmentCount || 0,
      emergency: v.emergency, lastAssignedAt: v.lastAssignedAt,
    }));

    res.json({ success: true, data: top });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/dashboard/recent ────────────────────────────────
router.get('/recent', async (req, res, next) => {
  try {
    const reports    = await Report.find({}).sort({ createdAt: -1 }).limit(10);
    const volunteers = await Volunteer.find({}).sort({ createdAt: -1 }).limit(10);
    const assignedReports = await Report.find({ assignedAt: { $ne: null } }).sort({ assignedAt: -1 }).limit(10);
    
    const limit      = Math.min(50, parseInt(req.query.limit) || 15);

    const reportActivity = reports.map(r => ({
      type:      'report',
      id:        r._id,
      title:     `New report: ${r.areaName} — ${r.problemType}`,
      subtitle:  `Severity: ${r.severity} · Status: ${r.status}`,
      severity:  r.severity,
      status:    r.status,
      timestamp: r.createdAt,
    }));

    const volActivity = volunteers.map(v => ({
      type:      'volunteer',
      id:        v._id,
      title:     `${v.name} joined as volunteer`,
      subtitle:  `Skill: ${v.skill} · Location: ${v.location}`,
      timestamp: v.createdAt,
    }));

    const assignActivity = assignedReports.map(r => ({
      type:      'assignment',
      id:        r._id,
      title:     `${r.volunteerName} assigned to ${r.areaName}`,
      subtitle:  `Task: ${r.problemType} · Severity: ${r.severity}`,
      timestamp: r.assignedAt,
    }));

    const feed = [...reportActivity, ...volActivity, ...assignActivity]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    res.json({ success: true, data: feed });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/dashboard/trend ─────────────────────────────────
router.get('/trend', async (req, res, next) => {
  try {
    // Generate an array of dates from 6 days ago up to today
    const days = 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const reports    = await Report.find({ createdAt: { $gte: startDate } });
    const volunteers = await Volunteer.find({ createdAt: { $gte: startDate } });
    const assignedReports = await Report.find({ assignedAt: { $gte: startDate } });

    const trend = [];

    for (let i = days - 1; i >= 0; i--) {
      const date     = new Date();
      date.setDate(date.getDate() - i);
      const dayStr   = date.toDateString();
      const label    = date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

      trend.push({
        date:       date.toISOString().split('T')[0],
        label,
        reports:    reports.filter(r => new Date(r.createdAt).toDateString() === dayStr).length,
        volunteers: volunteers.filter(v => new Date(v.createdAt).toDateString() === dayStr).length,
        assigned:   assignedReports.filter(r => r.assignedAt && new Date(r.assignedAt).toDateString() === dayStr).length,
      });
    }

    res.json({ success: true, data: trend });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
