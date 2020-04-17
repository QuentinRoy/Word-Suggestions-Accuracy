import { ReadyStates } from "../constants";

function merge2ReadyStates(readyState1, readyState2) {
  if (
    readyState1 === ReadyStates.crashed ||
    readyState2 === ReadyStates.crashed
  ) {
    return ReadyStates.crashed;
  }
  if (
    readyState1 === ReadyStates.loading ||
    readyState2 === ReadyStates.loading
  ) {
    return ReadyStates.loading;
  }
  if (readyState1 === ReadyStates.idle || readyState2 === ReadyStates.idle) {
    return ReadyStates.idle;
  }
  if (readyState1 === ReadyStates.ready && readyState2 === ReadyStates.ready) {
    return ReadyStates.ready;
  }
  if (readyState1 === ReadyStates.done || readyState2 === ReadyStates.done) {
    return ReadyStates.done;
  }

  throw new Error(
    `Unexpected loading state combination: (${readyState1}, ${readyState2})`
  );
}

export default function mergeReadyStates(...readyStates) {
  return readyStates.reduce(merge2ReadyStates);
}
