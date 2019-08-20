import React, { createContext, useContext } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import classes from "./styles/Appear.module.css";

const AppearContext = createContext();

const Appear = ({ children, currentStep }) => {
  let previousFragmentNum = -1;
  return (
    <AppearContext.Provider
      value={{
        currentStep,
        getFragmentNum: () => {
          previousFragmentNum += 1;
          return previousFragmentNum;
        }
      }}
    >
      {children}
    </AppearContext.Provider>
  );
};

Appear.propTypes = {
  children: PropTypes.node,
  currentStep: PropTypes.number.isRequired
};

Appear.defaultProps = {
  children: undefined
};

const AppearFragment = ({ children, num: numProp, component: Component }) => {
  const { currentStep, getFragmentNum } = useContext(AppearContext);
  const num = numProp == null ? getFragmentNum() : numProp;
  return (
    <Component
      className={classNames(classes.appearItem, {
        [classes.visible]: num < currentStep
      })}
    >
      {children}
    </Component>
  );
};

AppearFragment.propTypes = {
  children: PropTypes.node,
  num: PropTypes.node,
  component: PropTypes.elementType
};

AppearFragment.defaultProps = {
  children: null,
  num: null,
  component: "div"
};

Appear.Fragment = AppearFragment;

export default Appear;
