/**
 * Global Error Handling Middleware
 * This must be the LAST middleware in app.js
 */
export const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = 500;
  let message = "Internal Server Error";

  /**
   * Handle known operational errors
   */
  if (err.message) {
    message = err.message;
    statusCode = err.statusCode || 400;
  }

  /**
   * MySQL duplicate entry error
   */
  if (err.code === "ER_DUP_ENTRY") {
    statusCode = 409;
    message = "Duplicate entry detected";
  }

  /**
   * MySQL foreign key constraint error
   */
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    statusCode = 400;
    message = "Invalid reference ID";
  }

  /**
   * JWT errors
   */
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token expired";
  }

  /**
   * Log error (important for debugging)
   */
  console.error("❌ Error:", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  /**
   * Final response
   */
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};
