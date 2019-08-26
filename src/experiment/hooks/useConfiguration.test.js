import fs from "fs-extra";
import path from "path";
import { generateTasks } from "./useConfiguration";

const corpus = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./__fixtures__/test-corpus.json"))
).rows;

describe("generateTasks", () => {
  test("create the tasks as expected", () => {
    expect(generateTasks(corpus, "fileName.json")).toMatchSnapshot();
  });
});
