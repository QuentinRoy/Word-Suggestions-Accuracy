/* eslint-disable jsx-a11y/label-has-associated-control */
import React from "react";
import PropTypes from "prop-types";
import { Formik, Field, Form, ErrorMessage } from "formik";
import RadioBoxGroup from "../common/components/RadioBoxGroup";
import Checkbox from "../common/components/CheckboxWithLabel";
import style from "./RemoteStartup.module.css";
import useControlServer from "./useControlServer";
import useUniqueId from "../common/hooks/useUniqueId";

const StyledErrorMessage = ({ children }) => (
  <span className={style.error}>{children}</span>
);
StyledErrorMessage.propTypes = { children: PropTypes.node.isRequired };

const isBlank = (value) => value == null || value === "";

const validate = (values) => {
  const errors = {};
  if (isBlank(values.targetExperiment)) {
    errors.targetExperiment = "This field is required";
  }
  if (values.targetExperiment === "experiment" && isBlank(values.config)) {
    errors.config = "This field is required";
  }
  if (isBlank(values.client)) {
    errors.client = "This field is required";
  }
  return errors;
};

const RemoteStartup = () => {
  const { clients, startApp } = useControlServer();
  const id = useUniqueId();

  const handleStart = (values, ...args) => {
    const client = clients.find((c) => values.client === c.id);
    startApp({ ...values, client }, ...args);
  };

  return (
    <Formik
      initialValues={
        // We need to provide  initial values or some inputs will be
        // uncontrolled.
        { config: "", isTest: false, client: "", targetExperiment: null }
      }
      validate={validate}
      onSubmit={handleStart}
    >
      {({ values }) => (
        <Form>
          <div className={style.formRow}>
            <label htmlFor={`${id}-client`}>Client: </label>
            <div className={style.leftPadding}>
              <Field
                id={`${id}-client`}
                name="client"
                as={RadioBoxGroup}
                direction="vertical"
              >
                {clients.map((client) => (
                  <option value={client.id} key={client.id}>
                    {client.participant} – {client.device}
                  </option>
                ))}
              </Field>
              {clients.length === 0 && "No client connected yet."}
            </div>
          </div>

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

          <div className={style.formRow}>
            <Field name="isTest" as={Checkbox}>
              Is a test run
            </Field>
            <ErrorMessage name="isTest" component={StyledErrorMessage} />
          </div>

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

          <div className={style.formRow}>
            <label htmlFor={`${id}-password`}>Password: </label>
            <Field name="password" id={`${id}-password`} type="password" />{" "}
            <ErrorMessage name="password" component={StyledErrorMessage} />
          </div>

          <div className={style.formRow}>
            <button type="submit" disabled={clients.length === 0}>
              start
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};
export default RemoteStartup;
