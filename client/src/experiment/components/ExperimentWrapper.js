import React from "react";
import Experiment, { registerTask } from "@hcikit/workflow";
import { registerAll } from "@hcikit/tasks";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core";
import TypingTask from "./TypingTask";
import useConfiguration from "../hooks/useConfiguration";
import Loading from "../../common/components/Loading";
import Crashed from "../../common/components/Crashed";
import {
  LoadingStates,
  TaskTypes,
  suggestionServerAddress,
} from "../../common/constants";
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
  useSuggestions,
} from "../wordSuggestions/wordSuggestions";
import { main } from "./styles/ExperimentWrapper.module.css";
import UploadTask from "./UploadTask";
import useBodyBackgroundColor from "../hooks/useBodyBackgroundColor";

registerAll(registerTask);
registerTask(TaskTypes.typingTask, TypingTask);
registerTask(TaskTypes.s3Upload, UploadTask);
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
  reset: urlParams.get("reset"),
};

if (
  configArgs.reset &&
  // eslint-disable-next-line no-alert
  window.confirm(
    "Are you sure you do not want to resume the previous experiment? All unsaved data will be lost."
  )
) {
  // This is the key used by hci kit.
  localStorage.removeItem("state");
}

function ExperimentContent() {
  useBodyBackgroundColor("#EEE");
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
    fontFamily: '"Helvetica Neue", "sans-serif"',
  },
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
