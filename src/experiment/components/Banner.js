import React from "react";
import PropTypes from "prop-types";
import SuccessBanner from "./SuccessBanner";
import Stimulus from "./Stimulus";
import styles from "./styles/Banner.module.css";

const Banner = ({ isCompleted, ...props }) => {
  const content = isCompleted ? (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <SuccessBanner {...props} />
  ) : (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <Stimulus {...props} />
  );
  return <div className={styles.banner}>{content}</div>;
};

Banner.propTypes = {
  isCompleted: PropTypes.bool.isRequired
};

export default Banner;
