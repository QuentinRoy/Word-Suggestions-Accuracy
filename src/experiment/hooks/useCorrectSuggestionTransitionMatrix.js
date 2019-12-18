import TransitionMatrix from "../wordSuggestions/CorrectSuggestionTransitionMatrix";
import useAsync from "../../utils/useAsync";
import { transitionMatrixPath } from "../../utils/constants";

const useCorrectSuggestionTransitionMatrix = (url = transitionMatrixPath) =>
  useAsync(() => TransitionMatrix.fetch(url), [url]);

export default useCorrectSuggestionTransitionMatrix;
