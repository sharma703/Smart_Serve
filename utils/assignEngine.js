/**
 * utils/assignEngine.js
 * SmartServe Auto-Assignment Algorithm
 */

'use strict';

const Report = require('../models/Report');
const Volunteer = require('../models/Volunteer');

// Map problem types to volunteer skill keywords
const SKILL_MAP = {
  Food:      ['Cooking', 'Food', 'Nutrition', 'Admin'],
  Medical:   ['Medical', 'First Aid', 'Counseling', 'Health'],
  Education: ['Teaching', 'Education', 'Language', 'Admin'],
  Logistics: ['Driving', 'Logistics', 'Construction', 'Tech'],
  Shelter:   ['Construction', 'Logistics', 'Admin', 'Other'],
  Water:     ['Logistics', 'Construction', 'Medical', 'Tech'],
};

const SEVERITY_SCORE = { High: 3, Medium: 2, Low: 1 };

const MAX_ASSIGNMENTS_PER_RUN = 3;

/**
 * Run the auto-assignment algorithm.
 * @returns {Promise<{ assignments: Array, skipped: number, message: string }>}
 */
async function runAssignment() {
  const reports    = await Report.find({ status: { $in: ['Pending', 'Urgent'] } });
  const volunteers = await Volunteer.find({ available: true });

  const pendingTasks = reports.sort((a, b) => (SEVERITY_SCORE[b.severity] || 0) - (SEVERITY_SCORE[a.severity] || 0));

  if (pendingTasks.length === 0) {
    return { assignments: [], skipped: 0, message: 'No pending tasks to assign.' };
  }

  if (volunteers.length === 0) {
    return { assignments: [], skipped: pendingTasks.length, message: 'No available volunteers registered.' };
  }

  const runCounts = {};
  const assignments = [];

  for (const task of pendingTasks) {
    const requiredSkills = SKILL_MAP[task.problemType] || ['Other'];

    const candidate = findBestVolunteer(volunteers, task, requiredSkills, runCounts);

    if (!candidate) continue;

    const assignedAt = new Date();

    // Update task
    task.status = 'Assigned';
    task.volunteerId = candidate._id;
    task.volunteerName = candidate.name;
    task.volunteerSkill = candidate.skill;
    task.assignedAt = assignedAt;
    await task.save();

    // Update volunteer
    candidate.assignmentCount = (candidate.assignmentCount || 0) + 1;
    candidate.lastAssignedAt = assignedAt;
    await candidate.save();

    runCounts[candidate._id] = (runCounts[candidate._id] || 0) + 1;

    assignments.push({
      taskId:        task._id,
      area:          task.areaName,
      problemType:   task.problemType,
      severity:      task.severity,
      volunteerId:   candidate._id,
      volunteerName: candidate.name,
      volunteerSkill:candidate.skill,
      matchScore:    scoreMatch(candidate, task, requiredSkills),
      assignedAt,
    });
  }

  const skipped = pendingTasks.length - assignments.length;

  return {
    assignments,
    skipped,
    message: assignments.length > 0
      ? `Successfully assigned ${assignments.length} task(s). ${skipped} task(s) had no matching volunteers.`
      : 'No suitable matches found. Ensure volunteers have matching skills.',
  };
}

/**
 * Find the best available volunteer for a task.
 */
function findBestVolunteer(volunteers, task, requiredSkills, runCounts) {
  const available = volunteers.filter(v => {
    if ((runCounts[v._id] || 0) >= MAX_ASSIGNMENTS_PER_RUN) return false;
    return true;
  });

  if (available.length === 0) return null;

  const scored = available.map(v => ({
    volunteer: v,
    score:     scoreMatch(v, task, requiredSkills),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored[0].score > 0 ? scored[0].volunteer : null;
}

/**
 * Score how well a volunteer matches a task (0–100).
 */
function scoreMatch(volunteer, task, requiredSkills) {
  let score = 0;

  const volSkill = (volunteer.skill || '').toLowerCase();
  const skillMatch = requiredSkills.some(s => volSkill.includes(s.toLowerCase()));
  if (skillMatch) score += 40;

  const additionalSkills = volunteer.additionalSkills || [];
  const addMatch = additionalSkills.filter(as =>
    requiredSkills.some(rs => as.toLowerCase().includes(rs.toLowerCase()))
  ).length;
  score += Math.min(addMatch * 10, 20);

  const volLoc  = (volunteer.location || '').toLowerCase();
  const taskLoc = (task.location || task.areaName || '').toLowerCase();
  if (volLoc && taskLoc && (volLoc.split(/\s+/).some(w => taskLoc.includes(w)))) {
    score += 20;
  }

  if (task.severity === 'High' && volunteer.emergency) score += 10;

  const assigned = volunteer.assignmentCount || 0;
  score += Math.max(0, 10 - assigned);

  return score;
}

module.exports = { runAssignment, scoreMatch };
