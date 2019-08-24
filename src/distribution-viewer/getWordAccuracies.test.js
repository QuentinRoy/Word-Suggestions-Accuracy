import {
  getBranchTotalKeyStrokeSaving,
  getBranchResult,
  getSaving
} from "./getWordAccuracies";

describe("getBranchTotalKeyStrokeSaving", () => {
  test("returns 1 if all key stroke has been saved", () => {
    expect(
      getBranchTotalKeyStrokeSaving([
        { word: "hello ", sks: 6 },
        { word: "there ", sks: 6 },
        { word: "general ", sks: 8 },
        { word: "Kenobi ", sks: 7 }
      ])
    ).toBe(1);
  });
  test("returns 0 if no key stroke has been saved", () => {
    expect(
      getBranchTotalKeyStrokeSaving([
        { word: "hello ", sks: 0 },
        { word: "there ", sks: 0 },
        { word: "general ", sks: 0 },
        { word: "Kenobi ", sks: 0 }
      ])
    ).toBe(0);
  });
  test("returns the right result in other conditions", () => {
    expect(
      getBranchTotalKeyStrokeSaving([
        { word: "hello ", sks: 3 },
        { word: "there ", sks: 3 },
        { word: "general ", sks: 4 }
      ])
    ).toBeCloseTo(0.5, 8);
    expect(
      getBranchTotalKeyStrokeSaving([
        { word: "hello ", sks: 2 },
        { word: "there ", sks: 1 },
        { word: "general ", sks: 4 },
        { word: "Kenobi ", sks: 3 }
      ])
    ).toBeCloseTo(0.37037037037037035, 8);
    expect(
      getBranchTotalKeyStrokeSaving([
        { word: "Don't ", sks: 0 },
        { word: "judge ", sks: 6 },
        { word: "a ", sks: 2 },
        { word: "book ", sks: 5 }
      ])
    ).toBeCloseTo(0.6842105263157895, 8);
  });
});

describe("getSaving", () => {
  test("returns the saving of a couple word/sks", () => {
    expect(getSaving("hello ", 6)).toBeCloseTo(1, 8);
    expect(getSaving("hello ", 0)).toBeCloseTo(0, 8);
    expect(getSaving("hello ", 3)).toBeCloseTo(0.5, 8);
    expect(getSaving("hello ", 1)).toBeCloseTo(1 / 6, 8);
  });
});

describe("getBranchResult", () => {
  test("returns the correct result", () => {
    expect(
      getBranchResult(
        [
          { word: "hello ", sks: 2 },
          { word: "there ", sks: 1 },
          { word: "general ", sks: 4 },
          { word: "Kenobi ", sks: 3 }
        ],
        {
          targetKss: 0.4,
          targetSdWordKss: 0.1,
          maxDiffKss: 0.2,
          maxDiffSdWordKss: 0.2
        }
      )
    ).toMatchInlineSnapshot(`
      Object {
        "diffSdWordKss": 0.02485819621073232,
        "diffTotalKss": 0.029629629629629672,
        "diffWordMeanKss": 0.04285714285714287,
        "meanWordsKss": 0.35714285714285715,
        "score": 0.027243912920180996,
        "sdWordKss": 0.12485819621073233,
        "totalKss": 0.37037037037037035,
      }
    `);
  });

  expect(
    getBranchResult(
      [
        { word: "hello ", sks: 2 },
        { word: "there ", sks: 1 },
        { word: "general ", sks: 4 },
        { word: "Kenobi ", sks: 3 }
      ],
      {
        targetKss: 0.2,
        targetSdWordKss: 0.1,
        maxDiffKss: 0.2,
        maxDiffSdWordKss: 0.2
      }
    )
  ).toMatchInlineSnapshot(`
    Object {
      "diffSdWordKss": 0.02485819621073232,
      "diffTotalKss": 0.17037037037037034,
      "diffWordMeanKss": 0.15714285714285714,
      "meanWordsKss": 0.35714285714285715,
      "score": 0.09761428329055133,
      "sdWordKss": 0.12485819621073233,
      "totalKss": 0.37037037037037035,
    }
  `);

  expect(
    getBranchResult(
      [
        { word: "hello ", sks: 2 },
        { word: "there ", sks: 1 },
        { word: "general ", sks: 4 },
        { word: "Kenobi ", sks: 3 }
      ],
      {
        targetKss: 0.2,
        targetSdWordKss: 0.2,
        maxDiffKss: 0.2,
        maxDiffSdWordKss: 0.2
      }
    )
  ).toMatchInlineSnapshot(`
    Object {
      "diffSdWordKss": 0.07514180378926769,
      "diffTotalKss": 0.17037037037037034,
      "diffWordMeanKss": 0.15714285714285714,
      "meanWordsKss": 0.35714285714285715,
      "score": 0.12275608707981901,
      "sdWordKss": 0.12485819621073233,
      "totalKss": 0.37037037037037035,
    }
  `);

  expect(
    getBranchResult(
      [
        { word: "hello ", sks: 2 },
        { word: "there ", sks: 1 },
        { word: "general ", sks: 4 },
        { word: "Kenobi ", sks: 3 }
      ],
      {
        targetKss: 0.2,
        targetSdWordKss: 0.2,
        maxDiffKss: 0.05,
        maxDiffSdWordKss: 0.2
      }
    )
  ).toMatchInlineSnapshot(`
    Object {
      "diffSdWordKss": 0.07514180378926769,
      "diffTotalKss": 0.17037037037037034,
      "diffWordMeanKss": 0.15714285714285714,
      "meanWordsKss": 0.35714285714285715,
      "score": 122.75608707981901,
      "sdWordKss": 0.12485819621073233,
      "totalKss": 0.37037037037037035,
    }
  `);

  expect(
    getBranchResult(
      [
        { word: "hello ", sks: 2 },
        { word: "there ", sks: 1 },
        { word: "general ", sks: 4 },
        { word: "Kenobi ", sks: 3 }
      ],
      {
        targetKss: 0.2,
        targetSdWordKss: 0.2,
        maxDiffKss: 0.05,
        maxDiffSdWordKss: 0.05
      }
    )
  ).toMatchInlineSnapshot(`
    Object {
      "diffSdWordKss": 0.07514180378926769,
      "diffTotalKss": 0.17037037037037034,
      "diffWordMeanKss": 0.15714285714285714,
      "meanWordsKss": 0.35714285714285715,
      "score": 12275.6087079819,
      "sdWordKss": 0.12485819621073233,
      "totalKss": 0.37037037037037035,
    }
  `);
});
