import React from "react";
import PropTypes from "prop-types";
import styles from "./styles/TutorialOverlay.module.scss";

const Info = ({ children, top, left, width, height, style }) => (
  <div className={styles.info} style={{ top, left, width, height, ...style }}>
    <div className={styles.box}>{children}</div>
  </div>
);

Info.propTypes = {
  children: PropTypes.node.isRequired,
  top: PropTypes.number,
  left: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  style: PropTypes.object
};
Info.defaultProps = {
  top: undefined,
  left: undefined,
  width: undefined,
  height: undefined,
  style: {}
};

export default Info;
