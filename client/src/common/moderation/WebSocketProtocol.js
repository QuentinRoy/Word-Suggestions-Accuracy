import mitt from "mitt";
import { MessageTypes, ReadyStates } from "../constants";

const WebSocketReadyStates = Object.freeze({
  connecting: 0,
  open: 1,
  closing: 2,
  closed: 3,
});

export const Events = Object.freeze({
  open: "open",
  error: "error",
  close: "close",
  readyStateChange: "readyState:change",
});

function MessageIdGenerator() {
  let nextMessageId = 0;
  return () => {
    // Select an id for the message.
    const id = nextMessageId;
    nextMessageId += 1;
    return id;
  };
}

export default function WebSocketProtocol({
  url,
  timeOut = 10000,
  onMessage: _onMessage,
}) {
  let onMessage = _onMessage;
  const emitter = mitt();

  const ws = new WebSocket(url);

  let readyState = ReadyStates.loading;

  // Store pending acknowledgements
  const pendingResponses = {};

  function handleResponse(message) {
    const pendingResp = pendingResponses[message.messageId];
    if (pendingResp == null) {
      // eslint-disable-next-line no-console
      console.warn(`Received unexpected response`, message);
      return;
    }

    // No need to clean up the pending ack here, it is done in send.
    if (message.type === MessageTypes.response) {
      pendingResp.resolve(message);
    } else {
      pendingResp.reject(new Error(message.error));
    }
  }

  function waitForResponse(messsageId) {
    // Set up the response promise and the pendingAcks property.
    // The promise is considered failed if no response is received before
    // timeout ms.
    let timeOutId;
    return new Promise((resolve, reject) => {
      pendingResponses[messsageId] = {
        resolve,
        reject,
      };
      timeOutId = setTimeout(() => {
        reject(
          new Error("Timeout elapsed without receiving an acknowledgement")
        );
      }, timeOut);
    }).finally(() => {
      clearTimeout(timeOutId);
      delete pendingResponses[messsageId];
    });
  }

  // Emit again state events.
  ws.onopen = (originalEvent) => {
    readyState = ReadyStates.ready;
    emitter.emit(Events.open, { type: Events.open, originalEvent });
    emitter.emit(Events.readyStateChange, {
      type: Events.readyStateChange,
      readyState,
    });
  };
  ws.onerror = (originalEvent) => {
    readyState = ReadyStates.crashed;
    emitter.emit(Events.error, { type: Events.error, originalEvent });
    emitter.emit(Events.readyStateChange, {
      type: Events.readyStateChange,
      readyState,
    });
  };
  ws.onclose = (originalEvent) => {
    if (readyState !== ReadyStates.crashed) {
      readyState = ReadyStates.done;
    }
    emitter.emit(Events.close, { type: Events.close, originalEvent });
    emitter.emit(Events.readyStateChange, {
      type: Events.readyStateChange,
      readyState,
    });
  };

  ws.onmessage = async (event) => {
    const message = JSON.parse(event.data);
    if (
      message.type === MessageTypes.response ||
      message.type === MessageTypes.error
    ) {
      handleResponse(message);
      return;
    }

    if (onMessage == null) {
      return;
    }
    // Call onMessage in a then clause to handle both async and
    // sync onMessage.
    try {
      const response = await onMessage(message);
      ws.send(
        JSON.stringify({
          type: MessageTypes.response,
          messageId: message.id,
          response,
        })
      );
    } catch (error) {
      if (ws.readyState !== WebSocketReadyStates.open) return;
      ws.send(
        JSON.stringify({
          type: MessageTypes.error,
          error: error.message,
          messageId: message.id,
        })
      );
    }
  };

  const generateMessageId = MessageIdGenerator();

  function send(message) {
    // Check that the id property is not being used since we need for managing
    // the acknowledgements.
    if (message.id != null) {
      throw new Error(`This message property is reserved: id`);
    }

    const id = generateMessageId();

    // Start waiting for a response before sending the message (just in case,
    // even if no race condition is actually possible).
    const responsePromise = waitForResponse(id);

    ws.send(JSON.stringify({ ...message, id }));
    return responsePromise;
  }

  return {
    on: (...args) => emitter.on(...args),
    off: (...args) => emitter.off(...args),
    close: (...args) => ws.close(...args),
    send,
    get readyState() {
      return readyState;
    },
    set onMessage(value) {
      onMessage = value;
    },
    get onMessage() {
      return onMessage;
    },
  };
}
