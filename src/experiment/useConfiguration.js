import { useMemo } from "react";
import useCorpusFromJson, { States } from "./useCorpusFromJson";

const keyStrokeDelay = 500;
const targetAccuracy = 0.5;
const delayOnSuggestion = true;

const generateTasks = (numberOfPracticeTasks, numberOfTypingTasks, corpus) => {
  const createTaskHOF = (startId, isPractice) => (sentenceData, i) => {
    const id = (i + startId).toString();
    return {
      task: "TypingTask",
      ...sentenceData,
      key: id,
      id,
      isPractice
    };
  };

  const tasks = [
    { task: "LoginScreen", key: "0" },
    { task: "KeyboardSelector", key: "1" }
  ];

  // Insert practice-related tasks.
  if (numberOfPracticeTasks > 0) {
    tasks.push(
      {
        task: "InformationScreen",
        content: "The 5 following tasks are practice tasks",
        shortcutEnabled: true,
        key: "2"
      },
      ...corpus
        .slice(0, numberOfPracticeTasks)
        .map(createTaskHOF(tasks.length + 1, true)),
      {
        task: "InformationScreen",
        content: "Practice is over, the real experiment begins here",
        key: (numberOfPracticeTasks + 3).toString()
      }
    );
  }

  // Insert measured tasks.
  tasks.push(
    ...corpus
      .slice(numberOfPracticeTasks, numberOfPracticeTasks + numberOfTypingTasks)
      .map(createTaskHOF(tasks.length, false))
  );

  return tasks;
};

const useConfiguration = (numberOfPracticeTasks, numberOfTypingTasks) => {
  const [loadingState, corpus] = useCorpusFromJson(targetAccuracy);
  const config = useMemo(() => {
    if (loadingState === States.loaded) {
      return {
        keyStrokeDelay,
        targetAccuracy,
        delayOnSuggestion,
        participant: null, // participant id is filled in later
        children: generateTasks(
          numberOfPracticeTasks,
          numberOfTypingTasks,
          corpus
        )
      };
    }
    return null;
  }, [numberOfPracticeTasks, numberOfTypingTasks, loadingState, corpus]);
  return [loadingState, config];
};

export default useConfiguration;
