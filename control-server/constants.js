export const DEFAULT_PONG_DURATION = 30000;
export const DEFAULT_RESPONSE_TIMEOUT = 5000;
export const DEFAULT_STATIC_FILES = "./static";
export const DEFAULT_STATIC_NOT_FOUND_FILE = "/404.html";

export const MessageTypes = Object.freeze({
  response: "response",
  command: "command",
  register: "register",
  unregister: "unregister",
  error: "error",
  setClients: "set-clients",
  clearLogs: "clear-logs",
  setLogs: "set-logs",
  log: "log",
});

export const UserRoles = Object.freeze({
  moderator: "moderator",
  participant: "participant",
});
