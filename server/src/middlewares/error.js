/**
 * Global error-handling middleware.

 * @param {Error} err - The error object thrown in the application
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function (not used here, but required by Express)
 */
export const errorMiddleware = (err, req, res, next) => {
  console.error(err); // Server-side error log

  const status = err.status || 400;       // Default to 400 (Bad Request) if not specified
  const message = err.message || "Internal server error";

  res.status(status).json({
    ok: false,
    error: message,
  });
};
