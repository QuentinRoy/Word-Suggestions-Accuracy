import fs from "fs-extra";
import path from "path";
import { generateTasks } from "./useConfiguration";

const testCorpusPath = path.join(__dirname, "./__fixtures__/test-corpus.json");

describe("generateTasks", () => {
  test("create the tasks as expected", async () => {
    const corpus = JSON.parse(await fs.readFile(testCorpusPath)).rows;
    expect(generateTasks(corpus, "fileName.json")).toMatchSnapshot();
  });
});
