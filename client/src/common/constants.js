export const KeyboardLayoutNames = Object.freeze({
  default: "default",
  shift: "shift",
  numbers: "numbers",
});

export const ReadyStates = Object.freeze({
  loading: "LOADING",
  ready: "READY",
  crashed: "CRASHED",
  done: "DONE",
  idle: "IDLE",
});

export const Actions = Object.freeze({
  init: "INIT",

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
  fullScreenEntered: "FULL_SCREEN_ENTERED",
  fullScreenLeft: "FULL_SCREEN_LEFT",
  updateSuggestions: "UPDATE_SUGGESTIONS",

  // Scheduled action
  scheduleAction: "SCHEDULE_ACTION",
  cancelAction: "CANCEL_ACTION",
  endAction: "END_ACTION",
  confirmAction: "CONFIRM_ACTION",
});

export const ActionStatuses = Object.freeze({
  start: "START",
  end: "END",
});

export const FocusTargetTypes = Object.freeze({
  input: "INPUT",
  suggestion: "SUGGESTION",
});

export const InputTypes = Object.freeze({
  number: "number",
  selectInput: "selectInput",
  choice: "choice",
  nasaTlx: "nasaTlx",
});

export const TaskTypes = Object.freeze({
  typingTask: "TypingTask",
  s3Upload: "S3Upload",
  endExperiment: "EndExperiment",
  startup: "Startup",
  demographicQuestionnaire: "DemographicQuestionnaire",
  blockQuestionnaire: "BlockQuestionnaire",
  tutorial: "Tutorial",
  consentForm: "ConsentForm",
  finalFeedbacks: "FinalFeedbacks",
  injectEnd: "InjectEnd",
  fullScreenRequest: "FullScreenRequest",
  measureDisplay: "MeasureDisplay",

  // Typing test-only tasks.
  typingSpeedTask: "TypingSpeedTask",
  results: "Results",

  // These tasks are built in @hcikit
  informationScreen: "InformationScreen",
  experimentProgress: "ExperimentProgress",
  switchDevice: "SwitchDevice",
});

export const TutorialSteps = Object.freeze({
  start: "Start",
  input: "Input",
  suggestion: " Suggestion",
  wrongSuggestion: "WrongSuggestion",
  error: "Error",
  delay: "Delay",
  delaySuggestion: "DelaySuggestion",
  finalWhiteSpace: "FinalWhiteSpace",
  finish: "Finish",
  end: "End",
});

export const SuggestionTypes = Object.freeze({
  none: "NONE",
  inline: "INLINE",
  bar: "BAR",
});

export const Directions = Object.freeze({
  horizontal: "HORIZONTAL",
  vertical: "VERTICAL",
});

export const Devices = Object.freeze({
  laptop: "laptop",
  tablet: "tablet",
  phone: "phone",
});

export const agreementScaleAnswers = Object.freeze([
  "Strongly disagree",
  "Disagree",
  "Somewhat disagree",
  "Neither agree nor disagree",
  "Somewhat agree",
  "Agree",
  "Strongly agree",
]);

// This is copied from the control-server module.
export const MessageTypes = Object.freeze({
  response: "response",
  command: "command",
  register: "register",
  unregister: "unregister",
  error: "error",
  setClients: "set-clients",
  clearLogs: "clear-logs",
  setLogs: "set-logs",
  log: "log",
});

// This is copied from the control-server module.
export const UserRoles = Object.freeze({
  moderator: "moderator",
  participant: "participant",
});

export const defaultMinSuggestionDelay = 200; // in ms.

export const LogTypes = Object.freeze({
  switchDevice: "switch-device",
  typingSpeedResults: "typing-speed-results",
  measureDisplay: "measure-display",
  resetDialog: "reset-dialog",
});

export const Paths = Object.freeze({
  viewer: "/viewer",
  setup: "/",
  waitingRoom: "/waiting-room",
  moderation: "/moderation",
  experiment: "/experiment",
  typingTest: "/typing-test",
});
