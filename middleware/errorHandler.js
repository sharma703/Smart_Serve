/**
 * middleware/errorHandler.js
 * Centralized error handling middleware.
 * Must be registered LAST in server.js: app.use(errorHandler)
 */

'use strict';

/**
 * 404 Not Found — for unmatched routes.
 */
function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Global error handler — catches anything passed via next(err).
 */
function errorHandler(err, req, res, next) {
  // Log error details to console (consider winston/pino in production)
  console.error(`[ERROR] ${req.method} ${req.originalUrl}`, err.message);
  if (process.env.NODE_ENV === 'development') console.error(err.stack);

  // Default to 500
  const status  = err.status || err.statusCode || 500;
  const message = status === 500 ? 'Internal server error' : err.message;

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler };
