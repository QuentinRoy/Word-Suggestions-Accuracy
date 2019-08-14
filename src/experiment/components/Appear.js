import React, { Children } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./styles/Appear.module.css";

const Appear = ({ children, currentStep }) => (
  <>
    {Children.map(children, (child, childNum) => (
      <div
        className={classNames({
          [styles.appearItem]: true,
          [styles.visible]: childNum < currentStep
        })}
      >
        {child}
      </div>
    ))}
  </>
);

Appear.propTypes = {
  children: PropTypes.node,
  currentStep: PropTypes.number.isRequired
};

Appear.defaultProps = {
  children: undefined
};

export default Appear;
