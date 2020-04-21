import React, { useRef, useMemo, useState } from "react";
import Experiment, { registerTask } from "@hcikit/workflow";
import { registerAll } from "@hcikit/tasks";
import { TaskTypes, Devices, ReadyStates } from "../common/constants";
import ResetDialog from "../common/components/ResetDialog";
import configLaptop from "./configuration-laptop.json";
import configPhone from "./configuration-phone.json";
import configTablet from "./configuration-tablet.json";
import Crashed from "../common/components/Crashed";
import TypingSpeedTask from "./TypingSpeedTask";
import { WordSuggestionsProvider } from "../experiment/wordSuggestions/wordSuggestions";
import UploadTask from "../experiment/components/UploadTask";
import InjectEnd from "../experiment/components/InjectEnd";
import ResultsTask from "./ResultsTask";
import useBodyBackgroundColor from "../common/hooks/useBodyBackgroundColor";
import MeasureDisplayTask from "./MeasureDisplayTask";
import {
  ModerationClientProvider,
  useSharedModerationClient,
} from "../common/contexts/ModerationClient";
import Loading from "../common/components/Loading";
import useLocationParams from "../common/hooks/useLocationParams";

registerAll(registerTask);
registerTask(TaskTypes.injectEnd, InjectEnd);
registerTask(TaskTypes.measureDisplay, MeasureDisplayTask);
registerTask(TaskTypes.s3Upload, UploadTask);
registerTask(TaskTypes.typingSpeedTask, TypingSpeedTask);
registerTask(TaskTypes.results, ResultsTask);

const useConfig = () => {
  const { participant, device, isTest } = useLocationParams();
  const { current: startDate } = useRef(new Date());

  return useMemo(() => {
    let baseConfig;
    switch (device) {
      case Devices.phone:
        baseConfig = configPhone;
        break;
      case Devices.tablet:
        baseConfig = configTablet;
        break;
      case Devices.laptop:
        baseConfig = configLaptop;
        break;
      default:
        throw new Error(`Unknown device: ${device}`);
    }
    // Add the target filename for every upload tasks.
    return {
      ...baseConfig,
      isTest,
      participant,
      startDate,
      [TaskTypes.s3Upload]: {
        filename:
          process.env.NODE_ENV === "development"
            ? `typing-dev/${participant}-typing-${device}-${startDate.toISOString()}.json`
            : `typing-prod/${participant}-typing-${device}-${startDate.toISOString()}.json`,
      },
    };
  }, [device, isTest, participant, startDate]);
};

function ReadyTypingTest() {
  const config = useConfig();
  const moderationClient = useSharedModerationClient();
  const { reset } = useLocationParams();
  const [askReset, setAskReset] = useState(reset != null && reset);

  switch (moderationClient.state) {
    case ReadyStates.ready:
    case ReadyStates.crashed:
    case ReadyStates.done:
      if (askReset) {
        return (
          <>
            <Loading>Managing state...</Loading>
            <ResetDialog
              open
              moderationClient={moderationClient}
              onClose={() => {
                setAskReset(false);
              }}
            />
          </>
        );
      }
      return <Experiment configuration={config} />;
    case ReadyStates.idle:
    case ReadyStates.loading:
      return (
        <>
          <Loading>Connecting to moderation...</Loading>
          <ResetDialog open={false} onClose={() => setAskReset(false)} />
        </>
      );
    default:
      throw new Error(`Unexpected state ${moderationClient.state}`);
  }
}

export default function TypingTest() {
  useBodyBackgroundColor("#EEE");

  const { participant, device, isTest } = useLocationParams();

  if (device == null || participant == null || isTest == null) {
    return <Crashed>Invalid page arguments</Crashed>;
  }

  return (
    <WordSuggestionsProvider>
      <ModerationClientProvider
        isRegistered
        info={{ participant, device, activity: "typing-test", isTest }}
      >
        <ReadyTypingTest />
      </ModerationClientProvider>
    </WordSuggestionsProvider>
  );
}
