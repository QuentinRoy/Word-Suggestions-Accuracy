import React, { useRef } from "react";
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
  startDate,
  endDate
) => {
  const totalKeyStrokes = eventList.current.length - 1;
  let totalSuggestionUsed = 0;
  let totalCorrectSuggestionUsed = 0;
  let totalIncorrectsuggestionUsed = 0;

  let actualSks = 0;
  let totalKeyStrokeErrors = 0;
  for (let i = 0; i < eventList.current.length; i += 1) {
    if (eventList.current[i].is_error === true) {
      totalKeyStrokeErrors += 1;
    }
    if (eventList.current[i].event === "used_suggestion") {
      totalSuggestionUsed += 1;
      if (
        eventList.current[i].input ===
        sentence.slice(0, eventList.current[i].input.length)
      ) {
        totalCorrectSuggestionUsed += 1;
        if (i > 0) {
          actualSks +=
            eventList.current[i].input.length -
            eventList.current[i - 1].input.length;
        } else {
          actualSks += eventList.current[i].suggestion_used.length;
        }
      } else {
        totalIncorrectsuggestionUsed += 1;
      }
    }
  }

  const sentenceWordsAndSks = sentenceAndSks
    .map(item => {
      return `${item.word}{${item.sks}}`;
    })
    .join(" ");

  const theoreticalSks = sentenceAndSks
    .map(item => item.sks)
    .reduce((a, b) => {
      return a + b;
    }, 0);

  return {
    participant,
    id,
    sentence,
    targetAccuracy,
    sentenceAccuracy,
    sentenceSksSd,
    sentenceWordsAndSks,
    theoreticalSks,
    delay,
    startDate,
    endDate,
    duration: endDate - startDate,
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
  const trialLog = useRef([]);
  return (
    <div className={styles.advanceWorkflowDiv}>
      <button
        type="button"
        onClick={() => {
          trialLog.current.push(
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
              configData[4], // trialStartTime
              trialEndTime
            )
          );
          onLog("Trial", trialLog);
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
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.array,
      PropTypes.instanceOf(Date),
      PropTypes.object
    ])
  ).isRequired
};
