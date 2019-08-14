import React from "react";
import Experiment, { registerTask } from "@hcikit/workflow";
import { registerAll, createUpload } from "@hcikit/tasks";
import { isMobileOnly } from "react-device-detect";
import TypingTask from "./TypingTask";
import useConfiguration from "../hooks/useConfiguration";
import DictionaryProvider from "../hooks/useDictionary";
import Loading from "../../utils/Loading";
import Crashed from "../../utils/Crashed";
import { LoadingStates, TaskTypes } from "../../utils/constants";
import createS3Uploader from "../s3Uploader";
import EndExperiment from "./EndExperiment";
import Startup from "./Startup";
import EndQuestionnaire from "./EndQuestionnaire";

const UploadComponent = createUpload(
  createS3Uploader(
    "us-east-2",
    "us-east-2:5e4b7193-2a48-42b9-be38-de801a857b26",
    "exii-accuracy-control-uploads"
  )
);

registerAll(registerTask);
registerTask(TaskTypes.typingTask, TypingTask);
registerTask(TaskTypes.s3Upload, UploadComponent);
registerTask(TaskTypes.endExperiment, EndExperiment);
registerTask(TaskTypes.startup, Startup);
registerTask(TaskTypes.endQuestionnaire, EndQuestionnaire);

export default function ExperimentWrapper() {
  const [loadingState, configuration] = useConfiguration();
  if (isMobileOnly) {
    return <Crashed>This experiment is not available on mobile device</Crashed>;
  }

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
    return <Crashed>HIT information missing or incorrect...</Crashed>;
  }

  return <Crashed>Failed to load the experiment...</Crashed>;
}
