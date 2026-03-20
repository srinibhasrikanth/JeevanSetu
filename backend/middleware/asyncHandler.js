/**
 * Wraps async route handlers to automatically forward errors to Express
 * global error handler — eliminates repetitive try/catch boilerplate.
 *
 * @param {Function} fn - Async express route handler
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
