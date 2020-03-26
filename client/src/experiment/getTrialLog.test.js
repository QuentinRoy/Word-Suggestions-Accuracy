import getTrialLog from "./getTrialLog";
import { Actions } from "../common/constants";

jest.mock("../common/utils/getTimeZone", () => jest.fn(() => "mock time zone"));

describe("getTrialLog", () => {
  const gitSHA = process.env.REACT_APP_GIT_SHA;
  const version = process.env.REACT_APP_VERSION;

  beforeEach(() => {
    process.env.REACT_APP_GIT_SHA = "mock git sha";
    process.env.REACT_APP_VERSION = "mock version";
  });

  afterEach(() => {
    process.env.REACT_APP_GIT_SHA = gitSHA;
    process.env.REACT_APP_VERSION = version;
  });

  test("produces the log of a trial", () => {
    const sksDistribution = [
      { word: "hello ", sks: 5 },
      { word: "there ", sks: 4 },
    ];
    const events = [
      { type: Actions.inputChar, isError: true },
      { type: Actions.deleteChar, isError: false },
      {
        type: Actions.inputSuggestion,
        isError: false,
        diffRemainingKeyStrokes: -5,
      },
      { type: Actions.inputChar, isError: false },
      {
        type: Actions.inputSuggestion,
        isError: true,
        diffRemainingKeyStrokes: 2,
      },
      { type: Actions.deleteChar, isError: false },
      { type: Actions.deleteChar, isError: false },
      { type: Actions.inputChar, isError: false },
      {
        type: Actions.inputSuggestion,
        isError: false,
        diffRemainingKeyStrokes: -4,
      },
    ];
    expect(
      getTrialLog(
        events,
        "mock-trial-id",
        0.2,
        200,
        0.21,
        0.2,
        sksDistribution,
        0,
        10
      )
    ).toEqual({
      actualSks: 7,
      duration: 10,
      endDate: 10,
      gitSha: "mock git sha",
      id: "mock-trial-id",
      keyStrokeDelay: 200,
      sdWordsKss: 0.2,
      sentence: "hello there ",
      sentenceWordsAndSks: "hello {5} there {4}",
      startDate: 0,
      targetAccuracy: 0.2,
      theoreticalSks: 9,
      timeZone: "mock time zone",
      totalKeyStrokeErrors: 1,
      totalKeyStrokes: 6,
      totalKss: 0.21,
      totalSuggestionErrors: 1,
      totalSuggestionUsed: 3,
      version: "mock version",
    });
  });
});
