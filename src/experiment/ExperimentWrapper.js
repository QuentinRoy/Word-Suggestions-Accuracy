import React from "react";
import Experiment, { registerTask } from "@hcikit/workflow";
import { registerAll } from "@hcikit/tasks";
import TypingTask from "./TypingTask";
import KeyboardSelector from "./KeyboardSelector";
import useConfiguration from "./useConfiguration";
import DictionaryProvider, { LOADING, CRASHED } from "./useDictionary";
import Loading from "../utils/Loading";
import Crashed from "../utils/Crashed";
import Login from "./Login";

registerAll(registerTask);
registerTask("TypingTask", TypingTask);
registerTask("KeyboardSelector", KeyboardSelector);
registerTask("LoginScreen", Login);

export default function ExperimentWrapper() {
  const [loadingState, configuration] = useConfiguration(1, 2);

  if (loadingState === LOADING) {
    return <Loading>Loading experiment...</Loading>;
  }
  if (loadingState === CRASHED) {
    return <Crashed>Failed to load the experiment...</Crashed>;
  }

  return (
    <DictionaryProvider>
      <Experiment configuration={configuration} />
    </DictionaryProvider>
  );
}
