export const MODERATOR_ROLE = "moderator";
export const PARTICIPANT_ROLE = "participant";
export const DEFAULT_PONG_DURATION = 30000;
export const DEFAULT_RESPONSE_TIMEOUT = 5000;

export const MessageTypes = Object.freeze({
  response: "response",
  command: "command",
  register: "register",
  unregister: "unregister",
  error: "error",
  clientUpdate: "client-update",
});

export const UserRoles = Object.freeze({
  moderator: "moderator",
  participant: "participant",
});
