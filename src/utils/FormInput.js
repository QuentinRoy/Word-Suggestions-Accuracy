import React from "react";
import Proptypes from "prop-types";

const FormInput = ({
  inputType,
  value,
  name,
  rows,
  cols,
  label,
  answers,
  method,
  typeOfAnswer
}) => {
  switch (inputType) {
    case "textarea":
      return (
        <textarea
          name={name}
          rows={`${rows}`}
          cols={`${cols}`}
          className="grid-item"
        />
      );
    case "radioButton":
      if (answers.length > 1) {
        return answers.map(answer => {
          return (
            <div>
              <input
                type="radio"
                value={answer}
                name={name}
                className="grid-item"
              />{" "}
              <span>{answer}</span>
            </div>
          );
        });
      }
      return (
        <div>
          <input
            type="radio"
            value={answers}
            name={name}
            className="grid-item"
          />{" "}
          <span>{answers}</span>
        </div>
      );
    case "standardInput":
      return (
        <input
          type={typeOfAnswer}
          value={value}
          name={name}
          onChange={e => method(e.target.value)}
          className="grid-item"
        />
      );
    case "button":
      return (
        <button
          type="button"
          value={value}
          name={name}
          onClick={method}
          className="grid-item"
        >
          {label}
        </button>
      );
    case "submitButton":
      return <input type="submit" value={value} className="grid-item" />;
    case "selectInput":
      return (
        <select name={name} size={1} className="grid-item">
          {answers.map(option => {
            return <option value={option}>{option}</option>;
          })}
        </select>
      );
    default:
      return null;
  }
};

FormInput.propTypes = {
  inputType: Proptypes.string.isRequired,
  value: Proptypes.string,
  name: Proptypes.string.isRequired,
  label: Proptypes.string,
  rows: Proptypes.string,
  cols: Proptypes.string,
  answers: Proptypes.arrayOf(Proptypes.string),
  method: Proptypes.func,
  typeOfAnswer: Proptypes.string
};

FormInput.defaultProps = {
  value: null,
  label: null,
  rows: null,
  cols: null,
  answers: null,
  method: null,
  typeOfAnswer: null
};

export default FormInput;
