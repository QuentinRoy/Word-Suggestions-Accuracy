export const KeyboardLayoutNames = Object.freeze({
  default: "default",
  shift: "shift",
  numbers: "numbers"
});

export const LoadingStates = Object.freeze({
  loading: "LOADING",
  loaded: "LOADED",
  crashed: "CRASHED",
  invalidArguments: "INVALID_ARGUMENTS"
});

export const Actions = Object.freeze({
  inputChar: "INPUT_CHAR",
  deleteChar: "DELETE_CHAR",
  inputSuggestion: "INPUT_SUGGESTION",
  focusNext: "FOCUS_NEXT",
  toggleKeyboardLayout: "TOGGLE_KEYBOARD_LAYOUT",
  moveFocusTarget: "MOVE_FOCUS_TARGET",
  windowBlurred: "WINDOW_BLURRED",
  windowFocused: "WINDOW_FOCUSED",
  closeFocusAlert: "CLOSE_FOCUS_ALERT",
  submit: "SUBMIT",

  // Scheduled action
  scheduleAction: "SCHEDULE_ACTION",
  cancelAction: "CANCEL_ACTION",
  endAction: "END_ACTION",
  confirmAction: "CONFIRM_ACTION"
});

export const ActionStatuses = Object.freeze({
  start: "START",
  end: "END"
});

export const FocusTargetTypes = Object.freeze({
  input: "INPUT",
  suggestion: "SUGGESTION"
});

export const InputTypes = Object.freeze({
  number: "number",
  selectInput: "selectInput",
  choice: "choice",
  nasaTlx: "nasaTlx"
});

export const TaskTypes = Object.freeze({
  typingTask: "TypingTask",
  s3Upload: "S3Upload",
  endExperiment: "EndExperiment",
  startup: "Startup",
  endQuestionnaire: "EndQuestionnaire",
  tutorial: "Tutorial",
  consentForm: "ConsentForm",
  finalFeedbacks: "FinalFeedbacks",

  // These tasks are built in @hcikit
  informationScreen: "InformationScreen",
  experimentProgress: "ExperimentProgress"
});

export const TutorialSteps = Object.freeze({
  start: "Start",
  input: "Input",
  suggestion: " Suggestion",
  wrongSuggestion: "WrongSuggestion",
  error: "Error",
  delay: "Delay",
  delaySuggestion: "DelaySuggestion",
  finish: "Finish",
  end: "End"
});

export const SuggestionTypes = Object.freeze({
  none: "NONE",
  inline: "INLINE",
  bar: "BAR"
});

export const Directions = Object.freeze({
  horizontal: "HORIZONTAL",
  vertical: "VERTICAL"
});
