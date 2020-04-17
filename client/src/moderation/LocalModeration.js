import React from "react";
import PreviousState from "./PreviousState";
import StartForm from "./StartForm";
import Area from "../common/components/Area";

export default function LocalModeration() {
  return (
    <>
      <Area width={500}>
        <PreviousState />
      </Area>
      <Area width={500}>
        <StartForm />
      </Area>
    </>
  );
}
