export function httpErrorHandler(error, request, reply) {
  const status = error.status || error.statusCode || 500;
  const body = { message: error.message || "Internal Server Error" };
  if (error.data) body.data = error.data;
  request.log.error(error);
  reply.code(status).send(body);
}
