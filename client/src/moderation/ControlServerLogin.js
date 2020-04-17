import React from "react";
import PropTypes from "prop-types";
import { Formik, Field, ErrorMessage, Form } from "formik";
import useUniqueId from "../common/hooks/useUniqueId";
import style from "./ControlServerLogin.module.scss";
import FormErrorMessage from "../common/components/FormErrorMessage";
import { ReadyStates } from "../common/constants";

function ControlServerLoginForm({ onLogin, canSubmit }) {
  const id = useUniqueId();
  return (
    <Formik
      onSubmit={async (values, { setSubmitting, setErrors }) => {
        setSubmitting(true);
        try {
          await onLogin(values.password);
        } catch (error) {
          setErrors({ password: error.message });
          setSubmitting(false);
        }
      }}
      initialValues={{ password: "" }}
    >
      {({ isSubmitting }) => (
        <Form>
          <div className={style.formRow}>
            <label htmlFor={`${id}-password`}>
              Password:{" "}
              <Field
                disabled={isSubmitting}
                as="input"
                name="password"
                id={`${id}-password`}
                type="password"
              />
            </label>{" "}
            <ErrorMessage name="password" component={FormErrorMessage} />
          </div>

          <div className={style.formRow}>
            <button type="submit" disabled={!canSubmit || isSubmitting}>
              Login
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
ControlServerLoginForm.propTypes = {
  onLogin: PropTypes.func.isRequired,
  canSubmit: PropTypes.bool.isRequired,
};

function StatusMessage({ state }) {
  switch (state) {
    case ReadyStates.done:
    case ReadyStates.idle:
      return <>Server connection closed.</>;
    case ReadyStates.crashed:
      return <>Server connection lost...</>;
    case ReadyStates.loading:
      return <>Connecting to server...</>;
    case ReadyStates.ready:
      return null;
    default:
      throw new Error(`Unexpected state: ${state}`);
  }
}

export default function ControlServerLogin({ onLogin, serverState }) {
  return (
    <>
      <ControlServerLoginForm
        onLogin={onLogin}
        canSubmit={serverState === ReadyStates.ready}
      />
      <div className={style.statusMessage}>
        <StatusMessage state={serverState} />
      </div>
    </>
  );
}
ControlServerLogin.propTypes = {
  onLogin: PropTypes.func.isRequired,
  serverState: PropTypes.oneOf(Object.values(ReadyStates)).isRequired,
};
