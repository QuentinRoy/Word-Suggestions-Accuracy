/* eslint-disable jsx-a11y/label-has-associated-control */
import React from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { useHistory } from "react-router-dom";
import { stringify } from "qs";
import pick from "lodash/pick";
import { Devices } from "../utils/constants";

const requiredValues = ["participant", "config", "device", "isTest"];
const savedValues = ["device", "isTest"];
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

const transformValues = values => {
  if (values.isTest == null) return values;
  return { ...values, isTest: values.isTest === "yes" };
};

const validate = values => {
  const errors = {};
  Object.entries(values).forEach(([qId, value]) => {
    if ((value == null || value === "") && requiredValues.includes(qId)) {
      errors[qId] = "This field is required";
    }
  });
  return errors;
};

const prevValues = fetchStoredValues();

// eslint-disable-next-line react/prop-types
const StyledErrorMessage = ({ children }) => (
  <span style={{ color: "red" }}>{children}</span>
);

const StartForm = () => {
  const history = useHistory();

  const onSubmit = (values, { setSubmitting }) => {
    setSubmitting(true);
    // Register some of the keys that should not change often.
    saveValues(values);
    history.push({
      pathname: "/experiment",
      search: `?${stringify(transformValues(values))}`
    });
  };

  return (
    <>
      <h2>Experiment Startup</h2>
      <Formik
        initialValues={{
          participant: "",
          device: "",
          config: "",
          isTest: "",
          ...prevValues
        }}
        validate={validate}
        onSubmit={onSubmit}
        validateOnChange={false}
      >
        <Form>
          <p>
            <label htmlFor="participant">Participant Id: </label>
            <Field name="participant" id="participant" type="text" />{" "}
            <ErrorMessage name="participant" component={StyledErrorMessage} />
          </p>
          <p>
            <label htmlFor="config">Configuration Id: </label>
            <Field name="config" id="config" type="text" />{" "}
            <ErrorMessage name="config" component={StyledErrorMessage} />
          </p>
          <p>
            <label htmlFor="isTest">
              Is this a test Run?{" "}
              <Field id="isTest" name="isTest" as="select">
                <option value=""> </option>
                <option value="yes">yes</option>
                <option value="no">no</option>
              </Field>
            </label>
            <ErrorMessage name="isTest" component={StyledErrorMessage} />
          </p>
          <p>
            <label htmlFor="device">Device: </label>
            <Field name="device" as="select" id="device">
              <option value=""> </option>
              {Object.entries(Devices).map(([key, value]) => (
                <option key={key} value={value}>
                  {key}
                </option>
              ))}
            </Field>{" "}
            <ErrorMessage name="device" component={StyledErrorMessage} />
          </p>
          <p>
            <button type="submit">Start</button>
          </p>
        </Form>
      </Formik>
    </>
  );
};

export default StartForm;
