/* eslint-env node */

const { parseString } = require("xml2js");
const { readFile, writeFile } = require("fs-extra");
const path = require("path");

const main = async (inputPath, outputPath) => {
  const xmlString = await readFile(inputPath, "utf8");
  const obj = await new Promise((resolve, reject) => {
    parseString(xmlString, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
  const newObj = {
    ...obj.wordlist.$,
    words: obj.wordlist.w.map(w => ({ ...w.$, word: w._ }))
  };
  await writeFile(outputPath, JSON.stringify(newObj));
};

main(
  path.join(__dirname, "./public/dictionaries_en_US_wordlist.xml"),
  path.join(__dirname, "./public/dictionaries_en_US_wordlist.json")
).catch(console.error);
