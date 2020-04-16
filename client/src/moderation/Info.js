import React from "react";
import PropTypes from "prop-types";
import style from "./Info.module.scss";

export default function Info({ children }) {
  return <span className={style.info}>{children}</span>;
}
Info.propTypes = { children: PropTypes.node };
Info.defaultProps = { children: null };
