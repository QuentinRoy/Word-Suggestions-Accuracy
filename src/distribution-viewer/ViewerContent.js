import React from "react";
import PropTypes from "prop-types";
import SentencePlot from "./SentencePlot";
import SentenceTable from "./SentenceTable";
import {
  content,
  sentenceTable,
  valueTable,
  plot
} from "./ViewerContent.module.css";
import { table } from "./ScientificTable.module.css";

export default function ViewerContent({
  words,
  meanAccuracy,
  sdAccuracy,
  weightedAccuracy
}) {
  return (
    <div className={content}>
      <div className={sentenceTable}>
        <SentenceTable words={words} />
      </div>
      <div className={valueTable}>
        <table className={table}>
          <tbody>
            <tr>
              <th>Mean Accuracy</th>
              <th>Weighted Accuracy</th>
              <th>Standard Deviation</th>
            </tr>
            <tr>
              <td>{meanAccuracy.toFixed(2)}</td>
              <td>{weightedAccuracy.toFixed(2)}</td>
              <td>{sdAccuracy.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className={plot}>
        <SentencePlot words={words} />
      </div>
    </div>
  );
}

ViewerContent.propTypes = {
  words: PropTypes.arrayOf(PropTypes.shape()).isRequired,
  meanAccuracy: PropTypes.number.isRequired,
  weightedAccuracy: PropTypes.number.isRequired,
  sdAccuracy: PropTypes.number.isRequired
};
