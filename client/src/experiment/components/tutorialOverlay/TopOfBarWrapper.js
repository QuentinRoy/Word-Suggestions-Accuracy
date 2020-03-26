import React, { useContext } from "react";
import PropTypes from "prop-types";
import TutorialOverlayContext from "./TutorialOverlayContext";
import styles from "./styles/TutorialOverlay.module.scss";

const TopOfBarWrapper = ({ children }) => {
  const { suggestionsBarRect } = useContext(TutorialOverlayContext);
  return (
    <div
      className={styles.topOfBarWrapper}
      style={{
        top: suggestionsBarRect.top,
      }}
    >
      <div className={styles.topOfBarWrapperContent}>{children}</div>
    </div>
  );
};
TopOfBarWrapper.propTypes = {
  children: PropTypes.node.isRequired,
};
export default TopOfBarWrapper;
