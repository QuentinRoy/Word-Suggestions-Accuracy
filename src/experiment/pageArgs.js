import uniqWith from "lodash/uniqWith";
import { SuggestionTypes, PageArguments } from "../utils/constants";

export const parseExtraConditionsArg = extraConditionsArg => {
  const [delayStr, targetAccuracyStr] = extraConditionsArg.split("-");
  const keyStrokeDelay = parseInt(delayStr, 10);
  const targetAccuracy = parseFloat(targetAccuracyStr, 10);
  return { keyStrokeDelay, targetAccuracy };
};

export const getPageArgs = urlString => {
  const urlParams = new URL(urlString).searchParams;
  // Note: urlParams.get returns null when the argument is not found, this
  // is surprising, but perfect in our case since we would want our values
  // to be null if not found.
  const workerId = urlParams.get(PageArguments.workerId);
  const assignmentId = urlParams.get(PageArguments.assignmentId);
  const hitId = urlParams.get(PageArguments.hitId);
  const suggestionsParam = urlParams.get(PageArguments.suggestionsType);
  const device = urlParams.get(PageArguments.device);
  const totalSuggestions = urlParams.has(PageArguments.totalSuggestions)
    ? parseInt(urlParams.get(PageArguments.totalSuggestions), 10)
    : null;
  const waveState = urlParams.get(PageArguments.wave);
  const keyStrokeDelays = urlParams.has(PageArguments.keyStrokeDelays)
    ? urlParams
        .get(PageArguments.keyStrokeDelays)
        .split(",")
        .map(x => parseInt(x, 10))
    : null;
  const targetAccuracies = urlParams.has(PageArguments.targetAccuracies)
    ? urlParams
        .get(PageArguments.targetAccuracies)
        .split(",")
        .map(parseFloat)
    : null;
  const extraConditions = urlParams.has(PageArguments.extraConditions)
    ? urlParams
        .get(PageArguments.extraConditions)
        .split(",")
        .map(parseExtraConditionsArg)
    : null;

  return {
    assignmentId,
    hitId,
    participant: workerId,
    suggestionsType: suggestionsParam,
    targetAccuracies,
    keyStrokeDelays,
    totalSuggestions,
    extraConditions,
    wave: waveState,
    device
  };
};

export const checkPageArgs = ({
  wave,
  extraConditions,
  participant,
  targetAccuracies,
  keyStrokeDelays,
  suggestionsType
}) => {
  // If extraConditions is not provided, both targetAccuracy and keyStrokeDelays must be
  // provided.
  if (
    (targetAccuracies == null || keyStrokeDelays == null) &&
    extraConditions == null
  ) {
    return false;
  }
  // If targetAccuracies is provided, keyStrokeDelays must be too, and
  // vice-versa.
  if (
    (targetAccuracies == null && keyStrokeDelays != null) ||
    (targetAccuracies != null && keyStrokeDelays == null)
  ) {
    return false;
  }
  // Participant, wave and suggestionsType must be provided, suggestionsType
  // must be one of the supported types.
  return (
    participant != null &&
    wave != null &&
    Object.values(SuggestionTypes).includes(suggestionsType)
  );
};

export const getAllPossibleConditions = ({
  targetAccuracies,
  keyStrokeDelays,
  extraConditions
} = {}) => {
  const results = [...extraConditions];
  for (let i = 0; i < targetAccuracies.length; i += 1) {
    for (let j = 0; j < keyStrokeDelays.length; j += 1) {
      results.push({
        targetAccuracy: targetAccuracies[i],
        keyStrokeDelay: keyStrokeDelays[j]
      });
    }
  }
  // Removes duplicates which may happen if the value is both in extraConditions and
  // a combination of targetAccuracies and keyStrokeDelays
  return uniqWith(
    results,
    (r1, r2) =>
      Math.abs(r1.targetAccuracy - r2.targetAccuracy) < 0.00001 &&
      r1.keyStrokeDelay === r2.keyStrokeDelay
  );
};
