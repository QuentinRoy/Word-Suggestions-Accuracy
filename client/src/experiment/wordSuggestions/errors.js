export class RequestCanceledError extends Error {
  constructor(...args) {
    super(...args);
    this.name = "RequestCanceledError";
  }
}
export class NotSupportedError extends Error {
  constructor(...args) {
    super(...args);
    this.name = "NotSupportedError";
  }
}
export class ConnectionClosedError extends Error {
  constructor(...args) {
    super(...args);
    this.name = "ConnectionClosedError";
  }
}
