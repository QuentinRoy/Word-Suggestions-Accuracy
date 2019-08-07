import React from "react";
import styles from "./SuccessBanner.module.css";

const SuccessBanner = () => (
  <div className={styles.successBanner}>
    <div className={styles.content}>
      <h3>Success! Press enter to continue.</h3>
    </div>
  </div>
);

export default SuccessBanner;
