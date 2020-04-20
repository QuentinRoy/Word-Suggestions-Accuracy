import lodash from "lodash";
import Joi from "@hapi/joi";
import { DEFAULT_RESPONSE_TIMEOUT, UserRoles } from "./constants.js";
import {
  ValidationError,
  UnauthorizedError,
  InvalidMessageError,
} from "./errors.js";
import loglevel from "loglevel";
import { MessageTypes } from "./constants.js";
import shortid from "shortid";

const log = loglevel.getLogger("api");

export async function handleMessage(data, client, context) {
  let msg;
  try {
    msg = JSON.parse(data);
    let handler = messageHandlers[msg.type];
    if (handler == null) {
      throw new InvalidMessageError(`Unknown message type:  ${msg.type}`);
    }
    const result = await handler(msg, client, context);
    if ((result == null || !result.noAck) && msg.id != null) {
      sendResponse(msg.id, client, result == null ? {} : result.data);
    }
  } catch (err) {
    handleError(msg, err, client, context);
  }
}

export function handleConnection(client, context) {
  setModeratorsClients(context);
}
export function handleClose(client, context) {
  rejectClientResponses(client);
  setModeratorsClients(context);
}

const messageIdShema = () => Joi.alternatives().try(Joi.string(), Joi.number());
const clientIdShema = messageIdShema;

const messageHandlers = {};

function addHandler(name, schema, handler, requiredRoles) {
  if (name in messageHandlers) {
    throw new Error(`Handler already exists: ${name}`);
  }
  messageHandlers[name] = (message, client, ...args) => {
    if (requiredRoles != null && !requiredRoles.includes(client.role)) {
      throw new UnauthorizedError(`Not allowed`);
    }
    let validation = schema.validate(lodash.omit(message, ["type", "id"]));
    if (validation.error != null) throw new ValidationError(validation.error);
    return handler(validation.value, client, ...args);
  };
}

addHandler(
  MessageTypes.register,
  Joi.object({
    role: Joi.string().required(),
    info: Joi.any(),
    pass: Joi.string(),
  }),
  ({ role, info, pass }, client, context) => {
    if (role === UserRoles.moderator && pass !== context.moderatorPassword) {
      throw new UnauthorizedError(`Invalid moderator pass`);
    }
    client.role = role;
    client.info = info;
    // No need to wait for that.
    setModeratorsClients(context);
    if (role === UserRoles.moderator) {
      setModeratorLogs(client);
    }
  }
);

addHandler(MessageTypes.unregister, Joi.any(), (_, client, context) => {
  client.role = null;
  client.info = null;
  // No need to wait for that.
  setModeratorsClients(context);
});

addHandler(
  MessageTypes.command,
  Joi.object({ target: clientIdShema().required() }).unknown(),
  async ({ target, ...args }, _, context) => {
    let targetClient = context.clients.get(target);
    if (!targetClient) throw new InvalidMessageError();
    const id = targetClient.send({ ...args, type: MessageTypes.command });
    return waitForResponse(id, targetClient);
  },
  [UserRoles.moderator]
);

let logs = [];

addHandler(
  MessageTypes.log,
  Joi.object({
    log: Joi.object({
      content: Joi.any(),
      type: Joi.string(),
    }).required(),
  }),
  ({ log }, client, context) => {
    const newLog = {
      ...log,
      id: shortid(),
      client: exportClient(client),
      date: new Date(),
    };
    logs.push(newLog);

    // Send the new log to all moderators, but do not wait for it.
    const message = { log: exportLog(newLog), type: MessageTypes.log };
    for (let client of context.clients.values()) {
      if (client.role !== UserRoles.moderator) continue;
      const messageId = client.send(message);
      waitForResponse(messageId, client).catch((error) => {
        log.error(
          `Could not send new log to moderator ${client.id}: ${error.message}`
        );
      });
    }
  }
);

addHandler(
  MessageTypes.setLogs,
  Joi.object({
    logs: Joi.array()
      .items(Joi.object({ content: Joi.object().required() }))
      .required(),
  }),
  (message, client, context) => {
    logs = message.logs;
    setModeratorsLogs(context);
  },
  [UserRoles.moderator]
);

