import React, { useState } from "react";
import PropTypes from "prop-types";
import { TextField, Button } from "@material-ui/core";
import styles from "./styles/FinalFeedbacks.module.css";
import TaskPaper from "./TaskPaper";

const FinalFeedbacks = ({ onAdvanceWorkflow, onLog }) => {
  const [value, setValue] = useState("");

  return (
    <TaskPaper className={styles.main}>
      <h1>Feedbacks</h1>
      <p className={styles.instructions}>
        If you have any feedbacks you would want to share with us, you may write
        them below.
      </p>
      <form
        onSubmit={evt => {
          evt.preventDefault();
          onLog("feedbacks", value);
          onAdvanceWorkflow();
        }}
      >
        <TextField
          className={styles.input}
          margin="normal"
          variant="outlined"
          value={value}
          multiline
          rows="8"
          onChange={evt => {
            setValue(evt.target.value);
          }}
        />
        <div className={styles.footer}>
          <Button color="primary" type="submit" variant="contained">
            Submit
          </Button>
        </div>
      </form>
    </TaskPaper>
  );
};

FinalFeedbacks.propTypes = {
  onAdvanceWorkflow: PropTypes.func.isRequired,
  onLog: PropTypes.func.isRequired
};

export default FinalFeedbacks;
