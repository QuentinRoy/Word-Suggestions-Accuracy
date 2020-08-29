import React from "react";
import PropTypes from "prop-types";

import { ReadyStates } from "../common/constants";
import Loading from "../common/components/Loading";
import style from "./ValidWaitingRoom.module.css";
import SetupSummary from "./SetupSummary";
import { useClientInfo } from "./ClientInfo";
import { useModeration } from "../common/moderation/Moderation";

// eslint-disable-next-line react/prop-types
function ConnectionError({ buttonLabel = "Retry", children }) {
  const { reconnect } = useModeration();
  const { participant, device } = useClientInfo();
  return (
    <>
      <SetupSummary participant={participant} device={device} />
      <div className={style.error}>
        <span>{children}</span>
        <button
          type="button"
          className={style.reconnectButton}
          onClick={() => reconnect()}
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

export default function ValidWaitingRoom() {
  const moderationClient = useModeration();

  switch (moderationClient.readyState) {
    case ReadyStates.idle:
      return <NotConnected />;
    case ReadyStates.done:
      return <Disconnected />;
    case ReadyStates.loading:
      return <Connecting />;
    case ReadyStates.crashed:
      return <ServerCrashed />;
    case ReadyStates.ready:
      return <Ready />;
    default:
      throw new Error(`Unexpected state: ${moderationClient.state}`);
  }
}
