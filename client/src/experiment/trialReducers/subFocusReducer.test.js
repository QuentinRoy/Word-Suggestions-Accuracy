import subFocusReducer from "./subFocusReducer";
import { Actions, FocusTargetTypes } from "../../common/constants";

describe("subFocusReducer", () => {
  describe("on moveFocusTarget actions", () => {
    test.each`
      direction | currentFT       | suggestionNumber
      ${1}      | ${"input"}      | ${undefined}
      ${1}      | ${"suggestion"} | ${0}
      ${1}      | ${"suggestion"} | ${3}
      ${-1}     | ${"input"}      | ${undefined}
      ${-1}     | ${"suggestion"} | ${0}
      ${-1}     | ${"suggestion"} | ${3}
      ${0}      | ${"input"}      | ${undefined}
      ${0}      | ${"suggestion"} | ${0}
      ${0}      | ${"suggestion"} | ${3}
    `(
      "switches to an input focus target type if there are no suggestion targets (direction=$direction, current focusTarget's type=$currentFT, suggestion number=$suggestionNumber)",
      ({ direction, currentFT, suggestionNumber }) => {
        const initialState = {
          totalSuggestionTargets: 0,
          focusTarget: {
            type: FocusTargetTypes[currentFT],
            suggestionNumber,
          },
          foo: "bar",
        };
        const action = { type: Actions.moveFocusTarget, direction };
        const expectedState = {
          totalSuggestionTargets: 0,
          focusTarget: { type: FocusTargetTypes.input },
          foo: "bar",
        };
        expect(subFocusReducer(initialState, action)).toEqual(expectedState);
      }
    );

    test.each`
      direction | suggestionNb | expectedSuggestionNb | totalSuggestions
      ${1}      | ${0}         | ${1}                 | ${2}
      ${-1}     | ${1}         | ${0}                 | ${2}
      ${1}      | ${0}         | ${1}                 | ${3}
      ${1}      | ${1}         | ${2}                 | ${3}
      ${-1}     | ${1}         | ${0}                 | ${3}
      ${-1}     | ${2}         | ${1}                 | ${3}
      ${1}      | ${0}         | ${1}                 | ${5}
      ${1}      | ${3}         | ${4}                 | ${5}
      ${-1}     | ${1}         | ${0}                 | ${5}
      ${-1}     | ${4}         | ${3}                 | ${5}
    `(
      "switches to next or previous suggestion targets when there is one (direction=$direction, suggestion number=$suggestionNb, totalSuggestions=$totalSuggestions)",
      ({ direction, suggestionNb, expectedSuggestionNb, totalSuggestions }) => {
        const initialState = {
          totalSuggestionTargets: totalSuggestions,
          focusTarget: {
            type: FocusTargetTypes.suggestion,
            suggestionNumber: suggestionNb,
          },
          foo: "bar",
        };
        const action = {
          type: Actions.moveFocusTarget,
          direction,
        };
        const expectedState = {
          totalSuggestionTargets: totalSuggestions,
          focusTarget: {
            type: FocusTargetTypes.suggestion,
            suggestionNumber: expectedSuggestionNb,
          },
          foo: "bar",
        };
        expect(subFocusReducer(initialState, action)).toEqual(expectedState);
      }
    );

    test.each`
      direction | suggestionNb | totalSuggestions
      ${1}      | ${2}         | ${3}
      ${-1}     | ${0}         | ${3}
      ${1}      | ${4}         | ${5}
      ${-1}     | ${0}         | ${5}
    `(
      "switches to input if there is no next or previous suggestion (direction=$direction, suggestion number=$suggestionNb, totalSuggestions=$totalSuggestions)",
      ({ direction, suggestionNb, totalSuggestions }) => {
        const initialState = {
          totalSuggestionTargets: totalSuggestions,
          focusTarget: {
            type: FocusTargetTypes.suggestion,
            suggestionNumber: suggestionNb,
          },
          foo: "bar",
        };
        const action = {
          type: Actions.moveFocusTarget,
          direction,
        };
        const expectedState = {
          totalSuggestionTargets: totalSuggestions,
          focusTarget: { type: FocusTargetTypes.input },
          foo: "bar",
        };
        expect(subFocusReducer(initialState, action)).toEqual(expectedState);
      }
    );

    test.each`
      direction | totalSuggestions | expectedSuggestionNumber
      ${1}      | ${3}             | ${0}
      ${-1}     | ${3}             | ${2}
      ${1}      | ${5}             | ${0}
      ${-1}     | ${5}             | ${4}
    `(
      "from input, switches to the next or previous suggestion if there is one (direction=$direction, totalSuggestions=$totalSuggestions)",
      ({ direction, totalSuggestions, expectedSuggestionNumber }) => {
        const initialState = {
          totalSuggestionTargets: totalSuggestions,
          focusTarget: { type: FocusTargetTypes.input },
          foo: "bar",
        };
        const action = {
          type: Actions.moveFocusTarget,
          direction,
        };
        const expectedState = {
          totalSuggestionTargets: totalSuggestions,
          focusTarget: {
            type: FocusTargetTypes.suggestion,
            suggestionNumber: expectedSuggestionNumber,
          },
          foo: "bar",
        };
        expect(subFocusReducer(initialState, action)).toEqual(expectedState);
      }
    );

    test("does not change the state on any unknown state focus targets", () => {
      const initialState = {
        totalSuggestionTargets: 5,
        focusTarget: { type: "some type that does not exist" },
        foo: "bar",
      };
      const action = {
        type: Actions.moveFocusTarget,
        direction: 1,
      };
      expect(subFocusReducer(initialState, action)).toBe(initialState);
    });

    test("does not change the state if there is no current focus targets", () => {
      const initialState = {
        totalSuggestionTargets: 5,
        focusTarget: null,
        foo: "bar",
      };
      const action = {
        type: Actions.moveFocusTarget,
        direction: 1,
      };
      expect(subFocusReducer(initialState, action)).toBe(initialState);
    });
  });

  describe("on unknown actions", () => {
    test("does not change the state", () => {
      const initialState = {
        totalSuggestionTargets: 5,
        focusTarget: {
          type: FocusTargetTypes.suggestion,
          suggestionNumber: 2,
        },
        foo: "bar",
      };
      const action = { type: "some unknown type" };
      expect(subFocusReducer(initialState, action)).toBe(initialState);
    });
  });

  describe("on input suggestions actions", () => {
    test("switches the focus back to input", () => {
      const initialState = {
        totalSuggestionTargets: 5,
        focusTarget: {
          type: FocusTargetTypes.suggestion,
          suggestionNumber: 2,
        },
        foo: "bar",
      };
      const action = { type: Actions.inputSuggestion };
      const expectedState = {
        focusTarget: { type: FocusTargetTypes.input },
        totalSuggestionTargets: 5,
        foo: "bar",
      };
      expect(subFocusReducer(initialState, action)).toEqual(expectedState);
    });
  });

  describe("on window blur/focus actions", () => {
    test("remove the targetFocus on blur", () => {
      const initialState = {
        totalSuggestionTargets: 5,
        focusTarget: {
          type: FocusTargetTypes.suggestion,
          suggestionNumber: 2,
        },
        foo: "bar",
      };
      const action = { type: Actions.windowBlurred };
      const expectedState = {
        focusTarget: null,
        totalSuggestionTargets: 5,
        foo: "bar",
      };
      expect(subFocusReducer(initialState, action)).toEqual(expectedState);
    });
    test("switches the focus back to input on focus", () => {
      const initialState = {
        totalSuggestionTargets: 5,
        focusTarget: {
          type: FocusTargetTypes.suggestion,
          suggestionNumber: 2,
        },
        foo: "bar",
      };
      const action = { type: Actions.windowFocused };
      const expectedState = {
        focusTarget: { type: FocusTargetTypes.input },
        totalSuggestionTargets: 5,
        foo: "bar",
      };
      expect(subFocusReducer(initialState, action)).toEqual(expectedState);
    });
  });
});
