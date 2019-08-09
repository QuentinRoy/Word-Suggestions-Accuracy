import React from "react";
import Proptypes from "prop-types";
import { InputTypes } from "./constants";

const FormInput = ({
  inputType,
  value,
  name,
  label,
  answers,
  method,
  typeOfAnswer
}) => {
  switch (inputType) {
    case InputTypes.textarea:
      return (
        <textarea name={name} rows="10" cols="100" className="grid-item" />
      );
    case InputTypes.radioButton:
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
    case InputTypes.standardInput:
      return (
        <input
          type={typeOfAnswer}
          value={value}
          name={name}
          onChange={e => method(e.target.value)}
          className="grid-item"
        />
      );
    case InputTypes.standardButton:
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
    case InputTypes.submitButton:
      return <input type="submit" value={value} className="grid-item" />;
    case InputTypes.selectInput:
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
  answers: Proptypes.arrayOf(Proptypes.string),
  method: Proptypes.func,
  typeOfAnswer: Proptypes.string
};

FormInput.defaultProps = {
  value: null,
  label: null,
  answers: null,
  method: null,
  typeOfAnswer: null
};

export default FormInput;
