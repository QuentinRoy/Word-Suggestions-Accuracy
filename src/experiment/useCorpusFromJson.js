import { useMemo } from "react";
import shuffle from "lodash/shuffle";
import useJson, { States } from "../utils/useJson";

export { States };

const getURL = accuracy =>
  `./sks-distributions/acc-${accuracy.toFixed(3)}.json`;

const useCorpusFromJson = accuracy => {
  const [loadingState, data] = useJson(getURL(accuracy));
  const corpus = useMemo(() => {
    if (loadingState === States.loaded) return shuffle(data);
    return null;
  }, [data, loadingState]);

  return [loadingState, corpus];
};

export default useCorpusFromJson;
