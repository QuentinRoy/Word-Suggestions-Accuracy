import React, { Fragment, Children } from "react";
import PropTypes from "prop-types";
import styles from "./styles/Appear.module.css";

const Appear = ({ children, currentStep }) => (
  <Fragment>
    {Children.map(children, (child, childNum) => (
      <div>
        <div
          className={childNum < currentStep ? styles.visible : styles.hidden}
        >
          {child}
        </div>
        <br />
      </div>
    ))}
  </Fragment>
);

Appear.propTypes = {
  children: PropTypes.node,
  currentStep: PropTypes.number.isRequired
};

Appear.defaultProps = {
  children: undefined
};

export default Appear;
