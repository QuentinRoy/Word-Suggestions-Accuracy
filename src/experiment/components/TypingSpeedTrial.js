import React from "react";
import Trial from "./Trial";

const TypingSpeedTrial = ({ ...props }) => {
  return (
    <Trial
      keyStrokeDelay={0}
      id="TypingSpeedTrial"
      suggestionCount={0}
      {...props}
    />
  );
};

export default TypingSpeedTrial;
