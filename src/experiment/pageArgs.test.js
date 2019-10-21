import { sortBy } from "lodash";
import {
  parseExtraConditionsArg,
  getPageArgs,
  checkPageArgs,
  getAllPossibleConditions
} from "./pageArgs";

describe("parseExtraConditionsArg", () => {
  test("it parses the extras querystring argument", () => {
    const { keyStrokeDelay, targetAccuracy } = parseExtraConditionsArg(
      "200-0.5"
    );
    expect(keyStrokeDelay).toEqual(200);
    expect(targetAccuracy).toBeCloseTo(0.5);
  });
});

describe("getPageArgs", () => {
  test("can parse querystring when all arguments are provided", () => {
    // FIXME: the to equal test may fail as it contains float.
    expect(
      getPageArgs(
        "https://example.com" +
          "?wave=test" +
          "&suggestionsType=FOO" +
          "&keyStrokeDelays=100,200" +
          "&targetAccuracies=0.1,0.2,0.4" +
          "&extraConditions=150-0.3,120-0.1" +
          "&workerId=test" +
          "&hitId=HIT" +
          "&assignmentId=ASSIGNMENT" +
          "&extraneousArgument=SHOULD_NOT_BE_HERE"
      )
    ).toEqual({
      wave: "test",
      suggestionsType: "FOO",
      keyStrokeDelays: [100, 200],
      targetAccuracies: [0.1, 0.2, 0.4],
      extraConditions: [
        { keyStrokeDelay: 150, targetAccuracy: 0.3 },
        { keyStrokeDelay: 120, targetAccuracy: 0.1 }
      ],
      participant: "test",
      hitId: "HIT",
      assignmentId: "ASSIGNMENT"
    });
  });
  test("can parse querystring when arguments are missing", () => {
    expect(getPageArgs("https://example.com")).toEqual({
      wave: null,
      suggestionsType: null,
      keyStrokeDelays: null,
      targetAccuracies: null,
      extraConditions: null,
      participant: null,
      hitId: null,
      assignmentId: null
    });
  });
});

describe("checkPageArgs", () => {
  test("returns true if everything is provided", () => {
    expect(
      checkPageArgs({
        keyStrokeDelays: [100],
        targetAccuracies: [0.1],
        extraConditions: [{ keyStrokeDelay: 150, targetAccuracy: 0.3 }],
        participant: "mock-participant",
        wave: "mock-wave",
        suggestionsType: "BAR"
      })
    ).toBe(true);
  });

  test("returns true if only extraConditions is missing", () => {
    expect(
      checkPageArgs({
        keyStrokeDelays: [100],
        targetAccuracies: [0.1],
        participant: "mock-participant",
        wave: "mock-wave",
        suggestionsType: "BAR"
      })
    ).toBe(true);
  });

  test("returns true if only keyStrokeDelays and targetAccuracies are missing", () => {
    expect(
      checkPageArgs({
        extraConditions: [{ keyStrokeDelay: 150, targetAccuracy: 0.3 }],
        participant: "mock-participant",
        wave: "mock-wave",
        suggestionsType: "BAR"
      })
    ).toBe(true);
  });

  test("returns false if keyStrokeDelays is provided but not targetAccuracies, regardless of extraConditions", () => {
    // With extraConditions.
    expect(
      checkPageArgs({
        keyStrokeDelays: [100],
        extraConditions: [{ keyStrokeDelay: 150, targetAccuracy: 0.3 }],
        participant: "mock-participant",
        wave: "mock-wave",
        suggestionsType: "BAR"
      })
    ).toBe(false);
    // Without extraConditions.
    expect(
      checkPageArgs({
        keyStrokeDelays: [100],
        participant: "mock-participant",
        wave: "mock-wave",
        suggestionsType: "BAR"
      })
    ).toBe(false);
  });

  test("returns false if targetAccuracies is provided but not keyStrokeDelays, regardless of extraConditions", () => {
    // With extraConditions.
    expect(
      checkPageArgs({
        targetAccuracies: [0.4],
        extraConditions: [{ keyStrokeDelay: 150, targetAccuracy: 0.3 }],
        participant: "mock-participant",
        wave: "mock-wave",
        suggestionsType: "BAR"
      })
    ).toBe(false);
    // Without extraConditions.
    expect(
      checkPageArgs({
        targetAccuracies: [0.4],
        participant: "mock-participant",
        wave: "mock-wave",
        suggestionsType: "BAR"
      })
    ).toBe(false);
  });

  test("returns false if suggestionsType is not a known type, or missing", () => {
    expect(
      checkPageArgs({
        keyStrokeDelays: [100],
        targetAccuracies: [0.1],
        extraConditions: [{ keyStrokeDelay: 150, targetAccuracy: 0.3 }],
        participant: "mock-participant",
        wave: "mock-wave",
        suggestionsType: "UNKNOWN"
      })
    ).toBe(false);
    expect(
      checkPageArgs({
        keyStrokeDelays: [100],
        targetAccuracies: [0.1],
        extraConditions: [{ keyStrokeDelay: 150, targetAccuracy: 0.3 }],
        participant: "mock-participant",
        wave: "mock-wave"
      })
    ).toBe(false);
  });

  test("returns false if wave is missing", () => {
    expect(
      checkPageArgs({
        keyStrokeDelays: [100],
        targetAccuracies: [0.1],
        extraConditions: [{ keyStrokeDelay: 150, targetAccuracy: 0.3 }],
        participant: "mock-participant",
        suggestionsType: "BAR"
      })
    ).toBe(false);
  });

  test("returns false if everything participant is missing", () => {
    expect(
      checkPageArgs({
        keyStrokeDelays: [100],
        targetAccuracies: [0.1],
        extraConditions: [{ keyStrokeDelay: 150, targetAccuracy: 0.3 }],
        wave: "mock-wave",
        suggestionsType: "BAR"
      })
    ).toBe(false);
  });
});

