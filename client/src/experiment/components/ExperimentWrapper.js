import React, { useState } from "react";
import Experiment, { registerTask } from "@hcikit/workflow";
import { InformationScreen } from "@hcikit/tasks";
import { ThemeProvider } from "@material-ui/styles";
import { createMuiTheme } from "@material-ui/core";
import TypingTask from "./TypingTask";
import useConfiguration from "../hooks/useConfiguration";
import Loading from "../../common/components/Loading";
import Crashed from "../../common/components/Crashed";
import { ReadyStates, TaskTypes, UserRoles } from "../../common/constants";
import EndExperiment from "./EndExperiment";
import Startup from "./Startup";
import BlockQuestionnaire from "./BlockQuestionnaire";
import DemographicQuestionnaire from "./DemographicQuestionnaire";
import Tutorial from "./Tutorial";
import FinalFeedbacks from "./FinalFeedbacks";
import InjectEnd from "./InjectEnd";
import {
  WordSuggestionsProvider,
  useSuggestions,
} from "../wordSuggestions/wordSuggestions";
import {
  ModerationProvider,
  useModeration,
} from "../../common/moderation/Moderation";
import UploadTask from "./UploadTask";
import useBodyBackgroundColor from "../../common/hooks/useBodyBackgroundColor";
import getEndPoints from "../../common/utils/endpoints";
import useAsync from "../../common/hooks/useAsync";
import useLocationParams from "../../common/hooks/useLocationParams";
import style from "./styles/ExperimentWrapper.module.css";
import SwitchDeviceInstruction from "./SwitchDeviceInstruction";
import ResetDialog from "../../common/components/ResetDialog";

registerTask(TaskTypes.informationScreen, InformationScreen);
registerTask(TaskTypes.typingTask, TypingTask);
registerTask(TaskTypes.s3Upload, UploadTask);
registerTask(TaskTypes.endExperiment, EndExperiment);
registerTask(TaskTypes.startup, Startup);
registerTask(TaskTypes.blockQuestionnaire, BlockQuestionnaire);
registerTask(TaskTypes.demographicQuestionnaire, DemographicQuestionnaire);
registerTask(TaskTypes.tutorial, Tutorial);
registerTask(TaskTypes.finalFeedbacks, FinalFeedbacks);
registerTask(TaskTypes.injectEnd, InjectEnd);
registerTask(TaskTypes.switchDevice, SwitchDeviceInstruction);

function ExperimentContent() {
  useBodyBackgroundColor("#EEE");
  const configArgs = useLocationParams();
  const [isAskingReset, setIsAskingReset] = useState(configArgs.reset);
  const [configLoadingState, configuration, error] = useConfiguration(
    configArgs
  );
  const { loadingState: suggestionsLoadingState } = useSuggestions();
  const moderationClient = useModeration();

  if (
    configLoadingState === ReadyStates.loading ||
    configLoadingState === ReadyStates.idle
  ) {
    return <Loading>Loading experiment...</Loading>;
  }
  if (moderationClient.readyState === ReadyStates.loading) {
    return <Loading>Connecting to experimenter...</Loading>;
  }
  if (isAskingReset) {
    return (
      <ResetDialog
        moderationClient={moderationClient}
        open={isAskingReset}
        onClose={() => setIsAskingReset(false)}
      />
    );
  }
  if (suggestionsLoadingState === ReadyStates.loading) {
    return <Loading>Connection to word suggestions...</Loading>;
  }
  if (
    configLoadingState === ReadyStates.ready &&
    suggestionsLoadingState === ReadyStates.ready
  ) {
    return <Experiment configuration={configuration} />;
  }
  if (configLoadingState === ReadyStates.crashed) {
    return (
      <Crashed>
        Failed to load the configuration of the experiment: {error.message}
      </Crashed>
    );
  }
  return (
    <Crashed>Something went wrong, probably the suggestion engine.</Crashed>
  );
}

// Change Material-ui default font for their widgets. It is using a font that
// is not included by default.
const theme = createMuiTheme({
  typography: { fontFamily: '"Helvetica Neue", "sans-serif"' },
});

export default function ExperimentWrapper() {
  const locationParams = useLocationParams();
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

  const suggestionServer =
    locationParams.suggestionServer == null ||
    locationParams.suggestionServer === ""
      ? endpoints.suggestionServer
      : locationParams.suggestionServer;

  return (
    <ThemeProvider theme={theme}>
      <WordSuggestionsProvider serverAddress={suggestionServer}>
        <ModerationProvider
          initConnection={{
            url: endpoints.controlServer,
            role: UserRoles.participant,
            info: { ...locationParams, activity: "experiment" },
          }}
        >
          <div className={style.main}>
            <ExperimentContent />
          </div>
        </ModerationProvider>
      </WordSuggestionsProvider>
    </ThemeProvider>
  );
}
