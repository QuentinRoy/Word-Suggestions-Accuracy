import React from "react";
import PropTypes from "prop-types";
import { withRawConfiguration } from "@hcikit/workflow";
import style from "./ResultsTask.module.css";
import { TaskTypes } from "../utils/constants";
import TaskPaper from "../experiment/components/TaskPaper";

function ResultsTask({ participant, configuration }) {
  const typingTasks = configuration.children.filter(
    t => t.task === TaskTypes.typingSpeedTask
  );
  const typingTaskSpeeds = typingTasks.map(t => {
    const firstCharEvent = t.events.find(e => e.input !== "");
    const completionEvent = t.events.find(e => e.isTargetCompleted);
    return (
      t.phrase.length / ((completionEvent.time - firstCharEvent.time) / 1000)
    );
  });
  const avgSpeed =
    typingTaskSpeeds.reduce((a, b) => a + b, 0) / typingTaskSpeeds.length;

  return (
    <TaskPaper>
      <h1>Results</h1>
      <ul className={style.resultList}>
        <li>participant: {participant}</li>
        <li>number of trials: {typingTaskSpeeds.length}</li>
        <li>characters per second: {avgSpeed}</li>
        <li>words per minute: {(avgSpeed * 60) / 5}</li>
      </ul>
    </TaskPaper>
  );
}

ResultsTask.propTypes = {
  participant: PropTypes.string.isRequired,
  configuration: PropTypes.shape({
    children: PropTypes.arrayOf(
      PropTypes.shape({
        task: PropTypes.string.isRequired,
        phrase: PropTypes.string,
        events: PropTypes.arrayOf(
          PropTypes.shape({
            time: PropTypes.instanceOf(Date).isRequired,
            input: PropTypes.string.isRequired,
            isTargetCompleted: PropTypes.bool.isRequired
          })
        )
      })
    ).isRequired
  }).isRequired
};

export default withRawConfiguration(ResultsTask);
