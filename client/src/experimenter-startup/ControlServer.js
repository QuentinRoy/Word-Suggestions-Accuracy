import React, { useState } from "react";
import ControlServerLogin from "./ControlServerLogin";
import ControlServerForm from "./ControlServerForm";

export default function ControlServer() {
  const [isConnected, setIsConnected] = useState(null);

  if (isConnected) {
    return <ControlServerForm />;
  }

  return (
    <ControlServerLogin
      onLogin={() => {
        setIsConnected(true);
      }}
    />
  );
}
ControlServer.propTypes = {};
