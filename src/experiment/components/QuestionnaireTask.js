import React, { useMemo } from "react";
import mapValues from "lodash/mapValues";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import Button from "@material-ui/core/Button";
import FormInput from "../../utils/FormInput";
import TaskPaper from "./TaskPaper";
import styles from "./styles/QuestionnaireTask.module.scss";

export default function QuestionnaireTask({
  onAdvanceWorkflow,
  onLog,
  questions,
  title
}) {
  const validate = values => {
    const errors = {};
    Object.entries(values).forEach(([qId, value]) => {
      if (value == null && questions[qId].isAnswerRequired) {
        errors[qId] = "Required";
      }
    });
    return errors;
  };

  const initialValues = useMemo(
    () => mapValues(questions, q => q.defaultAnswer),
    [questions]
  );

  const {
    handleSubmit,
    values,
    setFieldValue,
    handleBlur,
    errors,
    isValid
  } = useFormik({
    initialValues,
    validate,
    onSubmit: () => {
      onLog("log", values);
      onAdvanceWorkflow();
    }
  });

  return (
    <TaskPaper className={styles.main}>
      <h1>{title}</h1>
      <p className={styles.instructions}>Please answer the questions below.</p>

      <form onSubmit={handleSubmit} className={styles.endForm}>
        {Object.entries(questions).map(([questionId, question]) => {
          return (
            <div className={styles.question} key={questionId}>
              <FormInput
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...question}
                id={questionId}
                value={values[questionId]}
                error={errors[questionId]}
                onChange={setFieldValue}
                onBlur={handleBlur}
              />
            </div>
          );
        })}
        <div className={styles.buttonWrapper}>
          <Button
            disabled={!isValid}
            className={styles.button}
            variant="contained"
            color="primary"
            type="submit"
          >
            Submit
          </Button>
        </div>
      </form>
    </TaskPaper>
  );
}

QuestionnaireTask.propTypes = {
  onLog: PropTypes.func.isRequired,
  onAdvanceWorkflow: PropTypes.func.isRequired,
  questions: PropTypes.objectOf(
    PropTypes.shape({
      defaultAnswer: PropTypes.any,
      isAnswerRequired: PropTypes.bool.isRequired
    })
  ).isRequired,
  title: PropTypes.node
};

QuestionnaireTask.defaultProps = {
  title: "Questionnaire"
};
