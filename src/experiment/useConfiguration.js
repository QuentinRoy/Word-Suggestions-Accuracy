import { useMemo } from "react";
import useCorpusFromJson from "./useCorpusFromJson";
import { KeyboardLayouts, LoadingStates } from "../utils/constants";

const defaultAccuracies = [0, 0.25, 0.5, 0.75, 1];
const defaultKeyStrokeDelays = [0, 250, 500, 750, 1000];
const numberOfPracticeTasks = 1;
const numberOfTypingTasks = 2;
const keyboardLayout = KeyboardLayouts.desktop;

const PageArguments = {
  targetAccuracies: "targetAccuracies",
  workerId: "workerId",
  keyStrokeDelays: "keyStrokeDelays"
};

const getPageArguments = () => {
  const urlParams = new URL(document.location).searchParams;
  const workerId = urlParams.get(PageArguments.workerId);
  const keyStrokeDelays = urlParams.has(PageArguments.keyStrokeDelays)
    ? urlParams
        .get(PageArguments.keyStrokeDelays)
        .split(",")
        .map(x => +x)
    : defaultKeyStrokeDelays;
  const targetAccuracies = urlParams.has(PageArguments.targetAccuracies)
    ? urlParams
        .get(PageArguments.targetAccuracies)
        .split(",")
        .map(x => +x)
    : defaultAccuracies;
  const args = {
    participant: workerId,
    keyStrokeDelay:
      keyStrokeDelays[Math.floor(Math.random() * keyStrokeDelays.length)],
    targetAccuracy:
      targetAccuracies[Math.floor(Math.random() * targetAccuracies.length)]
  };
  return args;
};

const { participant, targetAccuracy, keyStrokeDelay } = getPageArguments();

const TypingTask = (id, isPractice, { words, ...distributionInfo }) => ({
  ...distributionInfo,
  task: "TypingTask",
  sksDistribution: words,
  key: id,
  id,
  isPractice
});

const UploadLogS3 = (id, fireAndForget, participantId) => ({
  task: "S3Upload",
  filename: `${participantId}-${new Date().toISOString()}-log.json`,
  key: id,
  fireAndForget
});

const generateTasks = corpus => {
  const tasks = [];

  // Insert practice-related tasks.
  if (numberOfPracticeTasks > 0) {
    tasks.push({
      task: "InformationScreen",
      content: `The ${numberOfPracticeTasks} following tasks are practice tasks`,
      shortcutEnabled: true,
      key: `${tasks.length}`
    });
    for (let i = 0; i < numberOfPracticeTasks; i += 1) {
      tasks.push(UploadLogS3(`${tasks.length}`, true, participant));
      tasks.push(
        TypingTask(
          `${tasks.length}`,
          true,
          corpus.slice(0, numberOfPracticeTasks)[i]
        )
      );
    }
    tasks.push({
      task: "InformationScreen",
      content: "Practice is over, the real experiment begins here",
      key: `${tasks.length}`
    });
  }

  // Insert measured tasks.
  for (let j = 0; j < numberOfTypingTasks; j += 1) {
    tasks.push(UploadLogS3(`${tasks.length}`, true, participant));
    tasks.push(
      TypingTask(
        `${tasks.length}`,
        true,
        corpus.slice(
          numberOfPracticeTasks,
          numberOfPracticeTasks + numberOfTypingTasks
        )[j]
      )
    );
  }

  tasks.push(UploadLogS3(`${tasks.length}`, false, participant));

  return tasks;
};

const useConfiguration = () => {
  const [loadingState, corpus] = useCorpusFromJson(targetAccuracy);
  const config = useMemo(() => {
    if (loadingState === LoadingStates.loaded) {
      return {
        keyStrokeDelay,
        targetAccuracy,
        participant,
        keyboardLayout,
        children: generateTasks(corpus),
        gitSha: process.env.REACT_APP_GIT_SHA,
        version: process.env.REACT_APP_VERSION
      };
    }
    return null;
  }, [loadingState, corpus]);
  return participant == null
    ? [LoadingStates.invalidArguments, null]
    : [loadingState, config];
};

export default useConfiguration;
