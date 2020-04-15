import React, { useRef, useMemo } from "react";
import Experiment, { registerTask } from "@hcikit/workflow";
import { registerAll } from "@hcikit/tasks";
import { TaskTypes, Devices } from "../common/constants";
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

registerAll(registerTask);
registerTask(TaskTypes.injectEnd, InjectEnd);
registerTask(TaskTypes.measureDisplay, MeasureDisplayTask);
registerTask(TaskTypes.s3Upload, UploadTask);
registerTask(TaskTypes.typingSpeedTask, TypingSpeedTask);
registerTask(TaskTypes.results, ResultsTask);

const urlParams = new URL(document.location).searchParams;
const participant = urlParams.get("participant");
const device = urlParams.get("device");
const reset = urlParams.get("reset");
let isTest = urlParams.get("isTest");

if (isTest != null) {
  if (isTest.toLowerCase() === "true") isTest = true;
  else if (isTest.toLowerCase() === "false") isTest = false;
  else isTest = null;
}

if (
  reset &&
  // eslint-disable-next-line no-alert
  window.confirm(
    "Are you sure you do not want to resume the previous test? All unsaved data will be lost."
  )
) {
  // This is the key used by hci kit.
  localStorage.removeItem("state");
}

const getConfig = (startDate) => {
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
};

export default function TypingTest() {
  const startDate = useRef(new Date());
  const config = useMemo(() => getConfig(startDate.current), []);
  useBodyBackgroundColor("#EEE");
  if (device == null || participant == null || isTest == null) {
    return <Crashed>Invalid page arguments</Crashed>;
  }
  return (
    <WordSuggestionsProvider>
      <Experiment configuration={config} />
    </WordSuggestionsProvider>
  );
}
