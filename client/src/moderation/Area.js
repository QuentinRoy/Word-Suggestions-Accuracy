import React from "react";
import PropTypes from "prop-types";
import style from "./Area.module.scss";

export default function Area({ children, maxHeight }) {
  return (
    <div className={style.back} style={{ maxHeight }}>
      <div className={style.area}>{children}</div>
    </div>
  );
}
Area.propTypes = {
  children: PropTypes.node,
  maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
Area.defaultProps = { children: null, maxHeight: undefined };
