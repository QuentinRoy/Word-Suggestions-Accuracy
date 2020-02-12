import { parse } from "papaparse";

export default function fetchDictionary(path) {
  return new Promise((resolve, reject) => {
    parse(path, {
      download: true,
      header: true,
      skipEmptyLines: "greedy",
      transform(value, columnName) {
        switch (columnName) {
          case "f":
            return +value; // Convert f to a number
          default:
            return value;
        }
      },
      complete(results) {
        resolve(results.data);
      },
      error(error) {
        reject(error);
      }
    });
  });
}
