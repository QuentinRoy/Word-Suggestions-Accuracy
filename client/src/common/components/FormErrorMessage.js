import React from "react";
import PropTypes from "prop-types";
import style from "./FormErrorMessage.module.scss";

export default function FormErrorMessage({ children }) {
  return <span className={style.error}>{children}</span>;
}
FormErrorMessage.propTypes = { children: PropTypes.node };
FormErrorMessage.defaultProps = { children: undefined };
