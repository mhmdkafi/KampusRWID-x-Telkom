export function httpErrorHandler(error, request, reply) {
  // Log error with proper context
  request.log.error(
    {
      error: error.message,
      stack: error.stack,
      path: request.url,
      method: request.method,
    },
    "Request error"
  );

  const status = error.status || error.statusCode || 500;
  const body = {
    error: error.message || "Internal Server Error",
  };

  if (error.data) {
    body.data = error.data;
  }

  // Don't expose stack trace in production
  if (process.env.NODE_ENV !== "production" && error.stack) {
    body.stack = error.stack;
  }

  reply.code(status).send(body);
}
