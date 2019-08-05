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

const generateTasks = corpus => {
  const tasks = [];

  // Insert practice-related tasks.
  if (numberOfPracticeTasks > 0) {
    tasks.push({
      task: "InformationScreen",
      content: "The 5 following tasks are practice tasks",
      shortcutEnabled: true,
      key: `${tasks.length}`
    });
    tasks.push(
      ...corpus
        .slice(0, numberOfPracticeTasks)
        .map((sentenceData, i) =>
          TypingTask(`${tasks.length + i}`, true, sentenceData)
        )
    );
    tasks.push({
      task: "InformationScreen",
      content: "Practice is over, the real experiment begins here",
      key: `${tasks.length}`
    });
  }

  // Insert measured tasks.
  tasks.push(
    ...corpus
      .slice(numberOfPracticeTasks, numberOfPracticeTasks + numberOfTypingTasks)
      .map((sentenceData, i) =>
        TypingTask(`${tasks.length + i}`, true, sentenceData)
      )
  );

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
        children: generateTasks(corpus)
      };
    }
    return null;
  }, [loadingState, corpus]);
  return participant == null
    ? [LoadingStates.invalidArguments, null]
    : [loadingState, config];
};

export default useConfiguration;
