import React, { useReducer } from "react";
import ConfigForm from "../common/components/ConfigForm";

const reducer = (state, action) => {
  switch (action.type) {
    case "submit":
      return {
        ...state,
        participant: action.participant,
        device: action.device,
        isEditing: false,
      };
    case "edit":
      return { ...state, isEditing: true };
    default:
      throw new Error(`Unknown action: ${action.type}`);
  }
};

export default function ParticipantStartup() {
  const [{ participant, device, isEditing }, dispatch] = useReducer(reducer, {
    isEditing: true,
  });

  if (isEditing) {
    return (
      <ConfigForm
        onSubmit={(values, { setSubmitting }) => {
          setSubmitting(true);
          dispatch({ ...values, type: "submit" });
        }}
        initialValues={{ participant, device }}
        enabledFields={["participant", "device"]}
      />
    );
  }

  return (
    <div>
      <p>Participant Id: {participant}</p>
      <p>Device: {device}</p>
      <button
        type="button"
        onClick={() => {
          dispatch({ type: "edit" });
        }}
      >
        edit
      </button>
    </div>
  );
}
