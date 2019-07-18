import React from "react";
import PropTypes from "prop-types";

const Crashed = ({ children }) => <div>{children}</div>;

Crashed.propTypes = {
  children: PropTypes.node
};

Crashed.defaultProps = {
  children: "Something bad happened... Please contact the experimenter."
};

export default Crashed;
