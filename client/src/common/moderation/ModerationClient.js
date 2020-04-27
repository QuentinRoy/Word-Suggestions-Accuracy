import mitt from "mitt";
import WebSocketProtocol, {
  Events as ProtocolEvents,
} from "./WebSocketProtocol";
import { MessageTypes, ReadyStates } from "../constants";

export const Events = Object.freeze({
  ...ProtocolEvents,
  clientsChange: "clients:change",
  logsChange: "logs:change",
  command: "command",
  registrationChange: "registration:change",
});

export default function ModerationClient({
  url,
  onCommand: _onCommand,
  role,
  info,
  pass,
}) {
  const emitter = mitt();
  let onCommand = _onCommand;

  // Logs need to be stored here, because unlike clients, they can be patched
  // instead of being entirely reset.
  let logs = [];
  const messageHandlers = {
    [MessageTypes.setClients](message) {
      emitter.emit(Events.clientsChange, { clients: message.clients });
    },
    [MessageTypes.setLogs](message) {
      logs = message.logs;
      emitter.emit(Events.logsChange, { logs });
    },
    [MessageTypes.log](message) {
      logs.push(message.log);
      emitter.emit(Events.logsChange, { logs });
    },
    async [MessageTypes.command](message) {
      if (onCommand == null) {
        throw new Error(`no command's handler`);
      }
      return onCommand(message.command, message.args);
    },
  };

  async function onMessage(message) {
    const handler = messageHandlers[message.type];
    if (handler == null) {
      throw new Error(`Unexpected message: ${message.type}`);
    }
    return handler(message);
  }

  const ws = WebSocketProtocol({ url, onMessage });

  let registration = null;
  let readyState = ReadyStates.loading;
  // Register when the server is ready, and synchronize ready states.
  ws.on(Events.readyStateChange, async ({ readyState: newReadyState }) => {
    if (newReadyState === ReadyStates.ready) {
      readyState = ReadyStates.loading;
      try {
        await ws.send({
          role,
          info,
          pass,
          type: MessageTypes.register,
        });
        // Make sure the state has not changed during the registration request.
        if (readyState === ReadyStates.loading) {
          registration = { role, info };
          readyState = ReadyStates.ready;
          emitter.emit(Events.registrationChange, {
            type: Events.registered,
            registration,
          });
          emitter.emit(Events.readyStateChange, { readyState });
        }
      } catch (error) {
        readyState = ReadyStates.crashed;
        emitter.emit(Events.error, { error });
        emitter.emit(Events.readyStateChange, { readyState });
        ws.close();
      }
    } else if (readyState !== ReadyStates.crashed) {
      readyState = newReadyState;
      emitter.emit(Events.readyStateChange, { readyState });
    }
  });

  ws.on(Events.close, (event) => emitter.emit(Events.close, event));
  ws.on(Events.error, (event) => emitter.emit(Events.error, event));
  ws.on(Events.open, (event) => emitter.emit(Events.open, event));

  async function startApp({ app, target, ...args }) {
    await ws.send({
      type: MessageTypes.command,
      target,
      command: "start-app",
      args: { ...args, app },
    });
  }

  async function clearLogs() {
    await ws.send({ type: MessageTypes.setLogs, logs: [] });
  }

  async function sendLog(type, content) {
    await ws.send({ type: MessageTypes.log, log: { type, content } });
  }

  return {
    on: (...args) => emitter.on(...args),
    off: (...args) => emitter.off(...args),
    startApp,
    clearLogs,
    get readyState() {
      return readyState;
    },
    sendLog,
    close: (...args) => ws.close(...args),
    set onCommand(value) {
      onCommand = value;
    },
    get onCommand() {
      return onCommand;
    },
    get registration() {
      return registration;
    },
  };
}
