import React from "react";
import Experiment, { registerTask } from "@hcikit/workflow";
import { registerAll, createUpload } from "@hcikit/tasks";
import TypingTask from "./TypingTask";
import useConfiguration from "./useConfiguration";
import DictionaryProvider from "./useDictionary";
import Loading from "../utils/Loading";
import Crashed from "../utils/Crashed";
import { LoadingStates } from "../utils/constants";
import createS3Uploader from "./s3Uploader";

const UploadComponent = createUpload(
  createS3Uploader(
    "us-east-2",
    "us-east-2:5e4b7193-2a48-42b9-be38-de801a857b26",
    "exii-accuracy-control-uploads"
  )
);

registerAll(registerTask);
registerTask("TypingTask", TypingTask);
registerTask("S3Upload", UploadComponent);

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
