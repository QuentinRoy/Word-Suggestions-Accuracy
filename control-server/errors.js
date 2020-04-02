export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

export class InvalidMessageError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidMessageError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = "UnauthorizedError";
  }
}
