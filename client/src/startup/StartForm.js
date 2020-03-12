/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useMemo } from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { useHistory } from "react-router-dom";
import { stringify } from "qs";
import pick from "lodash/pick";
import { Devices } from "../utils/constants";
import RadioBoxGroup from "./RadioBoxGroup";
import style from "./StartForm.module.css";
import Checkbox from "./CheckboxWithLabel";

const savedValues = ["device", "isTest", "participant"];
const localStorageSavedValuesKey = "startup-values";

const fetchStoredValues = () => {
  const prevValuesJSON = localStorage.getItem(localStorageSavedValuesKey);
  return prevValuesJSON == null
    ? {}
    : pick(JSON.parse(prevValuesJSON), savedValues);
};

const saveValues = values => {
  localStorage.setItem(
    localStorageSavedValuesKey,
    JSON.stringify(pick(values, savedValues))
  );
};

const validate = values => {
  const errors = {};
  ["device", "isTest", "target"].forEach(qId => {
    const value = values[qId];
    if (value == null || value === "") {
      errors[qId] = "This field is required";
    }
  });
  if (
    values.config == null ||
    (values.config === "" && values.target === "experiment")
  ) {
    errors.config = "This field is required";
  }
  if (
    !values.isTest &&
    (values.participant == null || values.participant === "")
  ) {
    errors.participant = "This field is required";
  }
  return errors;
};

// eslint-disable-next-line react/prop-types
const StyledErrorMessage = ({ children }) => (
  <span className={style.error}>{children}</span>
);

const StartForm = () => {
  const history = useHistory();

  const onSubmit = (values, { setSubmitting }) => {
    const { target, config, participant, isTest, ...otherValues } = values;
    setSubmitting(true);
    // Register some of the keys that should not change often.
    saveValues(values);
    history.push({
      pathname: target === "speed-test" ? "/typing" : "/experiment",
      search: `?${stringify({
        ...otherValues,
        isTest,
        participant:
          isTest && (participant === "" || participant == null)
            ? "test"
            : participant,
        config: target === "speed-test" ? undefined : config
      })}`
    });
  };

  return (
    <>
      <h2>Startup</h2>
      <Formik
        initialValues={useMemo(
          () => ({
            // We need to provide an initial values for these as they are
            // text inputs.
            participant: "",
            config: "",
            isTest: false,
            device: null,
            target: null,
            ...fetchStoredValues()
          }),
          []
        )}
        validate={validate}
        onSubmit={onSubmit}
      >
        {({ values }) => (
          <Form>
            <div className={style.formRow}>
              <Field name="target" as={RadioBoxGroup}>
                <option value="speed-test">Typing Speed Test</option>
                <option value="experiment">Experiment</option>
              </Field>
              <ErrorMessage name="target" component={StyledErrorMessage} />
            </div>

            <div className={style.formRow}>
              <Field name="isTest" as={Checkbox}>
                Is a test run
              </Field>
              <ErrorMessage name="isTest" component={StyledErrorMessage} />
            </div>

            <div className={style.formRow}>
              <label htmlFor="participant">Participant Id: </label>
              <Field name="participant" id="participant" type="text" />{" "}
              <ErrorMessage name="participant" component={StyledErrorMessage} />
            </div>

            <div className={style.formRow}>
              <label
                htmlFor="config"
                className={
                  values.target !== "experiment" ? style.disabledLabel : null
                }
              >
                Configuration Id:{" "}
              </label>
              <Field
                name="config"
                id="config"
                type="text"
                disabled={values.target !== "experiment"}
              />{" "}
              <ErrorMessage name="config" component={StyledErrorMessage} />
            </div>

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

            <div className={style.formRow}>
              <button type="submit">Start</button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default StartForm;
