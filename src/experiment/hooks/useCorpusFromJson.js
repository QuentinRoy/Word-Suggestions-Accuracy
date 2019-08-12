import { useMemo } from "react";
import shuffle from "lodash/shuffle";
import useJson from "../../utils/useJson";
import { LoadingStates } from "../../utils/constants";

const getURL = accuracy =>
  `./sks-distributions/acc-${accuracy.toFixed(3)}.json`;

const useCorpusFromJson = accuracy => {
  const [loadingState, data] = useJson(getURL(accuracy));
  const corpus = useMemo(() => {
    if (loadingState === LoadingStates.loaded) return shuffle(data);
    return null;
  }, [data, loadingState]);

  return [loadingState, corpus];
};

export default useCorpusFromJson;
