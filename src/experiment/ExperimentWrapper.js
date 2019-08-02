import React from "react";
import Experiment, { registerTask } from "@hcikit/workflow";
import { registerAll } from "@hcikit/tasks";
import TypingTask from "./TypingTask";
import KeyboardSelector from "./KeyboardSelector";
import useConfiguration from "./useConfiguration";
import DictionaryProvider from "./useDictionary";
import Loading from "../utils/Loading";
import Crashed from "../utils/Crashed";
import Login from "./Login";
import { LoadingStates } from "../utils/constants";

registerAll(registerTask);
registerTask("TypingTask", TypingTask);
registerTask("KeyboardSelector", KeyboardSelector);
registerTask("LoginScreen", Login);

export default function ExperimentWrapper() {
  const [loadingState, configuration] = useConfiguration();

  if (loadingState === LoadingStates.loading) {
    return <Loading>Loading experiment...</Loading>;
  }
  if (loadingState === LoadingStates.loaded) {
    return (
      <DictionaryProvider>
        <Experiment configuration={configuration} />
      </DictionaryProvider>
    );
  }
  if (loadingState === LoadingStates.invalidArguments) {
    return <Crashed>HIT information missing...</Crashed>;
  }

  return <Crashed>Failed to load the experiment...</Crashed>;
}