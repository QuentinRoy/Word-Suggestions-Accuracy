import React, { useReducer } from "react";
import { CircularProgress } from "@material-ui/core";
import ConfigForm from "../common/components/ConfigForm";
import useControlClient from "./useControlClient";
import { LoadingStates } from "../common/constants";
import style from "./ParticipantStartup.module.css";

const reducer = (state, action) => {
  switch (action.type) {
    case "submit":
      return {
        ...state,
        participant: action.participant,
        device: action.device,
        isEditing: false,
        isServerUpdating: true,
      };
    case "edit":
      return { ...state, isEditing: true };
    case "crash":
      return { ...state, error: action.error };
    case "server-updated":
      return { ...state, isServerUpdating: false };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
};

// eslint-disable-next-line react/prop-types
function Wrapper({ children }) {
  return (
    <div className={style.wrapper}>
      <div className={style.wrapperContent}>{children}</div>
    </div>
  );
}

export default function ParticipantStartup() {
  const [
    { participant, device, isEditing, error },
    dispatch,
  ] = useReducer(reducer, { isEditing: true });

  const controlServer = useControlClient();

  const handleSubmit = (values, { setSubmitting }) => {
    setSubmitting(true);
    dispatch({ ...values, type: "submit" });
    controlServer
      .setParameters(values)
      .then(() => dispatch({ type: "server-updated" }))
      .catch((err) => dispatch({ type: "crash", error: err }));
  };

  const handleEdit = () => {
    dispatch({ type: "edit" });
    controlServer
      .clearParameters()
      .catch((err) => dispatch({ type: "crash", error: err }));
  };

  if (error != null) {
    return <Wrapper>Something went wrong: {error.message}</Wrapper>;
  }

  let content;
  if (isEditing) {
    content = (
      <ConfigForm
        onSubmit={handleSubmit}
        initialValues={{ participant, device }}
        enabledFields={["participant", "device"]}
        canSubmit={controlServer.state === LoadingStates.loaded}
      />
    );
  } else {
    content = (
      <>
        <p>Participant Id: {participant}</p>
        <p>Device: {device}</p>
        <p>
          <button type="button" onClick={handleEdit}>
            edit
          </button>
        </p>
      </>
    );
  }

  return (
    <Wrapper>
      {content}
      {controlServer.state === LoadingStates.loading && <CircularProgress />}
    </Wrapper>
  );
}
