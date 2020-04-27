import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { withRawConfiguration } from "@hcikit/workflow";
import { Button } from "@material-ui/core";
import { useHistory, useLocation } from "react-router-dom";
import style from "./ResultsTask.module.css";
import { TaskTypes, Paths, LogTypes } from "../common/constants";
import TaskPaper from "../experiment/components/TaskPaper";
import { useModeration } from "../common/moderation/Moderation";

function ResultsTask({ participant, configuration }) {
  const history = useHistory();
  const location = useLocation();

  const typingTasks = configuration.children.filter(
    (t) => t.task === TaskTypes.typingSpeedTask
  );
  const typingTaskSpeeds = typingTasks.map((t) => {
    const firstCharEvent = t.events.find((e) => e.input !== "");
    const completionEvent = t.events.find((e) => e.isTargetCompleted);
    return (
      t.phrase.length / ((completionEvent.time - firstCharEvent.time) / 1000)
    );
  });
  const avgSpeed =
    typingTaskSpeeds.reduce((a, b) => a + b, 0) / typingTaskSpeeds.length;

  const { sendLog } = useModeration();

  useEffect(() => {
    sendLog(LogTypes.typingSpeedResults, { avgSpeed });
  }, [sendLog, avgSpeed]);

  return (
    <TaskPaper>
      <h1>Results</h1>
      <ul className={style.resultList}>
        <li>participant: {participant}</li>
        <li>number of trials: {typingTaskSpeeds.length}</li>
        <li>characters per second: {avgSpeed}</li>
        <li>words per minute: {(avgSpeed * 60) / 5}</li>
      </ul>
      <div className={style.controls}>
        <Button
          color="primary"
          onClick={() => {
            localStorage.removeItem("state");
            history.push({
              pathname: Paths.waitingRoom,
              search: location.search,
            });
          }}
        >
          Finish
        </Button>
      </div>
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
            isTargetCompleted: PropTypes.bool.isRequired,
          })
        ),
      })
    ).isRequired,
  }).isRequired,
};

export default withRawConfiguration(ResultsTask);
