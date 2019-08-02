import React from "react";
import PropTypes from "prop-types";
import styles from "./WorkflowButton.module.css";

const loggingTrial = (configData, endDate) => {
  const totalKeyStrokes = configData.eventList.current.length - 1;
  let totalSuggestionUsed = 0;
  let totalCorrectSuggestionUsed = 0;
  let totalIncorrectsuggestionUsed = 0;

  let actualSks = 0;
  let totalKeyStrokeErrors = 0;
  for (let i = 0; i < configData.eventList.current.length; i += 1) {
    if (configData.eventList.current[i].is_error === true) {
      totalKeyStrokeErrors += 1;
    }
    if (configData.eventList.current[i].event === "used_suggestion") {
      totalSuggestionUsed += 1;
      if (
        configData.eventList.current[i].input ===
        configData.text.slice(0, configData.eventList.current[i].input.length)
      ) {
        totalCorrectSuggestionUsed += 1;
        if (i > 0) {
          actualSks +=
            configData.eventList.current[i].input.length -
            configData.eventList.current[i - 1].input.length;
        } else {
          actualSks += configData.eventList.current[i].suggestion_used.length;
        }
      } else {
        totalIncorrectsuggestionUsed += 1;
      }
    }
  }

  const sentenceWordsAndSks = configData.wordsAndSks
    .map(item => {
      return `${item.word}{${item.sks}}`;
    })
    .join(" ");

  const theoreticalSks = configData.wordsAndSks
    .map(item => item.sks)
    .reduce((a, b) => {
      return a + b;
    }, 0);

  return {
    participant: configData.participant,
    id: configData.id,
    sentence: configData.text,
    targetAccuracy: configData.accuracy,
    sentenceAccuracy: configData.weightedAccuracy,
    sentenceSksSd: configData.sdAccuracy,
    sentenceWordsAndSks,
    theoreticalSks,
    delay: configData.taskDelay,
    delayOnSuggestion: configData.delayOnSuggestion,
    startDate: configData.trialStartTime,
    endDate,
    duration: endDate - configData.trialStartTime,
    totalKeyStrokes,
    totalKeyStrokeErrors,
    actualSks,
    totalSuggestionUsed,
    totalCorrectSuggestionUsed,
    totalIncorrectsuggestionUsed
  };
};

export default function WorkflowButton({
  onAdvanceWorkflow,
  onLog,
  configData
}) {
  const trialEndTime = new Date();
  return (
    <div className={styles.advanceWorkflowDiv}>
      <button
        type="button"
        onClick={() => {
          onLog("Trial", loggingTrial(configData, trialEndTime));
          onAdvanceWorkflow();
        }}
        className={styles.advanceWorkflowButton}
      >
        Continue
      </button>
    </div>
  );
}

WorkflowButton.propTypes = {
  onAdvanceWorkflow: PropTypes.func.isRequired,
  onLog: PropTypes.func.isRequired,
  configData: PropTypes.objectOf(
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.array,
      PropTypes.instanceOf(Date),
      PropTypes.object
    ])
  ).isRequired
};
