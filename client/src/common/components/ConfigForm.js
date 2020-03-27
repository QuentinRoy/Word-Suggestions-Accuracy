/* eslint-disable jsx-a11y/label-has-associated-control */
import React from "react";
import PropTypes from "prop-types";
import { Formik, Field, Form, ErrorMessage } from "formik";
import omitBy from "lodash/omitBy";
import { Devices } from "../constants";
import RadioBoxGroup from "./RadioBoxGroup";
import style from "./ConfigForm.module.css";
import Checkbox from "./CheckboxWithLabel";
import useUniqueId from "../hooks/useUniqueId";

// eslint-disable-next-line react/prop-types
const StyledErrorMessage = ({ children }) => (
  <span className={style.error}>{children}</span>
);

const ConfigForm = ({
  onSubmit,
  initialValues,
  submitLabel,
  enabledFields,
  canSubmit,
}) => {
  const id = useUniqueId();

  const validate = (values) => {
    const errors = {};
    ["device", "isTest", "targetExperiment"].forEach((qId) => {
      const value = values[qId];
      if (enabledFields.includes(qId) && (value == null || value === "")) {
        errors[qId] = "This field is required";
      }
    });
    if (
      enabledFields.includes("config") &&
      (values.config == null || values.config === "") &&
      (!enabledFields.includes("targetExperiment") ||
        values.targetExperiment === "experiment")
    ) {
      errors.config = "This field is required";
    }
    if (
      (!enabledFields.includes("isTest") || !values.isTest) &&
      (!enabledFields.includes("participant") ||
        values.participant == null ||
        values.participant === "")
    ) {
      errors.participant = "This field is required";
    }
    return errors;
  };

  const handleSubmit = (values, ...args) => {
    onSubmit(
      // Removes unwanted values.
      omitBy(values, (_, key) => !enabledFields.includes(key)),
      ...args
    );
  };

  return (
    <Formik
      initialValues={{
        // We need to provide an initial values for these as they are
        // text inputs.
        participant: "",
        config: "",
        isTest: false,
        device: null,
        targetExperiment: null,
        // Remove any undefined value from the initial values because this
        // or the inputs may end up being uncontrolled.
        ...omitBy(initialValues, (v) => v === undefined),
      }}
      validate={validate}
      onSubmit={handleSubmit}
    >
      {({ values }) => (
        <Form>
          {enabledFields.includes("targetExperiment") && (
            <div className={style.formRow}>
              <Field name="targetExperiment" as={RadioBoxGroup}>
                <option value="speed-test">Typing Speed Test</option>
                <option value="experiment">Experiment</option>
              </Field>
              <ErrorMessage
                name="targetExperiment"
                component={StyledErrorMessage}
              />
            </div>
          )}

          {enabledFields.includes("isTest") && (
            <div className={style.formRow}>
              <Field name="isTest" as={Checkbox}>
                Is a test run
              </Field>
              <ErrorMessage name="isTest" component={StyledErrorMessage} />
            </div>
          )}

          {enabledFields.includes("participant") && (
            <div className={style.formRow}>
              <label htmlFor={`${id}-participant`}>Participant Id: </label>
              <Field
                name="participant"
                id={`${id}-participant`}
                type="text"
              />{" "}
              <ErrorMessage name="participant" component={StyledErrorMessage} />
            </div>
          )}

          {enabledFields.includes("config") && (
            <div className={style.formRow}>
              <label
                htmlFor={`${id}-config`}
                className={
                  values.targetExperiment == null ||
                  values.targetExperiment === "experiment"
                    ? null
                    : style.disabledLabel
                }
              >
                Configuration Id:{" "}
              </label>
              <Field
                name="config"
                id={`${id}-config`}
                type="text"
                disabled={
                  values.targetExperiment !== "experiment" &&
                  values.targetExperiment != null
                }
              />{" "}
              <ErrorMessage name="config" component={StyledErrorMessage} />
            </div>
          )}

          {enabledFields.includes("device") && (
            <div className={style.formRow}>
              <Field name="device" as={RadioBoxGroup}>
                {Object.entries(Devices).map(([key, value]) => (
                  <option key={key} value={value}>
                    {key !== "" ? key[0].toUpperCase() + key.slice(1) : ""}
                  </option>
                ))}
              </Field>
              <ErrorMessage name="device" component={StyledErrorMessage} />
            </div>
          )}

          <div className={style.formRow}>
            <button type="submit" disabled={!canSubmit}>
              {submitLabel}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

ConfigForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  canSubmit: PropTypes.bool,
  enabledFields: PropTypes.arrayOf(
    PropTypes.oneOf([
      "participant",
      "config",
      "isTest",
      "device",
      "targetExperiment",
    ])
  ),
  initialValues: PropTypes.shape({
    participant: PropTypes.string,
    config: PropTypes.string,
    isTest: PropTypes.bool,
    device: PropTypes.oneOf(Object.values(Devices)),
    targetExperiment: PropTypes.oneOf(["speed-test", "experiment"]),
  }),
  submitLabel: PropTypes.string,
};

ConfigForm.defaultProps = {
  canSubmit: true,
  initialValues: {},
  submitLabel: "Submit",
  enabledFields: [
    "participant",
    "config",
    "isTest",
    "device",
    "targetExperiment",
  ],
};

export default ConfigForm;
