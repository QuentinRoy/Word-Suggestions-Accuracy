import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import SentencePlot from "./SentencePlot";
import SentenceTable from "./SentenceTable";
import {
  content,
  sentenceTable,
  valueTable,
  plot,
  big
} from "./ViewerContent.module.css";
import { table } from "./ScientificTable.module.css";

export default function ViewerContent({
  words,

  targetAccuracy,
  targetSd,
  maxDiffAccuracy,
  maxDiffSd,
  meanWordsKss,
  sdWordKss,
  totalKss
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
              <th>Total KSS</th>
              <th>Mean Word KSS</th>
              <th>SD Word KSS</th>
            </tr>
            <tr>
              <td
                className={classNames({
                  [big]: Math.abs(totalKss - targetAccuracy) > maxDiffAccuracy
                })}
              >
                {totalKss.toFixed(4)}
              </td>
              <td
                className={classNames({
                  [big]:
                    Math.abs(meanWordsKss - targetAccuracy) > maxDiffAccuracy
                })}
              >
                {meanWordsKss.toFixed(4)}
              </td>
              <td
                className={classNames({
                  [big]: Math.abs(sdWordKss - targetSd) > maxDiffSd
                })}
              >
                {sdWordKss.toFixed(4)}
              </td>
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
  totalKss: PropTypes.number.isRequired,
  meanWordsKss: PropTypes.number.isRequired,
  sdWordKss: PropTypes.number.isRequired,
  maxDiffAccuracy: PropTypes.number.isRequired,
  maxDiffSd: PropTypes.number.isRequired,
  targetAccuracy: PropTypes.number.isRequired,
  targetSd: PropTypes.number.isRequired
};
