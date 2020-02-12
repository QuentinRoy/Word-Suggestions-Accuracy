import React from "react";
import PropTypes from "prop-types";
import { table } from "./ScientificTable.module.css";
import { wordSavedPart, wordStart } from "./SentenceTable.module.css";
import { getSaving } from "./getWordAccuracies";

const SentenceTable = ({ words }) => (
  <table className={table}>
    <tbody>
      <tr>
        <th> </th>
        {words.map(({ word: rawWord, sks }, i) => {
          const word = rawWord.replace(" ", "␣");
          return (
            // eslint-disable-next-line react/no-array-index-key
            <th key={i}>
              <span className={wordStart}>
                {word.slice(0, word.length - sks)}
              </span>
              <span className={wordSavedPart}>
                {word.slice(word.length - sks, word.length)}
              </span>
            </th>
          );
        })}
      </tr>
      <tr>
        <th>Saved Key Strokes</th>
        {words.map((w, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <td key={i}>{w.sks}</td>
        ))}
      </tr>
      <tr>
        <th>Accuracy</th>
        {words.map(w => (
          <td key={w.word}>{getSaving(w.word, w.sks).toFixed(2)}</td>
        ))}
      </tr>
    </tbody>
  </table>
);

SentenceTable.propTypes = {
  words: PropTypes.arrayOf(
    PropTypes.shape({ word: PropTypes.string, normalizedSks: PropTypes.number })
  ).isRequired
};

export default SentenceTable;
