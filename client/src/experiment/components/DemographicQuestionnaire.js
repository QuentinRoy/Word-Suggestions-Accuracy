import React from "react";
import PropTypes from "prop-types";
import {
  InputTypes,
  Directions,
  agreementScaleAnswers,
} from "../../common/constants";
import QuestionnaireTask from "./QuestionnaireTask";

const questions = {
  age: {
    text: "How old are you?",
    inputType: InputTypes.number,
    isAnswerRequired: false,
  },
  gender: {
    text: "What is your gender?",
    inputType: InputTypes.selectInput,
    answers: ["Male", "Female", "Non-binary", "Other", "Prefer not to say"],
    isAnswerRequired: false,
  },
  suggestionsUseFrequencyDesktop: {
    text:
      "I frequently use word suggestions when typing on a laptop or desktop computer.",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    answers: agreementScaleAnswers,
    isAnswerRequired: true,
  },
  suggestionsUseFrequencyTablet: {
    text:
      "I frequently use word suggestions when typing on a touch tablet without a physical keyboard.",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    answers: agreementScaleAnswers,
    isAnswerRequired: true,
  },
  suggestionsUseFrequencyPhone: {
    text: "I frequently use word suggestions when typing on a phone.",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    answers: agreementScaleAnswers,
    isAnswerRequired: true,
  },
};

export default function DemographicQuestionnaire({ onAdvanceWorkflow, onLog }) {
  return (
    <QuestionnaireTask
      title="Demographic Questionnaire"
      questions={questions}
      onAdvanceWorkflow={onAdvanceWorkflow}
      onLog={onLog}
    />
  );
}

DemographicQuestionnaire.propTypes = {
  onAdvanceWorkflow: PropTypes.func.isRequired,
  onLog: PropTypes.func.isRequired,
};
