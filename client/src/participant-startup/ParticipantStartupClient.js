import React, { useReducer, useEffect } from "react";
import PropTypes from "prop-types";
import { stringify } from "qs";
import omit from "lodash/omit";
import { useHistory } from "react-router-dom";
import {
  Devices,
  controlServerAddress,
  LoadingStates,
} from "../common/constants";
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
          pathname: `/${args.app}`,
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
    case LoadingStates.idle:
      return <>Not connected.</>;
    case LoadingStates.closed:
      return <>Disconnected.</>;
    case LoadingStates.loading:
      return <Loading>Connecting...</Loading>;
    case LoadingStates.crashed:
    case LoadingStates.invalidArguments:
      return <ErrorMessage>Server connection error...</ErrorMessage>;
    default:
      break;
  }

  switch (registrationStatus.state) {
    case "waiting":
    case "registering":
      return <Loading>Registering...</Loading>;
    case "error":
      return (
        <ErrorMessage>
          Regisration error: {registrationStatus.error.message}
        </ErrorMessage>
      );
    case "ready":
      return null;
    default:
      throw new Error(`Unexpected state: ${registrationStatus.state}`);
  }
}

function reducer(state, action) {
  switch (action.type) {
    case "registering":
      return { ...state, state: "loading" };
    case "registered":
      return { ...state, state: "ready" };
    case "error":
      return { ...state, state: "crashed", error: action.error };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
}

export default function ParticipantStartupClient({
  participant,
  device,
  onEdit,
}) {
  const controlClient = useControlClient(controlServerAddress, {
    onCommand: Controller(useHistory()),
  });
  const [registrationStatus, dispatch] = useReducer(reducer, {
    state: "waiting",
  });

  useEffect(() => {
    if (
      controlClient.state === LoadingStates.loaded &&
      registrationStatus.state === "waiting"
    ) {
      controlClient.setInfo({ participant, device }).then(
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
