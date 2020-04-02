import { LoadingStates } from "../constants";

function merge2LoadingStates(loadingState1, loadingState2) {
  if (
    loadingState1 === LoadingStates.invalidArguments ||
    loadingState2 === LoadingStates.invalidArguments
  ) {
    return LoadingStates.invalidArguments;
  }
  if (
    loadingState1 === LoadingStates.crashed ||
    loadingState2 === LoadingStates.crashed
  ) {
    return LoadingStates.crashed;
  }
  if (
    loadingState1 === LoadingStates.loading ||
    loadingState2 === LoadingStates.loading
  ) {
    return LoadingStates.loading;
  }
  if (
    loadingState1 === LoadingStates.idle ||
    loadingState2 === LoadingStates.idle
  ) {
    return LoadingStates.idle;
  }
  if (
    loadingState1 === LoadingStates.loaded &&
    loadingState2 === LoadingStates.loaded
  ) {
    return LoadingStates.loaded;
  }
  throw new Error(
    `Unexpected loading state combination: (${loadingState1}, ${loadingState2})`
  );
}

export default function mergeLoadingStates(...loadingStates) {
  return loadingStates.reduce(merge2LoadingStates);
}
