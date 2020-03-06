import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import style from "./ResultsTask.module.css";
import { TaskTypes } from "../utils/constants";
import TaskPaper from "../experiment/components/TaskPaper";

const getTypingTasksFromState = () => {
  const state = JSON.parse(localStorage.getItem("state"));
  return state.Configuration.children.filter(
    t => t.task === TaskTypes.typingSpeedTask
  );
};

export default function ResultsTask({ participant }) {
  const [typingTasks, setTypingTasks] = useState(getTypingTasksFromState());
  const typingResults = typingTasks.filter(t => t.trial != null);
  const typingTaskSpeeds = typingResults.map(t => {
    const firstCharEvent = t.events.find(e => e.input !== "");
    const completionEvent = t.events.find(e => e.isTargetCompleted);
    return (
      t.phrase.length /
      ((new Date(completionEvent.time) - new Date(firstCharEvent.time)) / 1000)
    );
  });
  const avgSpeed =
    typingTaskSpeeds.reduce((a, b) => a + b, 0) / typingTaskSpeeds.length;

  const willRefresh = typingTasks.length !== typingResults.length;

  useEffect(() => {
    if (willRefresh) {
      setTimeout(() => {
        setTypingTasks(getTypingTasksFromState());
      }, 100);
    }
  });

  return (
    <TaskPaper>
      <h1>Results</h1>
      <ul className={style.resultList}>
        <li>participant: {participant}</li>
        <li>number of trials: {typingTaskSpeeds.length}</li>
        <li>characters per second: {avgSpeed}</li>
        <li>words per minute: {(avgSpeed * 60) / 5}</li>
      </ul>
      {willRefresh && <p>Refreshing...</p>}
    </TaskPaper>
  );
}

ResultsTask.propTypes = {
  participant: PropTypes.string.isRequired
};
