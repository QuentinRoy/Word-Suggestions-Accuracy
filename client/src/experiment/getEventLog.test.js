import getEventLog from "./getEventLog";
import { FocusTargetTypes, Actions } from "../utils/constants";

describe("getEventLog", () => {
  const GlobalDate = global.Date;
  let mockDateType;
  beforeEach(() => {
    mockDateType = Symbol("mock-date");
    global.Date = jest.fn(function MockDate() {
      this.type = mockDateType;
    });
  });
  afterEach(() => {
    global.Date = GlobalDate;
  });

  test("creates an event log for a correct input", () => {
    const oldState = {
      input: "hello "
    };
    const newState = {
      focusTarget: { type: FocusTargetTypes.suggestion, suggestionNumber: 5 },
      input: "hello there ",
      suggestions: ["s1", "s2", "s3"]
    };
    const action = { type: Actions.inputSuggestion, word: "there " };
    const sksDistribution = [{ word: "hello " }, { word: "there " }];
    const actionStartTime = new Date();
    expect(
      getEventLog(
        oldState,
        action,
        newState,
        { sksDistribution },
        actionStartTime
      )
    ).toEqual({
      addedInput: "there ",
      diffRemainingKeyStrokes: -6,
      focusTarget: `${FocusTargetTypes.suggestion}-5`,
      input: "hello there ",
      isError: false,
      isInputCorrect: true,
      isTargetCompleted: true,
      remainingKeyStrokes: 0,
      removedInput: "",
      suggestion0: "s1",
      suggestion1: "s2",
      suggestion2: "s3",
      totalCorrectCharacters: 12,
      totalIncorrectCharacters: 0,
      type: Actions.inputSuggestion,
      usedSuggestion: "there ",
      actionStartTime,
      time: { type: mockDateType }
    });
  });

  test("creates an event log for a incorrect input", () => {
    const oldState = {
      input: "hello "
    };
    const newState = {
      focusTarget: { type: "INPUT" },
      input: "hello m",
      suggestions: ["s1", "s2", "s3"]
    };
    const action = { type: "ACTION_TYPE" };
    const sksDistribution = [{ word: "hello " }, { word: "there " }];
    const actionStartTime = new Date();
    expect(
      getEventLog(
        oldState,
        action,
        newState,
        { sksDistribution },
        actionStartTime
      )
    ).toEqual({
      addedInput: "m",
      diffRemainingKeyStrokes: 1,
      focusTarget: "INPUT",
      input: "hello m",
      isError: true,
      isInputCorrect: false,
      isTargetCompleted: false,
      remainingKeyStrokes: 7,
      removedInput: "",
      suggestion0: "s1",
      suggestion1: "s2",
      suggestion2: "s3",
      totalCorrectCharacters: 6,
      totalIncorrectCharacters: 1,
      type: "ACTION_TYPE",
      actionStartTime,
      time: { type: mockDateType }
    });
  });

  test("creates an event log when input is removed", () => {
    const oldState = {
      input: "hella"
    };
    const newState = {
      focusTarget: { type: "INPUT" },
      input: "hell",
      suggestions: ["bla"]
    };
    const action = { type: "ACTION_TYPE" };
    const sksDistribution = [{ word: "hello " }, { word: "there " }];
    const actionStartTime = new Date();
    expect(
      getEventLog(
        oldState,
        action,
        newState,
        { sksDistribution },
        actionStartTime
      )
    ).toEqual({
      addedInput: "",
      diffRemainingKeyStrokes: -1,
      focusTarget: "INPUT",
      input: "hell",
      isError: false,
      isInputCorrect: true,
      isTargetCompleted: false,
      remainingKeyStrokes: 8,
      removedInput: "a",
      suggestion0: "bla",
      totalCorrectCharacters: 4,
      totalIncorrectCharacters: 0,
      type: "ACTION_TYPE",
      actionStartTime,
      time: { type: mockDateType }
    });
  });

  test("log scheduled actions", () => {
    const oldState = {
      input: "hella my"
    };
    const newState = {
      focusTarget: { type: "INPUT" },
      input: "hella my",
      suggestions: []
    };
    const action = {
      type: Actions.scheduleAction,
      action: { type: "MOCK_ACTION" }
    };
    const sksDistribution = [{ word: "hello " }, { word: "there " }];
    const actionStartTime = new Date();
    expect(
      getEventLog(
        oldState,
        action,
        newState,
        { sksDistribution },
        actionStartTime
      )
    ).toEqual({
      addedInput: "",
      diffRemainingKeyStrokes: -0,
      focusTarget: "INPUT",
      input: "hella my",
      isError: false,
      isInputCorrect: false,
      isTargetCompleted: false,
      scheduledAction: "MOCK_ACTION",
      remainingKeyStrokes: 12,
      removedInput: "",
      totalCorrectCharacters: 4,
      totalIncorrectCharacters: 4,
      type: Actions.scheduleAction,
      actionStartTime,
      time: { type: mockDateType }
    });
  });
});
