import React from "react";
import PropTypes from "prop-types";
import { table } from "./SentenceTable.module.css";

const SentenceTable = ({ words }) => (
  <table className={table}>
    <tbody>
      <tr>
        {words.map((w, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <th key={i}>{w.word}</th>
        ))}
      </tr>
      <tr>
        {words.map((w, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <td key={i}>{w.normalizedSks}</td>
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
