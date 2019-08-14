import { useMemo } from "react";
import short from "short-uuid";
import useCorpusFromJson from "./useCorpusFromJson";
import {
  LoadingStates,
  TaskTypes,
  numberOfPracticeTasks,
  numberOfTypingTasks
} from "../../utils/constants";

const defaultAccuracies = [0, 0.25, 0.5, 0.75, 1];
const defaultKeyStrokeDelays = [0, 100, 200, 300, 400];

const uuid = short.uuid();

const PageArguments = {
  targetAccuracies: "targetAccuracies",
  workerId: "workerId",
  keyStrokeDelays: "keyStrokeDelays",
  assignmentId: "assignmentId",
  hitId: "hitId"
};

const {
  participant,
  targetAccuracy,
  keyStrokeDelay,
  ...otherPageArgs
} = (() => {
  const urlParams = new URL(document.location).searchParams;
  const workerId = urlParams.get(PageArguments.workerId);
  const assignmentId = urlParams.get(PageArguments.assignmentId);
  const hitId = urlParams.get(PageArguments.hitId);
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
  return {
    assignmentId,
    hitId,
    participant: workerId,
    keyStrokeDelay:
      keyStrokeDelays[Math.floor(Math.random() * keyStrokeDelays.length)],
    targetAccuracy:
      targetAccuracies[Math.floor(Math.random() * targetAccuracies.length)]
  };
})();

const TypingTask = (id, isPractice, { words, ...distributionInfo }) => ({
  ...distributionInfo,
  task: TaskTypes.typingTask,
  sksDistribution: words,
  key: id,
  id,
  isPractice
});

const UploadLogS3 = (id, fireAndForget, participantId) => ({
  task: TaskTypes.s3Upload, // "S3Upload",
  filename: `${participantId}-${new Date().toISOString()}-log.json`,
  key: id,
  fireAndForget
});

const generateTasks = corpus => {
  const tasks = [];

  // tasks.push({
  //   task: TaskTypes.startup,
  //   key: `${tasks.length}`
  // });

  // Insert practice-related tasks.
  if (numberOfPracticeTasks > 0) {
    tasks.push({
      task: TaskTypes.informationScreen,
      content: "Continue with the practice tasks",
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
      task: TaskTypes.informationScreen,
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

  tasks.push({ task: TaskTypes.endQuestionnaire, key: `${tasks.length}` });
  tasks.push(UploadLogS3(`${tasks.length}`, false, participant));
  tasks.push({
    task: TaskTypes.endExperiment,
    uuid,
    key: `${tasks.length}`
  });

  return tasks;
};

const useConfiguration = () => {
  const [loadingState, corpus] = useCorpusFromJson(targetAccuracy);
  const config = useMemo(() => {
    if (loadingState === LoadingStates.loaded) {
      return {
        ...otherPageArgs,
        keyStrokeDelay,
        targetAccuracy,
        participant,
        children: generateTasks(corpus),
        gitSha: process.env.REACT_APP_GIT_SHA,
        version: process.env.REACT_APP_VERSION,
        participantUuid: uuid
      };
    }
    return null;
  }, [loadingState, corpus]);
  return participant == null
    ? [LoadingStates.invalidArguments, null]
    : [loadingState, config];
};

export default useConfiguration;
