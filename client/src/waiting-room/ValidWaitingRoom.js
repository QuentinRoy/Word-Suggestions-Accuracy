import React from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import { stringify } from "qs";
import omit from "lodash/omit";
import { ReadyStates } from "../common/constants";
import Loading from "../common/components/Loading";
import style from "./ValidWaitingRoom.module.css";
import SetupSummary from "./SetupSummary";
import { useClientInfo } from "./ClientInfo";
import { useSharedModerationClient } from "../common/contexts/ModerationClient";

// eslint-disable-next-line react/prop-types
function ConnectionError({ buttonLabel = "Retry", children }) {
  const { reconnect } = useSharedModerationClient();
  const { participant, device } = useClientInfo();
  return (
    <>
      <SetupSummary participant={participant} device={device} />
      <div className={style.error}>
        <span>{children}</span>
        <button
          type="button"
          className={style.reconnectButton}
          onClick={reconnect}
        >
          {buttonLabel}
        </button>
      </div>
    </>
  );
}

function Disconnected() {
  return (
    <ConnectionError buttonLabel="Reconnect">Disconnected...</ConnectionError>
  );
}

function NotConnected() {
  return <>Not connected.</>;
}

function Connecting() {
  return <Loading>Connecting...</Loading>;
}

function ServerCrashed() {
  return <ConnectionError>Server connection error...</ConnectionError>;
}

function Registering() {
  return <Loading>Connecting...</Loading>;
}

function RegistrationCrashed({ error }) {
  return (
    <ConnectionError>Registration error: ${error.message}...</ConnectionError>
  );
}
RegistrationCrashed.propTypes = {
  error: PropTypes.shape({ message: PropTypes.string.isRequired }).isRequired,
};

function Ready() {
  return (
    <>
      <SetupSummary />
      <div>
        <strong className={style.instruction}>
          Please wait for your experimenter.
        </strong>
      </div>
    </>
  );
}

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

export default function ValidWaitingRoom() {
  const moderationClient = useSharedModerationClient({
    onCommand: Controller(useHistory()),
  });

  switch (moderationClient.state) {
    case ReadyStates.idle:
      return <NotConnected />;
    case ReadyStates.done:
      return <Disconnected />;
    case ReadyStates.loading:
      return <Connecting />;
    case ReadyStates.crashed:
      return <ServerCrashed />;
    default:
      break;
  }
  switch (moderationClient.registration.state) {
    case ReadyStates.idle:
    case ReadyStates.loading:
      return <Registering />;
    case ReadyStates.crashed:
      return (
        <RegistrationCrashed error={moderationClient.registration.error} />
      );
    case ReadyStates.ready:
      return <Ready />;
    default:
      throw new Error(
        `Unexpected state: ${moderationClient.registration.state}`
      );
  }
}
