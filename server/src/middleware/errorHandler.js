export function errorHandler(err, req, res, next) {
  let status = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      status = 413;
      message = 'File exceeds the maximum upload limit of 100 MB. Please upload a smaller video or floor plan images.';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      status = 400;
      message = 'Too many files uploaded at once. Maximum allowed is 30 files.';
    } else {
      status = 400;
      message = `Upload validation error: ${err.message}`;
    }
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid resource identifier format.';
  }

  console.error(`[Error Middleware] ${req.method} ${req.originalUrl || req.url} -> ${status}: ${message}`);

  res.status(status).json({
    error: true,
    message,
    code: err.code,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
