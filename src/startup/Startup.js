/* eslint-disable jsx-a11y/label-has-associated-control */
import React from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import { stringify } from "qs";
import { PageArguments, SuggestionTypes, Devices } from "../utils/constants";

const requiredValues = [
  PageArguments.wave,
  PageArguments.workerId,
  PageArguments.suggestionsType,
  PageArguments.keyStrokeDelays,
  PageArguments.targetAccuracies,
  PageArguments.totalSuggestions,
  PageArguments.device
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
    <div style={{ width: "600px", margin: "50px auto" }}>
      <Formik
        initialValues={{
          [PageArguments.suggestionsType]: SuggestionTypes.bar,
          [PageArguments.wave]: "multi-device",
          [PageArguments.workerId]: "",
          [PageArguments.targetAccuracies]: "",
          [PageArguments.keyStrokeDelays]: 0,
          [PageArguments.totalSuggestions]: 3,
          [PageArguments.device]: ""
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
            <label htmlFor={PageArguments.wave}>Experiment Id: </label>
            <Field name={PageArguments.wave} type="text" />{" "}
            <ErrorMessage
              name={PageArguments.wave}
              component={StyledErrorMessage}
            />
          </p>
          <p>
            <label htmlFor={PageArguments.workerId}>Participant Id: </label>
            <Field name={PageArguments.workerId} type="text" />{" "}
            <ErrorMessage
              name={PageArguments.workerId}
              component={StyledErrorMessage}
            />
          </p>
          <p>
            <label htmlFor={PageArguments.suggestionsType}>
              Suggestions Type:{" "}
            </label>
            <Field name={PageArguments.suggestionsType} as="select">
              {Object.entries(SuggestionTypes).map(([key, value]) => (
                <option key={key} value={value}>
                  {key}
                </option>
              ))}
            </Field>{" "}
            <ErrorMessage
              name={PageArguments.suggestionsType}
              component={StyledErrorMessage}
            />
          </p>
          <p>
            <label htmlFor={PageArguments.totalSuggestions}>
              Total Suggestions:{" "}
            </label>
            <Field
              name={PageArguments.totalSuggestions}
              type="number"
              min={0}
              step={1}
            />{" "}
            <ErrorMessage
              name={PageArguments.totalSuggestions}
              component={StyledErrorMessage}
            />
          </p>
          <p>
            <label htmlFor={PageArguments.targetAccuracies}>
              Target Accuracy:{" "}
            </label>
            <Field
              name={PageArguments.targetAccuracies}
              type="number"
              min={0}
              step={0.1}
              max={1}
            />{" "}
            <ErrorMessage
              name={PageArguments.targetAccuracies}
              component={StyledErrorMessage}
            />
          </p>
          <p>
            <label htmlFor={PageArguments.keyStrokeDelays}>
              Key Stroke Delays:{" "}
            </label>
            <Field
              name={PageArguments.keyStrokeDelays}
              type="number"
              min={0}
              step={1}
            />{" "}
            <ErrorMessage
              name={PageArguments.keyStrokeDelays}
              component={StyledErrorMessage}
            />
          </p>
          <p>
            <label htmlFor={PageArguments.device}>Device: </label>
            <Field name={PageArguments.device} as="select">
              <option value=""> </option>
              {Object.entries(Devices).map(([key, value]) => (
                <option key={key} value={value}>
                  {key}
                </option>
              ))}
            </Field>{" "}
            <ErrorMessage
              name={PageArguments.device}
              component={StyledErrorMessage}
            />
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
