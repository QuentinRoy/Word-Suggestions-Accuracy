import React, { memo } from "react";
import PropTypes from "prop-types";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormLabel from "@material-ui/core/FormLabel";
import FormControl from "@material-ui/core/FormControl";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Checkbox from "@material-ui/core/Checkbox";
import { makeStyles } from "@material-ui/core";
import classNames from "classnames";
import { InputTypes, Directions } from "./constants";
import styles from "./FormInput.module.css";
import NasaTlxInput from "./NasaTlxInput";

const useStyles = makeStyles(theme => ({
  choiceLabel: { ...theme.typography.body2, textAlign: "center" }
}));

const FormInput = memo(
  ({
    inputType,
    id,
    answers,
    onChange,
    value,
    isAnswerRequired,
    text,
    description,
    direction,
    lowLabel,
    highLabel
  }) => {
    const { choiceLabel } = useStyles();
    switch (inputType) {
      case InputTypes.nasaTlx:
        return (
          <NasaTlxInput
            name={id}
            title={isAnswerRequired ? `${text}*` : text}
            description={description}
            value={value}
            onChange={(event, newValue) => {
              onChange(id, newValue);
            }}
            lowLabel={lowLabel}
            highLabel={highLabel}
          />
        );

      case InputTypes.choice:
        return (
          <FormControl
            component="fieldset"
            className={classNames(styles.main, styles.choice)}
            required={isAnswerRequired}
            fullWidth={direction === Directions.horizontal}
          >
            <FormLabel component="h3" className={styles.title}>
              {text}
            </FormLabel>
            <RadioGroup
              aria-label={text}
              name={id}
              onChange={(event, newValue) => {
                onChange(id, newValue);
              }}
              className={styles.radioGroup}
              row={direction === Directions.horizontal}
            >
              {answers.map(answerText => (
                <FormControlLabel
                  classes={{ label: choiceLabel }}
                  key={answerText}
                  value={answerText}
                  control={<Radio color="primary" />}
                  label={answerText}
                  labelPlacement={
                    direction === Directions.horizontal ? "top" : "end"
                  }
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case InputTypes.number:
        return (
          <FormControl
            className={classNames(styles.main, styles.number)}
            component="fieldset"
            margin="normal"
            required={isAnswerRequired}
          >
            <FormLabel component="h3" className={styles.title}>
              {text}
            </FormLabel>
            <TextField
              id="standard-number"
              name={id}
              value={value == null ? "" : value}
              type="number"
              onChange={event => {
                onChange(id, event.target.value);
              }}
              disabled={value === "Prefer not to say"}
            />
            {isAnswerRequired ? null : (
              // eslint-disable-next-line jsx-a11y/label-has-associated-control
              <label htmlFor={`${id}-prefer-not-to-say`}>
                <Checkbox
                  id={`${id}-prefer-not-to-say`}
                  onChange={(event, checked) => {
                    onChange(id, checked ? "Prefer not to say" : undefined);
                  }}
                  color="primary"
                  value="Prefer not to say"
                  checked={value === "Prefer not to say"}
                  inputProps={{ "aria-label": "primary checkbox" }}
                />
                Prefer not to say
              </label>
            )}
          </FormControl>
        );

      case InputTypes.selectInput:
        return (
          <FormControl
            className={classNames(styles.main, styles.selectInput)}
            component="fieldset"
            margin="normal"
            required={isAnswerRequired}
          >
            <FormLabel component="h3" className={styles.title}>
              {text}
            </FormLabel>
            <Select
              value={value == null ? "" : value}
              onChange={event => {
                onChange(id, event.target.value);
              }}
              name={id}
            >
              {answers.map((option, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <MenuItem value={option} key={i}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      default:
        throw new Error(`Unsupported input type: ${inputType}`);
    }
  }
);

FormInput.propTypes = {
  inputType: PropTypes.oneOf(Object.values(InputTypes)).isRequired,
  direction: PropTypes.oneOf(Object.values(Directions)),
  answers: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  isAnswerRequired: PropTypes.bool.isRequired,
  text: PropTypes.string.isRequired,
  description: PropTypes.string,
  id: PropTypes.string.isRequired,
  lowLabel: PropTypes.string,
  highLabel: PropTypes.string
};

FormInput.defaultProps = {
  value: null,
  answers: null,
  description: null,
  direction: null,
  lowLabel: null,
  highLabel: null
};

export default FormInput;
