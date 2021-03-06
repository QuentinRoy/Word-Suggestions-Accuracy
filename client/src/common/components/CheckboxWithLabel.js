import React from "react";
import PropTypes from "prop-types";
import style from "./CheckboxWithLabel.module.css";
import useUniqueId from "../hooks/useUniqueId";

export default function CheckboxWithLabel({
  onChange,
  onBlur,
  name,
  value,
  children,
}) {
  const id = useUniqueId();
  return (
    <label htmlFor={id} className={style.checkboxWithLabel}>
      <input
        onBlur={onBlur}
        id={id}
        type="checkbox"
        name={name}
        checked={value}
        onChange={onChange}
      />{" "}
      <div>{children}</div>
    </label>
  );
}

CheckboxWithLabel.propTypes = {
  onBlur: PropTypes.func,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  value: PropTypes.bool,
  children: PropTypes.node,
};

CheckboxWithLabel.defaultProps = {
  onChange: () => {},
  onBlur: () => {},
  children: null,
  value: false,
};
