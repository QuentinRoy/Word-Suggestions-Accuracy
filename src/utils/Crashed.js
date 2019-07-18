import React from "react";
import PropTypes from "prop-types";
import { main } from "./Crashed.module.css";

const Crashed = ({ children }) => (
  <div className={main}>
    <div>{children}</div>
  </div>
);

Crashed.propTypes = {
  children: PropTypes.node
};

Crashed.defaultProps = {
  children: "Something bad happened... Please contact the experimenter."
};

export default Crashed;