describe("getAllPossibleConditions", () => {
  const sortConditions = conditions =>
    sortBy(conditions, ["keyStrokeDelay", "targetAccuracy"]);

  test("get all possible conditions from keyStrokeDelays, targetAccuracies and extraConditions", () => {
    const all = getAllPossibleConditions({
      targetAccuracies: [0.1, 0.5, 0.7],
      keyStrokeDelays: [100, 200, 300],
      extraConditions: [
        { keyStrokeDelay: 150, targetAccuracy: 0.7 },
        { keyStrokeDelay: 200, targetAccuracy: 0.9 }
      ]
    });
    const expected = [
      // These two come from extra.
      { keyStrokeDelay: 150, targetAccuracy: 0.7 },
      { keyStrokeDelay: 200, targetAccuracy: 0.9 },
      // These comes from the combinations of target accuracies and keystroke
      // delays.
      { keyStrokeDelay: 100, targetAccuracy: 0.1 },
      { keyStrokeDelay: 200, targetAccuracy: 0.1 },
      { keyStrokeDelay: 300, targetAccuracy: 0.1 },
      { keyStrokeDelay: 200, targetAccuracy: 0.5 },
      { keyStrokeDelay: 300, targetAccuracy: 0.5 },
      { keyStrokeDelay: 100, targetAccuracy: 0.5 },
      { keyStrokeDelay: 100, targetAccuracy: 0.7 },
      { keyStrokeDelay: 200, targetAccuracy: 0.7 },
      { keyStrokeDelay: 300, targetAccuracy: 0.7 }
    ];
    expect(sortConditions(all)).toEqual(sortConditions(expected));
  });

  test("avoids duplicate", () => {
    const all = getAllPossibleConditions({
      targetAccuracies: [0.1, 0.5, 0.7],
      keyStrokeDelays: [100, 200, 300],
      extraConditions: [
        { keyStrokeDelay: 150, targetAccuracy: 0.7 },
        { keyStrokeDelay: 200, targetAccuracy: 0.9 },
        // The two below would create duplicate
        { keyStrokeDelay: 100, targetAccuracy: 0.5 },
        { keyStrokeDelay: 300, targetAccuracy: 0.7 }
      ]
    });
    const expected = [
      { keyStrokeDelay: 150, targetAccuracy: 0.7 },
      { keyStrokeDelay: 200, targetAccuracy: 0.9 },
      { keyStrokeDelay: 100, targetAccuracy: 0.1 },
      { keyStrokeDelay: 200, targetAccuracy: 0.1 },
      { keyStrokeDelay: 300, targetAccuracy: 0.1 },
      { keyStrokeDelay: 200, targetAccuracy: 0.5 },
      { keyStrokeDelay: 300, targetAccuracy: 0.5 },
      { keyStrokeDelay: 100, targetAccuracy: 0.5 },
      { keyStrokeDelay: 100, targetAccuracy: 0.7 },
      { keyStrokeDelay: 200, targetAccuracy: 0.7 },
      { keyStrokeDelay: 300, targetAccuracy: 0.7 }
    ];
    expect(sortConditions(all)).toEqual(sortConditions(expected));
  });

  test("works if extra is empty", () => {
    const all = getAllPossibleConditions({
      targetAccuracies: [0.1, 0.5, 0.7],
      keyStrokeDelays: [100, 200, 300],
      extraConditions: []
    });
    const expected = [
      { keyStrokeDelay: 100, targetAccuracy: 0.1 },
      { keyStrokeDelay: 200, targetAccuracy: 0.1 },
      { keyStrokeDelay: 300, targetAccuracy: 0.1 },
      { keyStrokeDelay: 200, targetAccuracy: 0.5 },
      { keyStrokeDelay: 300, targetAccuracy: 0.5 },
      { keyStrokeDelay: 100, targetAccuracy: 0.5 },
      { keyStrokeDelay: 100, targetAccuracy: 0.7 },
      { keyStrokeDelay: 200, targetAccuracy: 0.7 },
      { keyStrokeDelay: 300, targetAccuracy: 0.7 }
    ];
    expect(sortConditions(all)).toEqual(sortConditions(expected));
  });

  test("works if both targetAccuracies and keyStrokeDelays are empty", () => {
    const all = getAllPossibleConditions({
      targetAccuracies: [],
      keyStrokeDelays: [],
      extraConditions: [
        { keyStrokeDelay: 150, targetAccuracy: 0.7 },
        { keyStrokeDelay: 200, targetAccuracy: 0.9 },
        { keyStrokeDelay: 100, targetAccuracy: 0.5 },
        { keyStrokeDelay: 300, targetAccuracy: 0.7 }
      ]
    });
    const expected = [
      { keyStrokeDelay: 150, targetAccuracy: 0.7 },
      { keyStrokeDelay: 200, targetAccuracy: 0.9 },
      { keyStrokeDelay: 100, targetAccuracy: 0.5 },
      { keyStrokeDelay: 300, targetAccuracy: 0.7 }
    ];
    expect(sortConditions(all)).toEqual(sortConditions(expected));
  });

  // getAllPossibleConditions should works even if any of extra,
  // targetAccuracies or keyStrokeDelays are empty, or if they all are.
  // I did not write all test since most should never happen in the current
  // code base.
});
