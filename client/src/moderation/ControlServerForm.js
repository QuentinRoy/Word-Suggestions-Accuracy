/* eslint-disable jsx-a11y/label-has-associated-control */
import React from "react";
import { Formik, Field, Form, ErrorMessage } from "formik";
import PropTypes from "prop-types";
import omitBy from "lodash/omitBy";
import RadioBoxGroup from "../common/components/RadioBoxGroup";
import Checkbox from "../common/components/CheckboxWithLabel";
import useUniqueId from "../common/hooks/useUniqueId";
import FormErrorMessage from "../common/components/FormErrorMessage";
import style from "./ControlServerForm.module.css";
import { Devices, UserRoles, Paths } from "../common/constants";
import Info from "./Info";

const isBlank = (value) => value == null || value === "";

const validate = (participants) => (values) => {
  const errors = {};
  if (isBlank(values.targetExperiment)) {
    errors.targetExperiment = "This field is required";
  }
  if (values.targetExperiment === "experiment" && isBlank(values.config)) {
    errors.config = "This field is required";
  }
  if (
    isBlank(values.targetParticipant) ||
    !participants.find((p) => p.id === values.targetParticipant)
  ) {
    errors.targetParticipant = "This field is required";
  }
  return errors;
};

const Client = ({ info }) => {
  return (
    <span>
      {info.participant} – {info.device}{" "}
      {info.activity ? `(${info.activity})` : ""}
    </span>
  );
};
Client.propTypes = {
  info: PropTypes.shape({
    participant: PropTypes.string.isRequired,
    device: PropTypes.string.isRequired,
    activity: PropTypes.string.isRequired,
  }).isRequired,
};

const ControlServerForm = ({ clients, startApp }) => {
  const id = useUniqueId();
  const participants = clients.filter((c) => c.role === UserRoles.participant);

  const handleStart = ({
    targetExperiment,
    targetParticipant: pid,
    ...args
  }) => {
    const participant = participants.find((p) => p.id === pid);
    startApp(targetExperiment, participant.id, {
      participant: participant.info.participant,
      device: participant.info.device,
      ...omitBy(args, isBlank),
    });
  };

  return (
    <Formik
      initialValues={
        // We need to provide  initial values or some inputs will be
        // uncontrolled.
        {
          config: "",
          isTest: false,
          targetParticipant: "",
          targetExperiment: null,
        }
      }
      validate={validate(participants)}
      onSubmit={handleStart}
    >
      {({ values }) => (
        <Form>
          <div className={style.formRow}>
            {participants.length === 0 ? (
              <Info>No connected participants yet</Info>
            ) : (
              <>
                <label
                  className={style.verticalRadioBoxGroupLabel}
                  htmlFor={`${id}-target-participant`}
                >
                  Client{participants.length !== 1 && "s"}:{" "}
                </label>
                <div className={style.leftPadding}>
                  <Field
                    id={`${id}-target-participant`}
                    name="targetParticipant"
                    as={RadioBoxGroup}
                    direction="vertical"
                  >
                    {participants.map((targetParticipant) => (
                      <option
                        value={targetParticipant.id}
                        key={targetParticipant.id}
                        disabled={targetParticipant.info.activity !== "waiting"}
                      >
                        <Client {...targetParticipant} />
                      </option>
                    ))}
                  </Field>
                </div>
              </>
            )}
          </div>

          <div className={style.formRow}>
            <Field name="targetExperiment" as={RadioBoxGroup}>
              <option value={Paths.typingTest}>Typing Speed Test</option>
              <option value={Paths.experiment}>Experiment</option>
            </Field>
            <ErrorMessage
              name="targetExperiment"
              component={FormErrorMessage}
            />
          </div>

          <div className={style.formRow}>
            <Field name="isTest" as={Checkbox}>
              Is a test run
            </Field>
            <ErrorMessage name="isTest" component={FormErrorMessage} />
          </div>

          <div className={style.formRow}>
            <label
              htmlFor={`${id}-config`}
              className={
                values.targetExperiment == null ||
                values.targetExperiment === Paths.experiment
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
                values.targetExperiment !== Paths.experiment &&
                values.targetExperiment != null
              }
            />{" "}
            <ErrorMessage name="config" component={FormErrorMessage} />
          </div>

          <div className={style.formRow}>
            <button type="submit" disabled={participants.length === 0}>
              start
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

ControlServerForm.propTypes = {
  clients: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      info: PropTypes.shape({
        participant: PropTypes.string.isRequired,
        device: PropTypes.oneOf(Object.values(Devices)).isRequired,
      }),
    })
  ).isRequired,
  startApp: PropTypes.func.isRequired,
};

export default ControlServerForm;
