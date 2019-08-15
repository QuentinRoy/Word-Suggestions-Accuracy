import { useMemo } from "react";
import short from "short-uuid";
import useCorpusFromJson from "./useCorpusFromJson";
import {
  LoadingStates,
  TaskTypes,
  SuggestionTypes
} from "../../utils/constants";

const defaultAccuracies = [0, 0.25, 0.5, 0.75, 1];
const defaultKeyStrokeDelays = [0, 100, 200, 300, 400];
const totalSuggestions = 3;
const numberOfPracticeTasks = 3;
const numberOfTypingTasks = 20;
const numberOfTypingSpeedTasks = 3;
const confirmationCode = short.uuid();

const PageArguments = {
  targetAccuracies: "targetAccuracies",
  workerId: "workerId",
  keyStrokeDelays: "keyStrokeDelays",
  assignmentId: "assignmentId",
  hitId: "hitId",
  suggestionsType: "suggestionsType"
};

const {
  participant,
  targetAccuracy,
  keyStrokeDelay,
  suggestionsType,
  ...otherPageArgs
} = (() => {
  const urlParams = new URL(document.location).searchParams;
  const workerId = urlParams.get(PageArguments.workerId);
  const assignmentId = urlParams.get(PageArguments.assignmentId);
  const hitId = urlParams.get(PageArguments.hitId);
  const suggestionsParam = urlParams.get(PageArguments.suggestionsType);
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
    suggestionsType: suggestionsParam,
    keyStrokeDelay:
      keyStrokeDelays[Math.floor(Math.random() * keyStrokeDelays.length)],
    targetAccuracy:
      targetAccuracies[Math.floor(Math.random() * targetAccuracies.length)]
  };
})();

const TypingTask = (id, isPractice, { words, ...props }) => ({
  ...props,
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

  let totalPickedCorpusEntry = 0;
  const pickCorpusEntries = n => {
    const slice = corpus.slice(
      totalPickedCorpusEntry,
      totalPickedCorpusEntry + n
    );
    totalPickedCorpusEntry += n;
    return slice;
  };

  tasks.push({
    task: TaskTypes.startup,
    key: `${tasks.length}`
  });

  // Insert practice tasks.
  if (numberOfPracticeTasks > 0) {
    tasks.push({
      task: TaskTypes.informationScreen,
      content: "Continue with the practice tasks",
      shortcutEnabled: true,
      key: `${tasks.length}`
    });
    pickCorpusEntries(numberOfPracticeTasks).forEach(props => {
      tasks.push(UploadLogS3(`${tasks.length}`, true, participant));
      tasks.push(TypingTask(`practice-${tasks.length}`, true, props));
    });
    tasks.push({
      task: TaskTypes.informationScreen,
      content: "Practice is over, the real experiment begins here",
      key: `${tasks.length}`
    });
  }

  // Insert measured tasks.
  pickCorpusEntries(numberOfTypingTasks).forEach(props => {
    tasks.push(UploadLogS3(`${tasks.length}`, true, participant));
    tasks.push(TypingTask(`trial-${tasks.length}`, true, props));
  });

  tasks.push({ task: TaskTypes.endQuestionnaire, key: `${tasks.length}` });

  pickCorpusEntries(numberOfTypingSpeedTasks).forEach(props => {
    tasks.push(UploadLogS3(`${tasks.length}`, true, participant));
    tasks.push(
      TypingTask(`trial-${tasks.length}`, true, {
        ...props,
        suggestionsType: SuggestionTypes.none,
        keyStrokeDelay: 0
      })
    );
  });

  tasks.push(UploadLogS3(`${tasks.length}`, false, participant));
  tasks.push({
    task: TaskTypes.endExperiment,
    confirmationCode,
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
        confirmationCode,
        totalSuggestions,
        suggestionsType,
        numberOfPracticeTasks,
        numberOfTypingTasks
      };
    }
    return null;
  }, [loadingState, corpus]);
  return participant == null ||
    !Object.values(SuggestionTypes).includes(suggestionsType)
    ? [LoadingStates.invalidArguments, null]
    : [loadingState, config];
};

export default useConfiguration;
