import React from "react";
import PropTypes from "prop-types";
import { InputTypes, Directions } from "../../common/constants";
import QuestionnaireTask from "./QuestionnaireTask";

const weeklyUseAnswers = Object.freeze([
  "not at all",
  "less than 30 minutes",
  "30 minutes to 1 hours",
  "1 to 2 hours",
  "2 to 4 hours",
  "4 to 8 hours",
  "more than 8 hours",
]);

const suggestionsUseAnswers = Object.freeze([
  "none",
  "1 to 3",
  "3 to 10",
  "10 to 30",
  "30 to 100",
  "100 to 300",
  "more than 300",
]);

const questions = {
  // Desktop
  useDesktop: {
    text:
      "In the last 7 days, in total, how long have you used a desktop or a laptop computer?",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    answers: weeklyUseAnswers,
    isAnswerRequired: true,
  },
  typingUseDesktop: {
    text:
      "In the last 7 days, in total, how long have you typed on a laptop or desktop computer?",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    answers: weeklyUseAnswers,
    isAnswerRequired: true,
  },
  suggestionsUseFrequencyDesktop: {
    text:
      "In the last 24 hours, how many word suggestions have you used when typing on a laptop or desktop computer?",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    answers: suggestionsUseAnswers,
    isAnswerRequired: true,
  },

  // Tablet
  useTablet: {
    text:
      "In the last 7 days, in total, how long have you used a touch tablet?",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    answers: weeklyUseAnswers,
    isAnswerRequired: true,
  },
  typingUseTablet: {
    text:
      "In the last 7 days, in total, how long have you typed on a touch tablet without a physical keyboard?",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    answers: weeklyUseAnswers,
    isAnswerRequired: true,
  },
  typingUseTabletLandscape: {
    text:
      "In the last 7 days, in total, how long have you typed on a touch tablet in landscape orientation without a physical keyboard?",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    answers: weeklyUseAnswers,
    isAnswerRequired: true,
  },
  suggestionsUseFrequencyTablet: {
    text:
      "In the last 24 hours, how many word suggestions have you used when typing on a tablet?",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    answers: suggestionsUseAnswers,
    isAnswerRequired: true,
  },

  // Phone
  usePhone: {
    text: "In the last 7 days, in total, how long have you used a phone?",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    answers: weeklyUseAnswers,
    isAnswerRequired: true,
  },
  typingUsePhone: {
    text:
      "In the last 7 days, in total, how long have you typed on a phone (using any typing method)?",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    answers: weeklyUseAnswers,
    isAnswerRequired: true,
  },
  typingUsePhoneOneHand: {
    text:
      "In the last 7 days, in total, how long have you typed on a phone with only the thumb of one hand?",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    answers: weeklyUseAnswers,
    isAnswerRequired: true,
  },
  suggestionsUseFrequencyPhone: {
    text:
      "In the last 24 hours, how many word suggestions have you used when typing on a phone?",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    answers: suggestionsUseAnswers,
    isAnswerRequired: true,
  },

  // Swipe
  swipeTyping: {
    text: "In the last 7 days, in total, how long have you swipe typed?",
    inputType: InputTypes.choice,
    direction: Directions.horizontal,
    answers: weeklyUseAnswers,
    isAnswerRequired: true,
  },

  // Demographics
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
