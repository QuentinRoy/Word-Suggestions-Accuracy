import React from "react";
import PreviousState from "./PreviousState";
import StartForm from "./StartForm";
import Area from "./Area";

export default function LocalModeration() {
  return (
    <>
      <Area>
        <PreviousState />
      </Area>
      <Area>
        <StartForm />
      </Area>
    </>
  );
}
