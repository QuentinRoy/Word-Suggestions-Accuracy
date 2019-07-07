import React from "react";
import Experiment, { registerTask } from "@hcikit/workflow";
import { registerAll } from "@hcikit/tasks";
import TypingTask from "./TypingTask";
import KeyboardSelector from "./KeyboardSelector";

import configuration from "./configuration";

registerAll(registerTask);
registerTask("TypingTask", TypingTask);
registerTask("KeyboardSelector", KeyboardSelector);

export default function ExperimentsWrapper() {
  return <Experiment configuration={configuration} />;
}
