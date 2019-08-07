import React from "react";
import PropTypes from "prop-types";
import SuccessBanner from "./SuccessBanner";
import Stimulus from "./Stimulus";
import styles from "./Banner.module.css";

const Banner = ({ isCorrect, ...props }) => {
  const content = isCorrect ? (
    <SuccessBanner {...props} />
  ) : (
    <Stimulus {...props} />
  );
  return <div className={styles.banner}>{content}</div>;
};

Banner.propTypes = {
  isCorrect: PropTypes.bool.isRequired
};

export default Banner;
