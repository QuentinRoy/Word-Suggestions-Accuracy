import React from "react";
import PropTypes from "prop-types";
import { Formik, Field, ErrorMessage, Form } from "formik";
import useUniqueId from "../common/hooks/useUniqueId";
import style from "./ControlServerLogin.module.scss";
import FormErrorMessage from "../common/components/FormErrorMessage";
import { ReadyStates, UserRoles } from "../common/constants";
import getEndPoints from "../common/utils/endpoints";
import useAsync from "../common/hooks/useAsync";
import { useModeration } from "../common/moderation/Moderation";

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

function ModerationStatusMessage() {
  const moderation = useModeration();

  switch (moderation.readyState) {
    case ReadyStates.done:
      return "Server connection closed.";
    case ReadyStates.crashed:
      return moderation.error?.message
        ? `Server connection error: ${moderation.error.message}`
        : `Server connection error...`;
    case ReadyStates.loading:
      return "Connecting to server...";
    case ReadyStates.ready:
    case ReadyStates.idle:
      return null;
    default:
      throw new Error(`Unexpected state: ${moderation.readyState}`);
  }
}

function EndpointsStatusMessage({ state }) {
  switch (state) {
    case ReadyStates.done:
    case ReadyStates.ready:
      return null;
    case ReadyStates.crashed:
      return "Could not find moderation server...";
    case ReadyStates.loading:
    case ReadyStates.idle:
      return "Loading...";
    default:
      throw new Error(`Unexpected state: ${state}`);
  }
}

export default function ControlServerLogin() {
  const moderation = useModeration();
  const [endPointsReadyState, endPoints] = useAsync(getEndPoints);

  return (
    <>
      <ControlServerLoginForm
        onLogin={(pass) =>
          moderation.reconnect({
            url: endPoints.controlServer,
            pass,
            role: UserRoles.moderator,
          })
        }
        canSubmit={endPointsReadyState === ReadyStates.ready}
      />
      <div className={style.statusMessage}>
        {endPointsReadyState === ReadyStates.ready ? (
          <ModerationStatusMessage />
        ) : (
          <EndpointsStatusMessage state={endPointsReadyState} />
        )}
      </div>
    </>
  );
}
ControlServerLogin.propTypes = {};
