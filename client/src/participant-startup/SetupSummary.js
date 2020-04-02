import React from "react";
import PropTypes from "prop-types";
import { Devices } from "../common/constants";

export default function SetupSummary({ participant, device, onEdit }) {
  return (
    <>
      <p>Participant Id: {participant}</p>
      <p>Device: {device}</p>
      <p>
        <button type="button" onClick={onEdit}>
          Change
        </button>
      </p>
    </>
  );
}
SetupSummary.propTypes = {
  onEdit: PropTypes.func.isRequired,
  participant: PropTypes.string.isRequired,
  device: PropTypes.oneOf(Object.values(Devices)).isRequired,
};
