import React from "react";
import Proptypes from "prop-types";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormLabel from "@material-ui/core/FormLabel";
import FormControl from "@material-ui/core/FormControl";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Checkbox from "@material-ui/core/Checkbox";
import Slider from "@material-ui/core/Slider";
import { InputTypes } from "./constants";
import styles from "./FormInput.module.css";

const FormInput = ({
  inputType,
  name,
  answers,
  handleChange,
  handleChangeCheck,
  handleChangeSlider,
  values,
  isAnswerRequired,
  questionRef,
  text,
  marks
}) => {
  switch (inputType) {
    case InputTypes.slider:
      return (
        <div>
          <FormLabel component="h3" className={styles.title}>
            {text}
          </FormLabel>
          <Slider
            defaultValue={50}
            aria-labelledby="discrete-slider"
            valueLabelDisplay="auto"
            step={5}
            marks={marks}
            min={5}
            max={100}
            onChange={handleChangeSlider(questionRef)}
          />
        </div>
      );
    case InputTypes.radioButton:
      return (
        <FormControl component="fieldset">
          <FormLabel component="h3" className={styles.title}>
            {text}
          </FormLabel>
          <RadioGroup
            aria-label={text}
            name={name}
            onChange={handleChange(questionRef)}
          >
            {answers.map(answerText => (
              <FormControlLabel
                key={answerText}
                value={answerText}
                control={<Radio color="primary" />}
                label={answerText}
              />
            ))}
          </RadioGroup>
        </FormControl>
      );

    case InputTypes.standardInput:
      return (
        <div>
          <FormControl>
            <FormLabel component="h3" className={styles.title}>
              {text}
            </FormLabel>
            <TextField
              id="standard-number"
              name={name}
              value={values[`${questionRef}`]}
              type="number"
              InputLabelProps={{
                shrink: true
              }}
              onChange={handleChange(questionRef)}
            />
            {!isAnswerRequired ? (
              <label htmlFor={questionRef}>
                <Checkbox
                  id={questionRef}
                  onChange={handleChangeCheck(questionRef)}
                  value="Prefer not to answer"
                  checked={values[`${questionRef}`] === "Prefer not to answer"}
                  inputProps={{ "aria-label": "primary checkbox" }}
                />
                Prefer not to answer
              </label>
            ) : null}
          </FormControl>
        </div>
      );
    case InputTypes.selectInput:
      return (
        <div>
          <FormLabel component="h3" className={styles.title}>
            {text}
          </FormLabel>
          <Select
            name={name}
            value={values[`${questionRef}`]}
            onChange={handleChange(questionRef)}
          >
            {answers.map(option => {
              return (
                <MenuItem value={option} key={answers.indexOf(option)}>
                  {option}
                </MenuItem>
              );
            })}
          </Select>
        </div>
      );
    default:
      return null;
  }
};

FormInput.propTypes = {
  inputType: Proptypes.string.isRequired,
  name: Proptypes.string.isRequired,
  answers: Proptypes.arrayOf(Proptypes.string),
  handleChange: Proptypes.func.isRequired,
  handleChangeCheck: Proptypes.func.isRequired,
  handleChangeSlider: Proptypes.func.isRequired,
  values: Proptypes.objectOf(
    Proptypes.oneOfType([Proptypes.string, Proptypes.number])
  ).isRequired,
  isAnswerRequired: Proptypes.bool.isRequired,
  text: Proptypes.string.isRequired,
  questionRef: Proptypes.string.isRequired,
  marks: Proptypes.arrayOf(
    Proptypes.shape({ value: Proptypes.number, label: Proptypes.string })
  )
};

FormInput.defaultProps = {
  answers: null,
  marks: null
};

export default FormInput;
