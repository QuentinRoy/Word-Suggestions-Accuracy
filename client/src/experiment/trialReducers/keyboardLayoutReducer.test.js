import { KeyboardLayoutNames, Actions } from "../../utils/constants";
import keyboardLayoutReducer from "./keyboardLayoutReducer";

describe("keyboardLayoutReducer", () => {
  test("switch to the specified layout if the current one is default", () => {
    const inputState = {
      layoutName: KeyboardLayoutNames.default,
      prop: "to keep"
    };
    const action = {
      type: Actions.toggleKeyboardLayout,
      layoutName: "mockLayout"
    };
    const outputState = {
      layoutName: "mockLayout",
      prop: "to keep"
    };
    expect(keyboardLayoutReducer(inputState, action)).toMatchObject(
      outputState
    );
  });

  test("switch to the specified layout if the current one is another layout", () => {
    const inputState = {
      layoutName: "mockLayout1",
      prop: "to keep"
    };
    const action = {
      type: Actions.toggleKeyboardLayout,
      layoutName: "mockLayout2"
    };
    const outputState = {
      layoutName: "mockLayout2",
      prop: "to keep"
    };
    expect(keyboardLayoutReducer(inputState, action)).toMatchObject(
      outputState
    );
  });

  test("switch back to the default layout if the current one is the one specified", () => {
    const inputState = {
      layoutName: "mockLayout",
      prop: "to keep"
    };
    const action = {
      type: Actions.toggleKeyboardLayout,
      layoutName: "mockLayout"
    };
    const outputState = {
      layoutName: KeyboardLayoutNames.default,
      prop: "to keep"
    };
    expect(keyboardLayoutReducer(inputState, action)).toMatchObject(
      outputState
    );
  });

  test("returns the state if the current layout, and the target layout is the default one", () => {
    const inputState = { layoutName: KeyboardLayoutNames.default };
    const action = {
      type: Actions.toggleKeyboardLayout,
      layoutName: KeyboardLayoutNames.default
    };
    expect(keyboardLayoutReducer(inputState, action)).toBe(inputState);
  });

  test("returns the state on unknown actions", () => {
    const inputState = {};
    const action = { type: "UNKNOWN_ACTION" };
    expect(keyboardLayoutReducer(inputState, action)).toBe(inputState);
  });
});
