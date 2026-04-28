/**
 * utils/seed.js
 * Populate the JSON database with realistic starter data.
 * Run once: node utils/seed.js
 */

'use strict';

require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

// ── Seed Volunteers ──────────────────────────────────────────
const volunteers = [
  {
    id: uuidv4(), name: 'Arjun Kumar',   email: 'arjun.kumar@example.com',
    phone: '+91 9876543210', location: 'North District, Bangalore',
    age: '26-35', skill: 'Medical', additionalSkills: ['First Aid', 'Counseling'],
    experience: '4', bio: 'Healthcare professional with 4 years of field experience.',
    availability: { days: ['Mon','Tue','Wed','Thu','Fri'], timeSlot: 'Anytime' },
    hoursPerWeek: '20', emergency: true, available: true,
    assignmentCount: 24, status: 'Active',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: uuidv4(), name: 'Sonia Patel',   email: 'sonia.patel@example.com',
    phone: '+91 9123456789', location: 'West Colony, Delhi',
    age: '26-35', skill: 'Teaching', additionalSkills: ['Language Support', 'Admin'],
    experience: '3', bio: 'Primary school teacher passionate about rural education.',
    availability: { days: ['Mon','Wed','Fri','Sat'], timeSlot: 'Morning' },
    hoursPerWeek: '15', emergency: false, available: true,
    assignmentCount: 19, status: 'Active',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: uuidv4(), name: 'Rahul Nair',    email: 'rahul.nair@example.com',
    phone: '+91 9345678901', location: 'East Block, Mumbai',
    age: '18-25', skill: 'Driving', additionalSkills: ['Heavy Lifting', 'Logistics'],
    experience: '2', bio: 'Licensed driver with a large vehicle. Available weekends.',
    availability: { days: ['Sat','Sun'], timeSlot: 'Anytime' },
    hoursPerWeek: '12', emergency: true, available: true,
    assignmentCount: 17, status: 'Active',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: uuidv4(), name: 'Meera Iyer',   email: 'meera.iyer@example.com',
    phone: '+91 9567890123', location: 'South Market, Chennai',
    age: '36-45', skill: 'Cooking', additionalSkills: ['Cooking', 'Admin'],
    experience: '6', bio: 'Runs a community kitchen. Experienced in bulk food distribution.',
    availability: { days: ['Mon','Tue','Wed','Thu','Fri'], timeSlot: 'Morning' },
    hoursPerWeek: '25', emergency: false, available: true,
    assignmentCount: 15, status: 'Active',
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
  {
    id: uuidv4(), name: 'Karan Singh',  email: 'karan.singh@example.com',
    phone: '+91 9678901234', location: 'Green Valley, Hyderabad',
    age: '26-35', skill: 'Medical', additionalSkills: ['First Aid', 'IT Support'],
    experience: '5', bio: 'Paramedic with emergency response training.',
    availability: { days: ['Mon','Tue','Thu','Sat'], timeSlot: 'Afternoon' },
    hoursPerWeek: '18', emergency: true, available: true,
    assignmentCount: 12, status: 'Active',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: uuidv4(), name: 'Priya Sharma', email: 'priya.sharma@example.com',
    phone: '+91 9789012345', location: 'River Road, Pune',
    age: '18-25', skill: 'Driving', additionalSkills: ['Driving', 'Language Support'],
    experience: '1', bio: 'College student available on evenings and weekends.',
    availability: { days: ['Fri','Sat','Sun'], timeSlot: 'Evening' },
    hoursPerWeek: '10', emergency: false, available: true,
    assignmentCount: 8, status: 'Active',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: uuidv4(), name: 'Deepa Rao',   email: 'deepa.rao@example.com',
    phone: '+91 9890123456', location: 'Lake View, Bangalore',
    age: '36-45', skill: 'Teaching', additionalSkills: ['Counseling', 'Language Support'],
    experience: '8', bio: 'Retired school principal. Dedicated to adult literacy programs.',
    availability: { days: ['Mon','Tue','Wed','Thu','Fri'], timeSlot: 'Morning' },
    hoursPerWeek: '30', emergency: false, available: true,
    assignmentCount: 6, status: 'Active',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: uuidv4(), name: 'Ravi Menon',  email: 'ravi.menon@example.com',
    phone: '+91 9901234567', location: 'Hill Side, Kochi',
    age: '36-45', skill: 'Construction', additionalSkills: ['Heavy Lifting', 'Driving'],
    experience: '10', bio: 'Civil engineer volunteering for shelter and infrastructure aid.',
    availability: { days: ['Sat','Sun'], timeSlot: 'Anytime' },
    hoursPerWeek: '16', emergency: true, available: true,
    assignmentCount: 5, status: 'Active',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
];

// ── Seed Reports ─────────────────────────────────────────────
const reports = [
  {
    id: uuidv4(), areaName: 'South Market Area', problemType: 'Food',
    severity: 'High', location: '12.9141° N, 77.6411° E',
    population: 800, description: 'Food distribution centre ran out of supplies. ~800 residents affected.',
    urgent: true, status: 'Assigned',
    volunteerId: null, volunteerName: 'Meera Iyer', volunteerSkill: 'Cooking',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: uuidv4(), areaName: 'West Colony', problemType: 'Medical',
    severity: 'High', location: '28.6692° N, 77.2267° E',
    population: 300, description: 'Local clinic running out of basic medicines and first aid kits.',
    urgent: true, status: 'Assigned',
    volunteerId: null, volunteerName: 'Arjun Kumar', volunteerSkill: 'Medical',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: uuidv4(), areaName: 'Old Town',    problemType: 'Education',
    severity: 'Low', location: '18.9220° N, 72.8347° E',
    population: 120, description: 'No qualified teachers available for the community school this month.',
    urgent: false, status: 'Assigned',
    volunteerId: null, volunteerName: 'Sonia Patel', volunteerSkill: 'Teaching',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: uuidv4(), areaName: 'East Block',  problemType: 'Logistics',
    severity: 'Medium', location: '19.0760° N, 72.8777° E',
    population: 450, description: 'Supply chain disruption — goods stuck at transit point for 3 days.',
    urgent: false, status: 'Pending',
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: uuidv4(), areaName: 'Central Zone', problemType: 'Shelter',
    severity: 'High', location: '22.5726° N, 88.3639° E',
    population: 200, description: '40 families displaced after severe flooding. Need temporary shelter.',
    urgent: true, status: 'Pending',
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: uuidv4(), areaName: 'Hill Side',   problemType: 'Water',
    severity: 'High', location: '9.9312° N, 76.2673° E',
    population: 600, description: 'Water source contaminated. Residents using unsafe water.',
    urgent: true, status: 'Pending',
    createdAt: new Date(Date.now() - 0.5 * 3600000).toISOString(),
  },
  {
    id: uuidv4(), areaName: 'Green Valley', problemType: 'Medical',
    severity: 'Medium', location: '17.3850° N, 78.4867° E',
    population: 180, description: 'Seasonal disease outbreak — need health camp support.',
    urgent: false, status: 'Assigned',
    volunteerName: 'Karan Singh', volunteerSkill: 'Medical',
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
  {
    id: uuidv4(), areaName: 'River Road',  problemType: 'Logistics',
    severity: 'Low', location: '18.5204° N, 73.8567° E',
    population: 90, description: 'Aid packages need transport to remote village.',
    urgent: false, status: 'Completed',
    volunteerName: 'Priya Sharma', volunteerSkill: 'Driving',
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: uuidv4(), areaName: 'Lake View',   problemType: 'Education',
    severity: 'Medium', location: '12.9716° N, 77.5946° E',
    population: 250, description: 'Adult literacy program needs instructors for evening classes.',
    urgent: false, status: 'Assigned',
    volunteerName: 'Deepa Rao', volunteerSkill: 'Teaching',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
  {
    id: uuidv4(), areaName: 'North District', problemType: 'Food',
    severity: 'Medium', location: '13.0827° N, 80.2707° E',
    population: 350, description: 'Weekly food ration distribution needs volunteers.',
    urgent: false, status: 'Pending',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
  },
];

// ── Write seed data ──────────────────────────────────────────
db.write('volunteers', volunteers);
db.write('reports', reports);

console.log(`\n✅  SmartServe DB Seeded Successfully`);
console.log(`   Volunteers : ${volunteers.length}`);
console.log(`   Reports    : ${reports.length}\n`);
console.log('   Run "npm run dev" to start the server.\n');
