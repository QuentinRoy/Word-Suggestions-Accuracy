import React from "react";
import Experiment, { registerTask } from "@hcikit/workflow";
import { registerAll } from "@hcikit/tasks";
import App from "./App";

import configuration from "./configuration";

registerAll(registerTask);
registerTask("App", App);

export default function ExperimentsWrapper() {
  return <Experiment configuration={configuration} />;
}
