import React from "react";
import { Button } from "@material-ui/core";
import { useHistory, useLocation } from "react-router-dom";
import styles from "./styles/EndExperiment.module.css";
import TaskPaper from "./TaskPaper";
import { Paths } from "../../common/constants";

const EndExperiment = () => {
  const history = useHistory();
  const location = useLocation();

  function handleClick() {
    localStorage.removeItem("state");
    history.push({
      pathname: Paths.waitingRoom,
      search: location.search,
    });
  }

  return (
    <TaskPaper>
      <h1>Thank you!</h1>
      <div className={styles.controls}>
        <Button variant="contained" color="primary" onClick={handleClick}>
          Finish
        </Button>
      </div>
    </TaskPaper>
  );
};

export default EndExperiment;
