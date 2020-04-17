import React, { useReducer, useEffect } from "react";
import PropTypes from "prop-types";
import { stringify } from "qs";
import omit from "lodash/omit";
import { useHistory } from "react-router-dom";
import { Devices, ReadyStates } from "../common/constants";
import SetupSummary from "./SetupSummary";
import useControlClient from "./useControlClient";
import Loading from "../common/components/Loading";
import style from "./ParticipantStartupClient.module.css";

const Controller = (history) => (command, args) => {
  switch (command) {
    case "start-app":
      // Doing this asynchronously so we have the time to answer.
      setTimeout(() => {
        history.push({
          pathname: args.app,
          search: `?${stringify(omit(args, "app"))}`,
        });
      });
      break;
    default:
      throw new Error(`Unsupported command: ${command}`);
  }
};

function ErrorMessage({ children }) {
  return <span className={style.error}>{children}</span>;
}
ErrorMessage.propTypes = { children: PropTypes.node.isRequired };

function Status({ registrationStatus, clientState }) {
  switch (clientState) {
    case ReadyStates.idle:
      return <>Not connected.</>;
    case ReadyStates.done:
      return <>Disconnected.</>;
    case ReadyStates.loading:
      return <Loading>Connecting...</Loading>;
    case ReadyStates.crashed:
      return <ErrorMessage>Server connection error...</ErrorMessage>;
    default:
      break;
  }

  switch (registrationStatus.state) {
    case ReadyStates.idle:
    case ReadyStates.loading:
      return <Loading>Registering...</Loading>;
    case ReadyStates.crashed:
      return (
        <ErrorMessage>
          Regisration error: {registrationStatus.error.message}
        </ErrorMessage>
      );
    case ReadyStates.ready:
      return <>Please wait for your experimenter to start the next step.</>;
    default:
      throw new Error(`Unexpected state: ${registrationStatus.state}`);
  }
}

function reducer(state, action) {
  switch (action.type) {
    case "registering":
      return { ...state, state: ReadyStates.loading };
    case "registered":
      return { ...state, state: ReadyStates.ready };
    case "error":
      return { ...state, state: ReadyStates.crashed, error: action.error };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

export default function ParticipantStartupClient({
  participant,
  device,
  onEdit,
}) {
  const controlClient = useControlClient({
    onCommand: Controller(useHistory()),
  });
  const [registrationStatus, dispatch] = useReducer(reducer, {
    state: ReadyStates.idle,
  });

  useEffect(() => {
    if (
      controlClient.state === ReadyStates.ready &&
      registrationStatus.state === ReadyStates.idle
    ) {
      controlClient.setInfo({ participant, device, activity: "waiting" }).then(
        () => {
          dispatch({ type: "registered" });
        },
        (err) => {
          dispatch({ type: "error", error: err });
        }
      );
    }
  });

  return (
    <>
      <SetupSummary participant={participant} device={device} onEdit={onEdit} />
      <Status
        registrationStatus={registrationStatus}
        clientState={controlClient.state}
      />
    </>
  );
}
ParticipantStartupClient.propTypes = {
  onEdit: PropTypes.func.isRequired,
  participant: PropTypes.string.isRequired,
  device: PropTypes.oneOf(Object.values(Devices)).isRequired,
};
