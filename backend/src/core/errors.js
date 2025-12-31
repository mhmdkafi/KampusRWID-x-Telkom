export class AppError extends Error {
  constructor(message, status = 400, data) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", data) {
    super(message, 404, data);
  }
}

export class DomainError extends AppError {
  constructor(message = "Invalid request", status = 400, data) {
    super(message, status, data);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", data) {
    super(message, 401, data);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", data) {
    super(message, 403, data);
  }
}
