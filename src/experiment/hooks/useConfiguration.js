import { useMemo, useRef } from "react";
import omit from "lodash/omit";
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
const numberOfTypingSpeedTasks = 5;

const PageArguments = {
  targetAccuracies: "targetAccuracies",
  workerId: "workerId",
  keyStrokeDelays: "keyStrokeDelays",
  assignmentId: "assignmentId",
  hitId: "hitId",
  suggestionsType: "suggestionsType",
  wave: "wave"
};

const {
  participant,
  targetAccuracy,
  keyStrokeDelay,
  suggestionsType,
  wave,
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
  const waveState = urlParams.has(PageArguments.wave)
    ? urlParams.get(PageArguments.wave)
    : null;
  return {
    assignmentId,
    hitId,
    participant: workerId,
    suggestionsType: suggestionsParam,
    keyStrokeDelay:
      keyStrokeDelays[Math.floor(Math.random() * keyStrokeDelays.length)],
    targetAccuracy:
      targetAccuracies[Math.floor(Math.random() * targetAccuracies.length)],
    wave: waveState
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

const UploadLogTask = (id, fireAndForget, uploadFileName) => ({
  task: TaskTypes.s3Upload,
  filename: uploadFileName,
  key: id,
  fireAndForget,
  noProgress: true
});

export const generateTasks = (corpus, uploadFileName) => {
  let totalPickedCorpusEntry = 0;
  const pickCorpusEntries = n => {
    const slice = corpus.slice(
      totalPickedCorpusEntry,
      totalPickedCorpusEntry + n
    );
    totalPickedCorpusEntry += n;
    return slice;
  };

  const tasks = [];

  tasks.push({
    task: TaskTypes.consentForm,
    key: `consent-${tasks.length}`,
    label: "Consent Form"
  });

  tasks.push(UploadLogTask(`upload-${tasks.length}`, true, uploadFileName));

  tasks.push({
    task: TaskTypes.startup,
    key: `startup-${tasks.length}`,
    label: "Instructions"
  });

  tasks.push(UploadLogTask(`upload-${tasks.length}`, true, uploadFileName));

  tasks.push({
    tasks: [TaskTypes.informationScreen, TaskTypes.experimentProgress],
    content: "Now you will complete an interactive tutorial",
    shortcutEnabled: true,
    key: `info-${tasks.length}`,
    fullProgress: true,
    currentProgress: false,
    progressLevel: true,
    label: "Tutorial"
  });

  tasks.push({
    task: TaskTypes.tutorial,
    key: `tuto-${tasks.length}`,
    id: `tuto-${tasks.length}`,
    isPractice: true,
    noProgress: true
  });

  // Insert practice tasks.
  if (numberOfPracticeTasks > 0) {
    tasks.push({
      tasks: [TaskTypes.informationScreen, TaskTypes.experimentProgress],
      content: "Continue with the practice tasks",
      shortcutEnabled: true,
      key: `info-${tasks.length}`,
      fullProgress: true,
      currentProgress: false,
      progressLevel: true,
      label: "Practice"
    });
    const practiceTaskBlock = pickCorpusEntries(numberOfPracticeTasks).map(
      (props, i) => TypingTask(`practice-${tasks.length}-${i}`, true, props)
    );
    tasks.push({
      children: practiceTaskBlock,
      tasks: [TaskTypes.experimentProgress],
      fullProgress: false,
      currentProgress: true,
      progressLevel: true,
      noProgress: true
    });
    tasks.push({
      tasks: [TaskTypes.informationScreen, TaskTypes.experimentProgress],
      content:
        "Practice is over. You may take a break. The real experiment begins immediately after this screen!",
      shortcutEnabled: true,
      key: `info-${tasks.length}`,
      fullProgress: true,
      currentProgress: false,
      progressLevel: true,
      label: "Experiment"
    });
  }

  // Insert measured tasks.
  const measuredTasksBlock = pickCorpusEntries(numberOfTypingTasks).map(
    (props, i) => TypingTask(`trial-${tasks.length}-${i}`, false, props)
  );
  tasks.push({
    children: measuredTasksBlock,
    tasks: [TaskTypes.experimentProgress],
    fullProgress: false,
    currentProgress: true,
    progressLevel: true,
    noProgress: true
  });

  tasks.push(UploadLogTask(`upload-${tasks.length}`, true, uploadFileName));

  tasks.push({
    tasks: [TaskTypes.informationScreen, TaskTypes.experimentProgress],
    content:
      "You completed most of the experiment. Now please fill in the experiment questionnaire.",
    shortcutEnabled: true,
    key: `info-${tasks.length}`,
    fullProgress: true,
    currentProgress: false,
    progressLevel: true,
    label: "Questionnaire"
  });

  tasks.push({
    task: TaskTypes.endQuestionnaire,
    key: `${tasks.length}`,
    noProgress: true
  });

  tasks.push(UploadLogTask(`upload-${tasks.length}`, true, uploadFileName));

  tasks.push({
    tasks: [TaskTypes.informationScreen, TaskTypes.experimentProgress],
    content:
      "To finish, please complete a few additional typing tasks without impairment or suggestions.",
    shortcutEnabled: true,
    key: `info-${tasks.length}`,
    fullProgress: true,
    currentProgress: false,
    progressLevel: true,
    label: "Typing speed"
  });

  const typingTasksBlock = pickCorpusEntries(numberOfTypingSpeedTasks).map(
    (props, i) => TypingTask(`typing-${tasks.length}-${i}`, false, props)
  );
  tasks.push({
    children: typingTasksBlock,
    suggestionsType: SuggestionTypes.none,
    keyStrokeDelay: 0,
    tasks: [TaskTypes.experimentProgress],
    noProgress: true
  });

  tasks.push({
    task: TaskTypes.finalFeedbacks,
    key: `feedbacks-${tasks.length}`,
    label: "Final feedbacks"
  });

  tasks.push({
    task: TaskTypes.injectEnd,
    key: `inject-end-${tasks.length}`,
    noProgress: true
  });

  tasks.push(UploadLogTask(`upload-${tasks.length}`, false, uploadFileName));

  tasks.push({
    task: TaskTypes.endExperiment,
    key: `end-${tasks.length}`,
    label: "End"
  });

  return tasks;
};

const useConfiguration = () => {
  const [loadingState, corpus] = useCorpusFromJson(targetAccuracy, {
    shuffleRows: true
  });
  const { current: startDate } = useRef(new Date());
  const config = useMemo(() => {
    if (loadingState === LoadingStates.loaded) {
      return {
        ...otherPageArgs,
        children: generateTasks(
          corpus.rows,
          process.env.NODE_ENV === "development"
            ? `dev/${participant}_${startDate.toISOString()}.json`
            : `prod/${participant}_${startDate.toISOString()}.json`
        ),
        corpusConfig: omit(corpus, "rows"),
        corpusSize: corpus.rows.length,
        keyStrokeDelay,
        targetAccuracy,
        participant,
        mode: process.env.NODE_ENV,
        gitSha: process.env.REACT_APP_GIT_SHA,
        version: process.env.REACT_APP_VERSION,
        totalSuggestions,
        suggestionsType,
        numberOfPracticeTasks,
        numberOfTypingTasks,
        href: window.location.href,
        isExperimentCompleted: false,
        startDate,
        wave,
        nextLevel: "section",
        // Fixes an issue with components being rendered with the same key.
        [TaskTypes.experimentProgress]: { key: "progress" }
      };
    }
    return null;
  }, [loadingState, corpus, startDate]);
  return participant == null ||
    wave == null ||
    !Object.values(SuggestionTypes).includes(suggestionsType)
    ? [LoadingStates.invalidArguments, null]
    : [loadingState, config];
};

export default useConfiguration;
