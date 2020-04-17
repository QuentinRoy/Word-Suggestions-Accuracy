import { useState, useEffect, useRef } from "react";
import { ReadyStates, MessageTypes } from "../constants";

function throwNotReady() {
  throw new Error(`Websocket not ready`);
}

export default function useWebsocket(url, { onMessage, timeOut = 10000 } = {}) {
  const [readyState, setReadyState] = useState(ReadyStates.idle);
  const websocketRef = useRef(null);
  const sendRef = useRef(throwNotReady);

  // Put on message in a ref because we do not want to reconnect every time it
  // changes.
  const onMessageRef = useRef();
  onMessageRef.current = onMessage;

  const timeOutRef = useRef();
  timeOutRef.current = timeOut;

  // This effect create the websocket. We want to make sure it only depends on
  // url.
  useEffect(() => {
    if (url == null) {
      return undefined;
    }

    setReadyState(ReadyStates.loading);
    const ws = new WebSocket(url);
    websocketRef.current = ws;

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
        }, timeOutRef.current);
      }).finally(() => {
        clearTimeout(timeOutId);
        delete pendingResponses[messsageId];
      });
    }

    const handlers = {
      open() {
        setReadyState(ReadyStates.ready);
      },
      error() {
        setReadyState(ReadyStates.crashed);
      },
      close() {
        setReadyState(ReadyStates.done);
      },
      message(event) {
        const message = JSON.parse(event.data);
        if (
          message.type === MessageTypes.response ||
          message.type === MessageTypes.error
        ) {
          handleResponse(message);
        } else if (onMessageRef.current != null) {
          // Call onMessageRef.current in a then clause to handle both async and
          // sync onMessage.
          Promise.resolve(message)
            .then(onMessageRef.current)
            .then(() => {
              ws.send(
                JSON.stringify({
                  type: MessageTypes.response,
                  messageId: message.id,
                })
              );
            })
            .catch((error) => {
              ws.send(
                JSON.stringify({
                  type: MessageTypes.error,
                  error: error.message,
                  messageId: message.id,
                })
              );
            });
        }
      },
    };

    Object.entries(handlers).forEach(([eventName, handler]) => {
      ws.addEventListener(eventName, handler);
    });

    let nextMessageId = 0;
    sendRef.current = function send(message) {
      // Check that the id property is not being used since we need for managing
      // the acknowledgements.
      if (message.id != null) {
        throw new Error(`This message property is reserved: id`);
      }
      // Select an id for the message.
      const id = nextMessageId;
      nextMessageId += 1;

      // Start waiting for a response before sending the message (just in case,
      // even if no race condition is actually possible).
      const responsePromise = waitForResponse(id);

      ws.send(JSON.stringify({ ...message, id }));
      return responsePromise;
    };

    return () => {
      Object.entries(handlers).forEach(([eventName, handler]) => {
        ws.removeEventListener(eventName, handler);
      });
      ws.close();
      websocketRef.current = null;
      sendRef.current = throwNotReady;
      setReadyState(ReadyStates.done);
    };
  }, [url]);

  return [readyState, sendRef.current];
}
