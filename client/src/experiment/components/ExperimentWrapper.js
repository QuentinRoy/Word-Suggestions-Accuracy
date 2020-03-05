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
  suggestionServerAddress
} from "../../utils/constants";
import createS3Uploader from "../s3Uploader";
import EndExperiment from "./EndExperiment";
import Startup from "./Startup";
import BlockQuestionnaire from "./BlockQuestionnaire";
import DemographicQuestionnaire from "./DemographicQuestionnaire";
import Tutorial from "./Tutorial";
import ConsentForm from "./ConsentForm";
import FinalFeedbacks from "./FinalFeedbacks";
import InjectEnd from "./InjectEnd";
import {
  WordSuggestionsProvider,
  useSuggestions
} from "../wordSuggestions/wordSuggestions";
import { main } from "./styles/ExperimentWrapper.module.css";

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
registerTask(TaskTypes.blockQuestionnaire, BlockQuestionnaire);
registerTask(TaskTypes.demographicQuestionnaire, DemographicQuestionnaire);
registerTask(TaskTypes.tutorial, Tutorial);
registerTask(TaskTypes.consentForm, ConsentForm);
registerTask(TaskTypes.finalFeedbacks, FinalFeedbacks);
registerTask(TaskTypes.injectEnd, InjectEnd);

const urlParams = new URL(document.location).searchParams;
const configArgs = {
  participant: urlParams.get("participant"),
  device: urlParams.get("device"),
  isTest: urlParams.get("isTest"),
  config: urlParams.get("config"),
  reset: urlParams.get("reset")
};

if (
  configArgs.reset &&
  // eslint-disable-next-line no-alert
  window.confirm("Are you sure you want to clear previous state?")
) {
  // This is the key used by hci kit.
  localStorage.removeItem("state");
}

function ExperimentContent() {
  const [configLoadingState, configuration] = useConfiguration(configArgs);
  const { loadingState: suggestionsLoadingState } = useSuggestions();

  if (configLoadingState === LoadingStates.loading) {
    return <Loading>Loading experiment...</Loading>;
  }
  if (suggestionsLoadingState === LoadingStates.loading) {
    return <Loading>Loading suggestions...</Loading>;
  }
  if (
    configLoadingState === LoadingStates.loaded &&
    suggestionsLoadingState === LoadingStates.loaded
  ) {
    return <Experiment configuration={configuration} />;
  }
  if (configLoadingState === LoadingStates.invalidArguments) {
    return <Crashed>HIT information missing or incorrect...</Crashed>;
  }
  if (configLoadingState === LoadingStates.crashed) {
    return <Crashed>Failed to load the experiment...</Crashed>;
  }
  return (
    <Crashed>Something went wrong, probably the suggestion engine.</Crashed>
  );
}

// Change Material-ui default font for their widgets. It is using a font that
// is not included by default.
const theme = createMuiTheme({
  typography: {
    fontFamily: '"Helvetica Neue", "sans-serif"'
  }
});

export default function ExperimentWrapper() {
  return (
    <ThemeProvider theme={theme}>
      <WordSuggestionsProvider serverAddress={suggestionServerAddress}>
        <div className={main}>
          <ExperimentContent />
        </div>
      </WordSuggestionsProvider>
    </ThemeProvider>
  );
}
