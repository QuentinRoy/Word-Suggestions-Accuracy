import React from "react";
import PropTypes from "prop-types";
import { main } from "./Loading.module.css";

const Loading = ({ children }) => (
  <div className={main}>
    <div>{children}</div>
  </div>
);

Loading.propTypes = {
  children: PropTypes.node
};

Loading.defaultProps = {
  children: "Loading..."
};

export default Loading;
