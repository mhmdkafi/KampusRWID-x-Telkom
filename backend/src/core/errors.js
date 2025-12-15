export class AppError extends Error {
  constructor(message, status = 400, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}
export class NotFoundError extends AppError {
  constructor(message = "Not found", data) {
    super(message, 404, data);
  }
}
export class DomainError extends AppError {
  constructor(message = "Domain error", data) {
    super(message, 422, data);
  }
}
