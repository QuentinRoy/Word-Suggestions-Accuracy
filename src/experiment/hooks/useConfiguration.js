import { useMemo } from "react";
import short from "short-uuid";
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

const Task = (type, props) => ({
  task: type,
  children: [{ tasks: [TaskTypes.experimentProgress], position: "bottom" }],
  fullProgress: false,
  currentProgress: true,
  ...props
});

const TypingTask = (id, isPractice, { words, ...props }) =>
  Task(TaskTypes.typingTask, {
    ...props,
    sksDistribution: words,
    key: id,
    id,
    isPractice
  });

const logFilename = `${participant}-${new Date().toISOString()}-log.json`;

const UploadLogTask = (id, fireAndForget) =>
  Task(TaskTypes.s3Upload, {
    filename: logFilename,
    key: id,
    fireAndForget
  });

const generateTasks = corpus => {
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

  tasks.push(Task(TaskTypes.consentForm, { key: `consent-${tasks.length}` }));

  tasks.push(UploadLogTask(`upload-${tasks.length}`, true));

  tasks.push(Task(TaskTypes.startup, { key: `startup-${tasks.length}` }));

  tasks.push(UploadLogTask(`upload-${tasks.length}`, true));

  tasks.push(
    Task(TaskTypes.tutorial, {
      key: `tuto-${tasks.length}`,
      isPractice: true
    })
  );

  tasks.push(UploadLogTask(`upload-${tasks.length}`, true));

  // Insert practice tasks.
  if (numberOfPracticeTasks > 0) {
    tasks.push(
      Task(TaskTypes.informationScreen, {
        content: "Continue with the practice tasks",
        shortcutEnabled: true,
        key: `info-${tasks.length}`
      })
    );
    pickCorpusEntries(numberOfPracticeTasks).forEach(props => {
      tasks.push(TypingTask(`practice-${tasks.length}`, true, props));
    });
    tasks.push(
      Task(TaskTypes.informationScreen, {
        content:
          "Practice is over. You may take a break. The real experiment begins immediately after this screen!",
        key: `info-${tasks.length}`
      })
    );
  }

  tasks.push(UploadLogTask(`upload-${tasks.length}`, true));

  // Insert measured tasks.
  pickCorpusEntries(numberOfTypingTasks).forEach(props => {
    tasks.push(TypingTask(`trial-${tasks.length}`, true, props));
  });

  tasks.push(UploadLogTask(`upload-${tasks.length}`, true));

  tasks.push(Task(TaskTypes.endQuestionnaire, { key: `${tasks.length}` }));

  tasks.push(UploadLogTask(`upload-${tasks.length}`, true));

  tasks.push(
    Task(TaskTypes.informationScreen, {
      content: `To finish, please complete a few additional typing tasks without impairment nor suggestions.`,
      shortcutEnabled: true,
      key: `info-${tasks.length}`
    })
  );

  pickCorpusEntries(numberOfTypingSpeedTasks).forEach(props => {
    tasks.push(
      TypingTask(`typing-${tasks.length}`, true, {
        ...props,
        suggestionsType: SuggestionTypes.none,
        keyStrokeDelay: 0
      })
    );
  });

  tasks.push(
    Task(TaskTypes.finalFeedbacks, { key: `feedbacks-${tasks.length}` })
  );

  tasks.push(UploadLogTask(`upload-${tasks.length}`, false));

  tasks.push(
    Task(TaskTypes.endExperiment, {
      confirmationCode,
      key: `end-${tasks.length}`
    })
  );

  return tasks;
};

const useConfiguration = () => {
  const [loadingState, corpus] = useCorpusFromJson(targetAccuracy, {
    shuffleRows: true
  });
  const config = useMemo(() => {
    if (loadingState === LoadingStates.loaded) {
      return {
        ...otherPageArgs,
        progressLevel: true,
        children: generateTasks(corpus.rows),
        corpusConfig: omit(corpus, "rows"),
        corpusSize: corpus.rows.length,
        keyStrokeDelay,
        targetAccuracy,
        participant,
        gitSha: process.env.REACT_APP_GIT_SHA,
        version: process.env.REACT_APP_VERSION,
        confirmationCode,
        totalSuggestions,
        suggestionsType,
        numberOfPracticeTasks,
        numberOfTypingTasks,
        href: window.location.href
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
