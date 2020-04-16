import React from "react";
import PropTypes from "prop-types";
import ControlServerForm from "./ControlServerForm";

const RemoteStartup = ({ clients, onStartApp }) => {
  return (
    <>
      <h2>Remote Startup</h2>
      <ControlServerForm clients={clients} startApp={onStartApp} />
    </>
  );
};

RemoteStartup.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  clients: PropTypes.any.isRequired,
  onStartApp: PropTypes.func.isRequired,
};

export default RemoteStartup;
