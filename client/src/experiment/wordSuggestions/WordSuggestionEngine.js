import mitt from "mitt";
import { getCurrentInputWord } from "../input";
import {
  NotSupportedError,
  RequestCanceledError,
  ConnectionClosedError,
} from "./errors";

const suggestionRequestMsgType = "sreq";
const suggestionResponseMsgType = "sresp";
const errorMsgType = "err";
const fieldSeparator = "|";
const subSeparator = ";";

export default function WordSuggestionsEngine(serverAddress) {
  if (window.WebSocket == null) {
    throw new NotSupportedError("Requires WebSockets support");
  }

  const { on, off, emit } = mitt();

  const socket = new WebSocket(serverAddress);

  const close = () => {
    socket.close();
  };

  const requests = [];

  let lastReqNum = -1;

  const requestSuggestions = ({
    totalSuggestions,
    sksDistribution,
    input,
    canReplaceLetters,
    ...otherArgs
  }) => {
    const reqNum = lastReqNum + 1;
    lastReqNum = reqNum;
    return new Promise((resolve, reject) => {
      const {
        word: inputWord,
        index: currentInputWordIndex,
      } = getCurrentInputWord(input);

      let correctSuggestionPositions = [];
      let targetWord = "";
      if (currentInputWordIndex < sksDistribution.length) {
        ({ correctSuggestionPositions, word: targetWord } = sksDistribution[
          currentInputWordIndex
        ]);
      }

      requests.push({
        args: {
          totalSuggestions,
          sksDistribution,
          input,
          canReplaceLetters,
          ...otherArgs,
        },
        num: reqNum,
        resolve,
        reject,
      });
      socket.send(
        [
          suggestionRequestMsgType,
          lastReqNum,
          inputWord,
          totalSuggestions,
          targetWord,
          correctSuggestionPositions.join(subSeparator),
        ].join(fieldSeparator)
      );
    });
  };

  const handleSuggestionResponse = (parts) => {
    if (parts.length !== 2) {
      // eslint-disable-next-line no-console
      console.error(
        `Received incorrect answer format: "${parts.join(fieldSeparator)}"`
      );
      return;
    }
    const reqNum = +parts[0];
    const suggestions = parts[1] === "" ? [] : parts[1].split(subSeparator);

    const reqIdx = requests.findIndex((r) => r.num === reqNum);

    // Check that the responses are received in order.
    if (reqIdx < 0) return;
    requests
      .splice(0, reqIdx)
      .forEach((canceledReq) =>
        canceledReq.reject(
          new RequestCanceledError(
            `Received an answer for a more recent request`
          )
        )
      );
    const req = requests.shift();
    req.resolve(suggestions);
    emit("suggestions", {
      ...req.args,
      suggestions: parts[1].split(subSeparator),
    });
  };

  socket.addEventListener("message", ({ data }) => {
    const [msgType, ...msgContent] = data.split(fieldSeparator);
    switch (msgType) {
      case suggestionResponseMsgType:
        handleSuggestionResponse(msgContent);
        break;
      case errorMsgType:
        // eslint-disable-next-line no-console
        console.error(
          `Received server error: ${msgContent.join(fieldSeparator)}`
        );
        break;
      default:
        // eslint-disable-next-line no-console
        console.error(`Received unknown message type: ${msgType}`);
    }
  });

  socket.addEventListener("open", () => emit("open"));
  socket.addEventListener("error", (err) => {
    requests.splice(0, requests.length).forEach((r) => r.reject(err));
    emit("error", err);
  });
  socket.addEventListener("close", () => {
    requests
      .splice(0, requests.length)
      .forEach((r) =>
        r.reject(new ConnectionClosedError(`The connection has been closed`))
      );
    emit("close");
  });

  return { close, on, off, requestSuggestions };
}
