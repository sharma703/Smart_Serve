/**
 * utils/db.js
 * Lightweight JSON flat-file database with read/write helpers.
 * Each "collection" is a separate .json file inside /data.
 *
 * Usage:
 *   const db = require('./db');
 *   const reports = db.read('reports');   // returns array
 *   db.write('reports', reports);         // saves array to file
 */

'use strict';

const fs   = require('fs');
const path = require('path');

// Data directory (configurable via .env)
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, '..', 'data'));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Read a collection from its JSON file.
 * @param {string} collection  — filename without .json
 * @returns {Array}
 */
function read(collection) {
  const filePath = path.join(DATA_DIR, `${collection}.json`);
  if (!fs.existsSync(filePath)) {
    // Create empty collection file
    fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
    return [];
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`[DB] Failed to parse ${collection}.json:`, err.message);
    return [];
  }
}

/**
 * Write a collection to its JSON file (full overwrite).
 * @param {string} collection  — filename without .json
 * @param {Array}  data        — array of records
 */
function write(collection, data) {
  const filePath = path.join(DATA_DIR, `${collection}.json`);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error(`[DB] Failed to write ${collection}.json:`, err.message);
    throw err;
  }
}

/**
 * Find a single record by ID.
 * @param {string} collection
 * @param {string} id
 * @returns {Object|null}
 */
function findById(collection, id) {
  const data = read(collection);
  return data.find(item => item.id === id) || null;
}

/**
 * Insert a record. Returns the inserted record.
 * @param {string} collection
 * @param {Object} record
 * @returns {Object}
 */
function insert(collection, record) {
  const data = read(collection);
  data.unshift(record); // newest first
  write(collection, data);
  return record;
}

/**
 * Update a record by ID. Returns updated record or null.
 * @param {string} collection
 * @param {string} id
 * @param {Object} updates
 * @returns {Object|null}
 */
function update(collection, id, updates) {
  const data = read(collection);
  const idx  = data.findIndex(item => item.id === id);
  if (idx === -1) return null;
  data[idx] = { ...data[idx], ...updates, updatedAt: new Date().toISOString() };
  write(collection, data);
  return data[idx];
}

/**
 * Delete a record by ID. Returns true if deleted.
 * @param {string} collection
 * @param {string} id
 * @returns {boolean}
 */
function remove(collection, id) {
  const data    = read(collection);
  const filtered = data.filter(item => item.id !== id);
  if (filtered.length === data.length) return false;
  write(collection, filtered);
  return true;
}

/**
 * Count records matching an optional filter function.
 * @param {string}   collection
 * @param {Function} [filterFn]
 * @returns {number}
 */
function count(collection, filterFn) {
  const data = read(collection);
  return filterFn ? data.filter(filterFn).length : data.length;
}

module.exports = { read, write, findById, insert, update, remove, count };
