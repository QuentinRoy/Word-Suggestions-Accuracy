import React from "react";
import Experiment, { registerTask } from "@hcikit/workflow";
import { registerAll } from "@hcikit/tasks";
import App from "./App";
import KeyboardSelector from "./KeyboardSelector";

import configuration from "./configuration";

registerAll(registerTask);
registerTask("App", App);
registerTask("KeyboardSelector", KeyboardSelector);

export default function ExperimentsWrapper() {
  return <Experiment configuration={configuration} />;
}
