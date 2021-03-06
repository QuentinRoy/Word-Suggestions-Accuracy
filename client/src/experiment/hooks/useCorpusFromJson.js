import { useRef } from "react";
import shuffle from "lodash/shuffle";
import useJson from "../../common/hooks/useJson";
import { ReadyStates } from "../../common/constants";

const getURL = (accuracy) =>
  `./sks-distributions/acc-${accuracy.toFixed(3)}.json`;

const useCorpusFromJson = (accuracy, { shuffleRows = true } = {}) => {
  const [loadingState, data] = useJson(
    accuracy == null ? null : getURL(accuracy)
  );
  const corpusRef = useRef(null);

  if (
    (corpusRef.current == null && loadingState === ReadyStates.ready) ||
    (corpusRef.current != null && corpusRef.current.shuffled !== shuffleRows)
  ) {
    corpusRef.current = shuffleRows
      ? { ...data, rows: shuffle(data.rows), shuffled: true }
      : { ...data, shuffled: false };
  } else if (loadingState !== ReadyStates.ready) {
    corpusRef.current = null;
  }

  return [loadingState, corpusRef.current];
};

export default useCorpusFromJson;
