// FIXME: It is probably a bad idea to use this. See
// https://github.com/QuentinRoy/accuracy_autocorrect/issues/142.

import { useEffect, useRef, useReducer, useCallback } from "react";
import { ReadyStates, MessageTypes } from "../constants";

function throwNotReady() {
  throw new Error(`Websocket not ready`);
}

const Actions = Object.freeze({
  create: "CREATE",
  open: "OPEN",
  close: "CLOSE",
  error: "ERROR",
  reconnect: "RECONNECT",
});

function reducer(state, action) {
  switch (action.type) {
    // Websocket related actions.
    case Actions.create:
      return { ...state, value: ReadyStates.loading, error: null };
    case Actions.open:
      if (state.value === ReadyStates.crashed && !action.shouldClearErrors) {
        return state;
      }
      return { ...state, value: ReadyStates.ready, error: null };
    case Actions.close:
      if (state.value === ReadyStates.crashed && !action.shouldClearErrors) {
        return state;
      }
      return { ...state, value: ReadyStates.done, error: null };
    case Actions.error:
      return { ...state, value: ReadyStates.crashed, error: action.error };

    // Other actions.
    case Actions.reconnect:
      return { ...state, totalReconnections: state.totalReconnections + 1 };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

export default function useWebsocket(url, { onMessage, timeOut = 10000 } = {}) {
  const [state, dispatch] = useReducer(reducer, {
    value: ReadyStates.idle,
    totalReconnections: 0,
  });
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
  useEffect(
    () => {
      if (url == null) {
        return undefined;
      }

      dispatch({ type: Actions.create });
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
          dispatch({ type: Actions.open });
        },
        error(_error) {
          dispatch({ type: Actions.error, error: _error });
        },
        close() {
          dispatch({ type: Actions.close });
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
              .catch((_error) => {
                ws.send(
                  JSON.stringify({
                    type: MessageTypes.error,
                    error: _error.message,
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
        dispatch({ type: Actions.close, shouldClearErrors: true });
      };
    },
    // Using the totalReconnections argument to force this effect to restart
    // when reconnect is called.
    [url, state.totalReconnections]
  );

  const reconnect = useCallback(() => {
    dispatch({ type: Actions.reconnect });
  }, []);

  return [state.value, sendRef.current, reconnect, state.error];
}
