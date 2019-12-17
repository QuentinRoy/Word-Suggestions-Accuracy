import { FocusTargetTypes, Actions } from "../../utils/constants";
import { mod } from "../../utils/math";

const inputFocusTarget = Object.freeze({ type: FocusTargetTypes.input });
export default function subFocusReducer(state, action) {
  switch (action.type) {
    case Actions.moveFocusTarget:
      if (
        state.focusTarget != null &&
        (state.focusTarget.type === FocusTargetTypes.input ||
          state.focusTarget.type === FocusTargetTypes.suggestion)
      ) {
        const currentFocusTargetIndex =
          state.focusTarget.type === FocusTargetTypes.input
            ? state.totalSuggestionTargets
            : state.focusTarget.suggestionNumber;
        const newFocusTargetIndex = mod(
          currentFocusTargetIndex + action.direction,
          state.totalSuggestionTargets + 1
        );
        const newFocusTarget =
          newFocusTargetIndex < state.totalSuggestionTargets
            ? {
                type: FocusTargetTypes.suggestion,
                suggestionNumber: newFocusTargetIndex
              }
            : inputFocusTarget;
        return { ...state, focusTarget: newFocusTarget };
      }
      return state;

    case Actions.inputSuggestion:
      return { ...state, focusTarget: inputFocusTarget };

    case Actions.windowBlurred:
      return { ...state, focusTarget: null };

    case Actions.windowFocused:
      return { ...state, focusTarget: inputFocusTarget };

    default:
      return state;
  }
}
