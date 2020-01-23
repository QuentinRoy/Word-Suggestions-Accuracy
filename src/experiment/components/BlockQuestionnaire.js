import React from "react";
import PropTypes from "prop-types";
import { InputTypes, Directions } from "../../utils/constants";
import QuestionnaireTask from "./QuestionnaireTask";

const questions = Object.freeze({
  controlsSatisfactory: Object.freeze({
    text:
      "The controls keyboard and word suggestions) are satisfactory for the completion of the task",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    isAnswerRequired: true
  }),
  suggestionsAccuracy: Object.freeze({
    text: "The word suggestions are accurate",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    isAnswerRequired: true
  }),
  keyboardUseEfficiency: Object.freeze({
    text: "The use of the keyboard i)s efficient in this task",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    isAnswerRequired: true
  }),
  suggestionDistraction: Object.freeze({
    text: "The word suggestions are distracting",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    isAnswerRequired: true
  }),
  mentalDemand: Object.freeze({
    text: "Mental demand",
    description: "How mentally demanding was the task?",
    inputType: InputTypes.nasaTlx,
    isAnswerRequired: true,
    lowLabel: "Very low",
    highLabel: "Very high"
  }),
  physicalDemand: Object.freeze({
    text: "Physical demand",
    description: "How physically demanding was the task?",
    inputType: InputTypes.nasaTlx,
    isAnswerRequired: true,
    lowLabel: "Very low",
    highLabel: "Very high"
  }),
  temporalDemand: Object.freeze({
    text: "Temporal Demand",
    description: "How hurried or rushed was the pace of the task?",
    inputType: InputTypes.nasaTlx,
    isAnswerRequired: true,
    lowLabel: "Very low",
    highLabel: "Very high"
  }),
  performance: Object.freeze({
    text: "Performance",
    description:
      "How successful were you in accomplishing what you were asked to do?",
    inputType: InputTypes.nasaTlx,
    isAnswerRequired: true,
    lowLabel: "Perfect",
    highLabel: "Failure"
  }),
  effort: Object.freeze({
    text: "Effort",
    description:
      "How hard did you have to work to accomplish your level of performance?",
    inputType: InputTypes.nasaTlx,
    isAnswerRequired: true,
    lowLabel: "Very low",
    highLabel: "Very high"
  }),
  frustration: Object.freeze({
    text: "Frustration",
    description:
      "How insecure, discouraged, irritated, stressed, and annoyed were you?",
    inputType: InputTypes.nasaTlx,
    isAnswerRequired: true,
    lowLabel: "Very low",
    highLabel: "Very high"
  })
});

export default function BlockQuestionnaire({ onAdvanceWorkflow, onLog }) {
  return (
    <QuestionnaireTask
      questions={questions}
      onAdvanceWorkflow={onAdvanceWorkflow}
      onLog={onLog}
    />
  );
}

BlockQuestionnaire.propTypes = {
  onAdvanceWorkflow: PropTypes.func.isRequired,
  onLog: PropTypes.func.isRequired
};