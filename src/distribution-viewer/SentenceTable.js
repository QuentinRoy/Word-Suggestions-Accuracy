import React from "react";
import PropTypes from "prop-types";
import { table } from "./ScientificTable.module.css";
import { wordSavedPart, wordStart } from "./SentenceTable.module.css";

const SentenceTable = ({ words }) => (
  <table className={table}>
    <tbody>
      <tr>
        <th />
        {words.map((w, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <th key={i}>
            <span className={wordStart}>
              {w.word.slice(0, w.word.length - w.sks)}
            </span>
            <span className={wordSavedPart}>
              {w.word.slice(w.word.length - w.sks, w.length)}
            </span>
          </th>
        ))}
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
        {words.map((w, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <td key={i}>{(w.sks / w.word.length).toFixed(2)}</td>
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
