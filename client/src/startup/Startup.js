import React, { useEffect } from "react";

import PreviousState from "./PreviousState";
import StartForm from "./StartForm";

// eslint-disable-next-line react/prop-types
const Area = ({ children }) => (
  <div
    style={{
      width: "500px",
      borderStyle: "solid",
      borderColor: "#DDD",
      padding: "0 1em",
      borderRadius: "5px",
      borderWidth: "1px",
      margin: "1em",
      backgroundColor: "white"
    }}
  >
    {children}
  </div>
);

const Startup = () => {
  useEffect(() => {
    const prevColor = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#EEE";
    return () => {
      document.body.style.backgroundColor = prevColor;
    };
  }, []);
  return (
    <div
      style={{
        boxSizing: "border-box",
        justifyContent: "center",
        alignItems: "self-start",
        display: "flex",
        padding: "1em",
        width: "100%",
        flexWrap: "wrap"
      }}
    >
      <Area>
        <PreviousState />
      </Area>
      <Area>
        <StartForm />
      </Area>
    </div>
  );
};

export default Startup;
