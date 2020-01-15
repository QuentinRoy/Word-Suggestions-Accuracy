/* eslint-disable jsx-a11y/label-has-associated-control */
import React from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { stringify } from "qs";
import omit from "lodash/omit";
import { Devices } from "../utils/constants";

const requiredValues = ["participant", "device", "isTest"];

const localStorageKey = "startup-values";

// eslint-disable-next-line react/prop-types
const StyledErrorMessage = ({ children }) => (
  <span style={{ color: "red" }}>{children}</span>
);

const validate = values => {
  const errors = {};
  Object.entries(values).forEach(([qId, value]) => {
    if ((value == null || value === "") && requiredValues.includes(qId)) {
      errors[qId] = "This field is required";
    }
  });
  return errors;
};

const onSubmit = (values, { setSubmitting }) => {
  setSubmitting(true);
  // Register some of the keys that should not change often.
  localStorage.setItem(
    localStorageKey,
    JSON.stringify(omit(values, "participant"))
  );
  window.location.replace(`${window.location.origin}?${stringify(values)}`);
};

const prevValuesJSON = localStorage.getItem(localStorageKey);
const prevValues = prevValuesJSON == null ? {} : JSON.parse(prevValuesJSON);

const Startup = () => {
  return (
    <div style={{ width: "600px", margin: "50px auto" }}>
      <Formik
        initialValues={{
          participant: "",
          device: "",
          isTest: true,
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
            <label htmlFor="isTest">
              <Field id="isTest" name="isTest" as="input" type="checkbox" /> Is
              a test Run
            </label>
            <ErrorMessage name="isTest" component={StyledErrorMessage} />
          </p>
          <p>
            <button type="submit">Submit</button>
          </p>
        </Form>
      </Formik>
    </div>
  );
};

export default Startup;
