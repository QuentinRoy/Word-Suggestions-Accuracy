import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import useUniqueId from "../hooks/useUniqueId";
import style from "./RadioBoxGroup.module.css";

function RadioBoxItem({ checked, name, onChange, value, children, onBlur }) {
  const id = useUniqueId();
  return (
    <label htmlFor={id} className={style.radioBoxItem}>
      <input
        onBlur={onBlur}
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />{" "}
      <div>{children}</div>
    </label>
  );
}

RadioBoxItem.propTypes = {
  onBlur: PropTypes.func,
  checked: PropTypes.bool,
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  value: PropTypes.string.isRequired,
  children: PropTypes.node,
};

RadioBoxItem.defaultProps = {
  checked: false,
  onChange: () => {},
  onBlur: () => {},
  children: null,
};

export default function RadioBoxGroup({
  onChange,
  onBlur,
  name,
  value,
  children,
  direction,
}) {
  return (
    <ul
      className={classNames(style.radioBoxGroup, {
        [style.verticalGroup]: direction === "vertical",
      })}
    >
      {React.Children.map(children, ({ props: childProps }) => (
        <li key={childProps.value}>
          <RadioBoxItem
            checked={childProps.value === value}
            name={name}
            value={childProps.value}
            onChange={onChange}
            onBlur={onBlur}
          >
            {childProps.children}
          </RadioBoxItem>
        </li>
      ))}
    </ul>
  );
}

RadioBoxGroup.propTypes = {
  children: PropTypes.node.isRequired,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  name: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  value: PropTypes.string,
  direction: PropTypes.oneOf(["vertical", "horizontal"]),
};

RadioBoxGroup.defaultProps = {
  onChange: () => {},
  onBlur: () => {},
  direction: "horizontal",
  value: null,
};