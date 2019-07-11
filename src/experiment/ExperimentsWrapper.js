import React from "react";
import Experiment, { registerTask } from "@hcikit/workflow";
import { registerAll } from "@hcikit/tasks";
import TypingTask from "./TypingTask";
import KeyboardSelector from "./KeyboardSelector";
import useConfiguration from "./useConfiguration";

registerAll(registerTask);
registerTask("TypingTask", TypingTask);
registerTask("KeyboardSelector", KeyboardSelector);

export default function ExperimentsWrapper() {
  const configuration = useConfiguration();
  if (configuration === "loading") {
    return <div>Loading corpus...</div>;
  }
  if (configuration === "crashed") {
    return <div>Loading corpus crashed...</div>;
  }
  return <Experiment configuration={configuration} />;
}
