import React from "react";
import { Button } from "@material-ui/core";
import { useHistory, useLocation } from "react-router-dom";
import styles from "./styles/EndExperiment.module.css";
import TaskPaper from "./TaskPaper";

const EndExperiment = () => {
  const history = useHistory();
  const location = useLocation();
  return (
    <TaskPaper>
      <h1>Thank you!</h1>
      <div className={styles.controls}>
        <Button
          color="primary"
          onClick={() => {
            localStorage.removeItem("state");
            history.push({ pathname: `/startup`, search: location.search });
          }}
        >
          Finish
        </Button>
      </div>
    </TaskPaper>
  );
};

export default EndExperiment;
