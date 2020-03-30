import React, { useRef, useMemo } from "react";
import Experiment, { registerTask } from "@hcikit/workflow";
import { registerAll } from "@hcikit/tasks";
import { TaskTypes, Devices } from "../common/constants";
import configLaptop from "./configuration-laptop.json";
import configPhone from "./configuration-phone.json";
import Crashed from "../common/components/Crashed";
import TypingSpeedTask from "./TypingSpeedTask";
import { WordSuggestionsProvider } from "../experiment/wordSuggestions/wordSuggestions";
import UploadTask from "../experiment/components/UploadTask";
import InjectEnd from "../experiment/components/InjectEnd";
import ResultsTask from "./ResultsTask";
import useBodyBackgroundColor from "../common/hooks/useBodyBackgroundColor";

registerAll(registerTask);
registerTask(TaskTypes.injectEnd, InjectEnd);
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

const baseConfig = {
  ...(device === Devices.phone ? configPhone : configLaptop),
  isTest,
  participant,
};

// Add the target filename for every upload tasks.
const filename =
  process.env.NODE_ENV === "development"
    ? `typing-dev/${participant}-typing-${device}-${new Date().toISOString()}.json`
    : `typing-prod/${participant}-typing-${device}-${new Date().toISOString()}.json`;
baseConfig.children = baseConfig.children.map((c) =>
  c.task === TaskTypes.s3Upload ? { ...c, filename } : c
);

export default function TypingTest() {
  const startDate = useRef(new Date());
  const config = useMemo(
    () => ({ ...baseConfig, startDate: startDate.current }),
    []
  );
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
