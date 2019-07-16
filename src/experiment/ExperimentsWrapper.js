import React from "react";
import Experiment, { registerTask } from "@hcikit/workflow";
import { registerAll } from "@hcikit/tasks";
import TypingTask from "./TypingTask";
import KeyboardSelector from "./KeyboardSelector";
import useConfiguration from "./useConfiguration";
import DictionaryProvider, { LOADING, CRASHED } from "./useDictionary";
import Loading from "./Loading";

registerAll(registerTask);
registerTask("TypingTask", TypingTask);
registerTask("KeyboardSelector", KeyboardSelector);

export default function ExperimentsWrapper() {
  const [loadingState, configuration] = useConfiguration();

  if (loadingState === LOADING) {
    return <Loading />;
  }
  if (loadingState === CRASHED) {
    return <div>Loading corpus crashed...</div>;
  }

  return (
    <DictionaryProvider>
      <Experiment configuration={configuration} />
    </DictionaryProvider>
  );
}
