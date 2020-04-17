import React from "react";
import PropTypes from "prop-types";
import style from "./Area.module.scss";

export default function Area({ children, maxHeight, maxWidth, width, height }) {
  return (
    <div className={style.back} style={{ maxHeight, maxWidth, width, height }}>
      <div className={style.area}>{children}</div>
    </div>
  );
}
Area.propTypes = {
  children: PropTypes.node,
  maxHeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};
Area.defaultProps = {
  children: null,
  maxHeight: undefined,
  maxWidth: undefined,
  width: undefined,
  height: undefined,
};
