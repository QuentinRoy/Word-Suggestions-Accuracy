import React from "react";
import Experiment, { registerTask } from "@hcikit/workflow";
import { registerAll, createUpload } from "@hcikit/tasks";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core";
import TypingTask from "./TypingTask";
import useConfiguration from "../hooks/useConfiguration";
import Loading from "../../utils/Loading";
import Crashed from "../../utils/Crashed";
import {
  LoadingStates,
  TaskTypes,
  dictionaryPath
} from "../../utils/constants";
import createS3Uploader from "../s3Uploader";
import EndExperiment from "./EndExperiment";
import Startup from "./Startup";
import EndQuestionnaire from "./EndQuestionnaire";
import BlockQuestionnaire from "./BlockQuestionnaire";
import StartQuestionnaire from "./StartQuestionnaire";
import Tutorial from "./Tutorial";
import ConsentForm from "./ConsentForm";
import FinalFeedbacks from "./FinalFeedbacks";
import InjectEnd from "./InjectEnd";
import { WordSuggestionsEngineProvider } from "../wordSuggestions/wordSuggestionsContext";

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
registerTask(TaskTypes.blockQuestionnaire, BlockQuestionnaire);
registerTask(TaskTypes.startQuestionnaire, StartQuestionnaire);
registerTask(TaskTypes.tutorial, Tutorial);
registerTask(TaskTypes.consentForm, ConsentForm);
registerTask(TaskTypes.finalFeedbacks, FinalFeedbacks);
registerTask(TaskTypes.injectEnd, InjectEnd);

const urlParams = new URL(document.location).searchParams;
const configArgs = {
  participant: urlParams.get("participant"),
  device: urlParams.get("device"),
  isTest: urlParams.get("isTest"),
  config: urlParams.get("config")
};

function ExperimentContent() {
  const [loadingState, configuration] = useConfiguration(configArgs);

  if (loadingState === LoadingStates.loading) {
    return <Loading>Loading experiment...</Loading>;
  }
  if (loadingState === LoadingStates.loaded) {
    return (
      <WordSuggestionsEngineProvider
        dictionaryPath={dictionaryPath}
        loadingMessage="Loading experiment's data..."
        crashedMessage="Failed to load the experiment's data..."
      >
        <Experiment configuration={configuration} />
      </WordSuggestionsEngineProvider>
    );
  }
  if (loadingState === LoadingStates.invalidArguments) {
    return <Crashed>HIT information missing or incorrect...</Crashed>;
  }

  return <Crashed>Failed to load the experiment...</Crashed>;
}

// Change Material-ui default font for their widgets. It is using a font that
// is not included by default.
const theme = createMuiTheme({
  typography: {
    fontFamily: ['"Helvetica Neue"', "sans-serif"].join(",")
  }
});

export default function ExperimentWrapper() {
  return (
    <ThemeProvider theme={theme}>
      <ExperimentContent />
    </ThemeProvider>
  );
}
