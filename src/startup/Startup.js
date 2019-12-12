/* eslint-disable jsx-a11y/label-has-associated-control */
import React from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { stringify } from "qs";

const requiredValues = [
  "wave",
  "workerId",
  "suggestionsType",
  "keyStrokeDelays",
  "targetAccuracies"
];

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

const Startup = () => {
  return (
    <Formik
      initialValues={{
        suggestionsType: "BAR",
        wave: "multi-device",
        workerId: "",
        targetAccuracy: "",
        keyStrokeDelays: 0
      }}
      validate={validate}
      onSubmit={(values, { setSubmitting }) => {
        setSubmitting(true);
        window.location.replace(
          `${window.location.origin}?${stringify(values)}`
        );
      }}
      validateOnChange={false}
    >
      <Form>
        <p>
          <label htmlFor="wave">Experiment Id: </label>
          <Field name="wave" type="text" />{" "}
          <ErrorMessage name="wave" component={StyledErrorMessage} />
        </p>
        <p>
          <label htmlFor="workerId">Participant Id: </label>
          <Field name="workerId" type="text" />{" "}
          <ErrorMessage name="workerId" component={StyledErrorMessage} />
        </p>
        <p>
          <label htmlFor="suggestionsType">Suggestions Type: </label>
          <Field name="suggestionsType" as="select">
            <option value="BAR">Bar</option>
            <option value="INLINE">Inline</option>
          </Field>{" "}
          <ErrorMessage name="suggestionsType" component={StyledErrorMessage} />
        </p>
        <p>
          <label htmlFor="targetAccuracies">Target Accuracy: </label>
          <Field
            name="targetAccuracies"
            type="number"
            min={0}
            step={0.1}
            max={1}
          />{" "}
          <ErrorMessage
            name="targetAccuracies"
            component={StyledErrorMessage}
          />
        </p>
        <p>
          <label htmlFor="keyStrokeDelays">Key Stroke Delays: </label>
          <Field name="keyStrokeDelays" type="number" min={0} step={1} />{" "}
          <ErrorMessage name="keyStrokeDelays" component={StyledErrorMessage} />
        </p>
        <p>
          <button type="submit">Submit</button>
        </p>
      </Form>
    </Formik>
  );
};

export default Startup;
