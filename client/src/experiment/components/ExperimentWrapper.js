import React, { useState } from "react";
import Experiment, { registerTask } from "@hcikit/workflow";
import { registerAll } from "@hcikit/tasks";
import { ThemeProvider } from "@material-ui/styles";
import {
  createMuiTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@material-ui/core";
import TypingTask from "./TypingTask";
import useConfiguration from "../hooks/useConfiguration";
import Loading from "../../common/components/Loading";
import Crashed from "../../common/components/Crashed";
import { ReadyStates, TaskTypes } from "../../common/constants";
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
import useBodyBackgroundColor from "../../common/hooks/useBodyBackgroundColor";
import getEndPoints from "../../common/utils/endpoints";
import useAsync from "../../common/hooks/useAsync";
import useLocationParams from "../../common/hooks/useLocationParams";

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

// eslint-disable-next-line react/prop-types
function ResetDialog({ onClose, open }) {
  return (
    <Dialog open={open}>
      <DialogTitle>Reset State</DialogTitle>
      <DialogContent>
        Are you sure you do not want to resume the previous experiment?
        <br />
        All unsaved data will be lost.
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            localStorage.removeItem("state");
            onClose();
          }}
          color="secondary"
        >
          Clear State
        </Button>
        <Button
          autoFocus
          onClick={() => {
            onClose();
          }}
          color="primary"
        >
          Resume Experiment
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ExperimentContent() {
  useBodyBackgroundColor("#EEE");
  const configArgs = useLocationParams();
  const [isAskingReset, setIsAskingReset] = useState(configArgs.reset);
  const [configLoadingState, configuration, error] = useConfiguration(
    configArgs
  );
  const { loadingState: suggestionsLoadingState } = useSuggestions();

  if (isAskingReset) {
    return <ResetDialog open onClose={() => setIsAskingReset(false)} />;
  }

  if (
    configLoadingState === ReadyStates.loading ||
    configLoadingState === ReadyStates.idle
  ) {
    return <Loading>Loading experiment...</Loading>;
  }
  if (suggestionsLoadingState === ReadyStates.loading) {
    return <Loading>Loading suggestions...</Loading>;
  }
  if (
    configLoadingState === ReadyStates.ready &&
    suggestionsLoadingState === ReadyStates.ready
  ) {
    return <Experiment configuration={configuration} />;
  }
  if (configLoadingState === ReadyStates.crashed) {
    return <Crashed>Failed to load the experiment: {error.message}</Crashed>;
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
  const [endPointsLoadingState, endpoints] = useAsync(getEndPoints);

  if (endPointsLoadingState === ReadyStates.crashed) {
    return (
      <ThemeProvider theme={theme}>
        <Crashed>
          Could not retrieve the address of the suggestion engine...
        </Crashed>
      </ThemeProvider>
    );
  }

  if (endPointsLoadingState !== ReadyStates.ready) {
    return (
      <ThemeProvider theme={theme}>
        <Loading />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <WordSuggestionsProvider serverAddress={endpoints.suggestionServer}>
        <div className={main}>
          <ExperimentContent />
        </div>
      </WordSuggestionsProvider>
    </ThemeProvider>
  );
}
