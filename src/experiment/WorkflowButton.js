import React from "react";
import PropTypes from "prop-types";
import styles from "./WorkflowButton.module.css";

const loggingTrial = (
  eventList,
  participant,
  id,
  targetAccuracy,
  delay,
  sentenceAccuracy,
  sentenceSksSd,
  sentence,
  sentenceAndSks,
  theoreticalSks,
  startDate,
  endDate
) => {
  const totalKeyStrokes = eventList.current.length - 1;
  const totalSuggestionUsed =
    eventList.current[eventList.current.length - 1].suggestion_used.length;

  const totalCorrectSuggestionUsed = 0;
  const totalIncorrectsuggestionUsed = 0;

  let actualSks = 0;
  let totalKeyStrokeErrors = 0;
  for (let i = 0; i < eventList.current.length; i += 1) {
    if (eventList.current[i].is_error === true) {
      totalKeyStrokeErrors += 1;
    }
    if (eventList.current[i].eventName === "used_suggestion") {
      if (i > 0) {
        actualSks +=
          eventList.current[i - 1].input.length -
          eventList.current[i].suggestion_used.length;
      } else {
        actualSks += eventList.current[i].suggestion_used.length;
      }
    }
  }

  return {
    participant,
    id,
    targetAccuracy,
    sentenceAccuracy,
    sentenceSksSd,
    sentenceAndSks,
    theoreticalSks,
    delay,
    sentence,
    startDate,
    endDate,
    duration: startDate - endDate,
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
          onLog(
            "Trial",
            loggingTrial(
              configData[10], // eventList
              configData[0], // participant
              configData[9], // id
              configData[3], // targetAccuracy
              configData[2], // delay
              configData[5], // weightedAccuracy
              configData[6], // sdAccuracy
              configData[1], // sentence
              configData[7], // words
              configData[8], // words.sks
              configData[4], // trialStartTime
              trialEndTime
            )
          );
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
  configData: PropTypes.arrayOf(
    PropTypes.oneOfType(PropTypes.number, PropTypes.string)
  ).isRequired
};
