import React, { Fragment } from "react";
import PropTypes from "prop-types";
import range from "lodash/range";
import classNames from "classnames";
import style from "./NasaTlxInput.module.css";

const NasaTlxInput = ({
  name,
  title,
  description,
  value,
  onChange,
  lowLabel,
  highLabel
}) => {
  // End is excluded from range.
  const boxes = range(5, 105, 5).map(x => (
    <Fragment key={x}>
      <div className={classNames(style.sep, { [style.middle]: x === 55 })} />
      <div
        className={classNames(style.box, {
          [style.selected]: x === value
        })}
      >
        <div className={style.check} />
        <input
          className={style.input}
          type="radio"
          value={x}
          name={name}
          checked={value === x}
          onChange={evt => onChange(evt, +evt.target.value)}
        />
      </div>
      {x === 100 && <div className={style.sep} />}
    </Fragment>
  ));
  return (
    <div className={style.main}>
      <header className={style.header}>
        <h3 className={style.title}>{title}</h3>
        <p className={style.description}>{description}</p>
      </header>
      <div className={style.boxes}>{boxes}</div>
      <div className={style.labels}>
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );
};

NasaTlxInput.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  lowLabel: PropTypes.string.isRequired,
  highLabel: PropTypes.string.isRequired
};

NasaTlxInput.defaultProps = {
  value: undefined
};

export default NasaTlxInput;
