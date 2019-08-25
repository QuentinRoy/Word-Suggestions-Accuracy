import { generateTasks } from "./useConfiguration";
import fs from "fs-extra";
import path from "path";

const corpus = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./__fixtures__/test-corpus.json"))
).rows;

describe("generateTasks", () => {
  test("create the tasks as expected", () => {
    expect(generateTasks(corpus, "fileName.json")).toMatchSnapshot();
  });
});