async function setModeratorsLogs(context, _logs = logs.map(exportLog)) {
  await Promise.all(
    [...context.clients.values()]
      .filter((client) => client.role === UserRoles.moderator)
      .map((moderator) => setModeratorLogs(moderator, _logs))
  );
}

async function setModeratorLogs(moderator, _logs = logs.map(exportLog)) {
  let messageId = moderator.send({ type: MessageTypes.setLogs, logs: _logs });
  await waitForResponse(messageId, moderator).catch((error) => {
    log.error(`Could not update moderator ${moderator.id}: ${error.message}`);
  });
}

async function setModeratorsClients({ clients }) {
  const clientList = [...clients.values()];
  let message = {
    type: MessageTypes.setClients,
    clients: clientList.map(exportClient),
  };
  await Promise.all(
    clientList
      .filter((client) => client.role === UserRoles.moderator)
      .map((moderator) => {
        const messageId = moderator.send(message);
        return waitForResponse(messageId, moderator).catch((error) => {
          log.error(
            `Could not update moderator ${moderator.id}: ${error.message}`
          );
        });
      })
  );
}

function exportClient(client) {
  return lodash.pick(client, "id", "role", "info");
}

function exportLog(log) {
  // Clients are now exported before being stored as part of the log, so there
  // is nothing to do here.
  return log;
}

function handleError(message, error, client) {
  client.socket.send(
    JSON.stringify({
      type: MessageTypes.error,
      messageId: message == null ? undefined : message.id,
      name: error.name,
      error: error.message,
    })
  );
}

function sendResponse(messageId, client, data = {}) {
  client.socket.send(
    JSON.stringify({
      ...data,
      type: MessageTypes.response,
      messageId: messageId,
    })
  );
}

const responseTimeout =
  process.env.RESPONSE_TIMEOUT == null
    ? DEFAULT_RESPONSE_TIMEOUT
    : process.env.RESPONSE_TIMEOUT;

const pendingClientResponses = new Map();

function waitForResponse(messageId, client) {
  let pendingResponses = pendingClientResponses.get(client);
  if (pendingResponses == null) {
    pendingResponses = new Map();
    pendingClientResponses.set(client, pendingResponses);
  }
  let thisTimeOut = setTimeout(() => {
    let pr = pendingResponses.get(messageId);
    if (pr != null) {
      pr.reject(new Error("Time out"));
    }
  }, responseTimeout);
  return new Promise((resolve, reject) => {
    pendingResponses.set(messageId, { resolve, reject, client });
  }).finally(() => {
    pendingResponses.delete(messageId);
    if (pendingResponses.size <= 0) pendingClientResponses.delete(client);
    clearTimeout(thisTimeOut);
  });
}

// This reject all of a client responses
function rejectClientResponses(client) {
  let pendingResponses = pendingClientResponses.get(client);
  if (pendingResponses == null) return;
  for (let pendingResp of pendingResponses.values()) {
    pendingResp.reject(new Error(`Client disconnected`));
  }
  // pendingClientResponses is a weak map, so this is not required, but we still
  // remove the client just in case.
  pendingClientResponses.delete(client);
}

addHandler(
  "response",
  Joi.object({ messageId: messageIdShema().required() }).unknown(),
  (response, client) => {
    const result = { noAck: true };
    let pendingResponses = pendingClientResponses.get(client);
    if (pendingResponses == null) {
      return result;
    }
    let pendingResp = pendingResponses.get(response.messageId);
    if (pendingResp == null || pendingResp.client !== client) {
      return result;
    }
    pendingResp.resolve(response);
    // Make sure no acknowledgement is sent in response from a response.
    return result;
  }
);

addHandler(
  "error",
  Joi.object({ messageId: messageIdShema(), error: Joi.string() }),
  ({ messageId, error }, client) => {
    const result = { noAck: true };
    if (messageId == null) return result;
    let pendingResponses = pendingClientResponses.get(client);
    if (pendingResponses == null) {
      return result;
    }
    let pendingResp = pendingResponses.get(messageId);
    if (pendingResp == null || pendingResp.client !== client) {
      return result;
    }
    pendingResp.reject(new Error(error));
    // Make sure no acknowledgement is sent in response from a response.
    return result;
  }
);
