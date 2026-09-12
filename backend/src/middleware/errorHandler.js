/**
 * Centralized API Error Handling Middleware
 */
export const errorHandler = (err, req, res, _next) => {
  console.error('[PLAYNEXUS_API_ERROR]', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'INTERNAL NEURAL COMBAT ENGINE ERROR';

  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    },
  });
};
