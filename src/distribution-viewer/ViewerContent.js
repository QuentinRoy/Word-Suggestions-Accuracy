import React from "react";
import PropTypes from "prop-types";
import SentencePlot from "./SentencePlot";
import SentenceTable from "./SentenceTable";
import { content } from "./ViewerContent.module.css";

export default function ViewerContent({ words }) {
  return (
    <div className={content}>
      <SentenceTable words={words} />
      <SentencePlot words={words} />
    </div>
  );
}

ViewerContent.propTypes = {
  words: PropTypes.arrayOf(PropTypes.shape()).isRequired
};
