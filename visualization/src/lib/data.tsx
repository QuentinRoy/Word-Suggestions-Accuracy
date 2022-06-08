export enum AgreementAnswer {
  StronglyAgree = "Strongly agree",
  Agree = "Agree",
  SomewhatAgree = "Somewhat agree",
  NeitherAgreeNorDisagree = "Neither agree nor disagree",
  SomewhatDisagree = "Somewhat disagree",
  Disagree = "Disagree",
  StronglyDisagree = "Strongly disagree",
}
// All the possible answers ordered by strength.
export const neutralAgreementAnswer = AgreementAnswer.NeitherAgreeNorDisagree
export const positiveAgreementAnswers = [
  AgreementAnswer.StronglyAgree,
  AgreementAnswer.Agree,
  AgreementAnswer.SomewhatAgree,
]
export const negativeAgreementAnswers = [
  AgreementAnswer.StronglyDisagree,
  AgreementAnswer.Disagree,
  AgreementAnswer.SomewhatDisagree,
]

export type ExperimentId = "devices" | "amt_bar" | "amt_inline"
export type QuestionId =
  | "controls_satisfactory"
  | "suggestions_accuracy"
  | "keyboard_use_efficiency"
  | "suggestion_distraction"
export type DeviceId = "desktop" | "tablet" | "phone"
export type EfficiencyFactor = "device" | "keyStrokeDelay"
export type Factor = EfficiencyFactor | "accuracy"
export type Accuracy = "0.1" | "0.3" | "0.5" | "0.7" | "0.9"
export type KeyStrokeDelay = "0" | "50" | "100" | "200"

export type AgreementRow = {
  experiment: ExperimentId
  accuracy: Accuracy
  device: DeviceId
  keyStrokeDelay: KeyStrokeDelay
  question: QuestionId
  answer: AgreementAnswer
  totalAnswers: number
}

export const deviceLabels: Readonly<Record<DeviceId, string>> = Object.freeze({
  desktop: "Desktop",
  tablet: "Tablet",
  phone: "Phone",
})

export const questionLabels: Readonly<Record<QuestionId, string>> =
  Object.freeze({
    controls_satisfactory:
      "The controls (keyboard and word suggestions) are satisfactory for the completion of the task.",
    suggestions_accuracy: "The word suggestions are accurate.",
    keyboard_use_efficiency:
      "The use of the keyboard is efficient in this task.",
    suggestion_distraction: "The word suggestions are distracting.",
  })

export const experimentLabels: Readonly<Record<ExperimentId, string>> =
  Object.freeze({
    devices: "Desktop, Tablet, and phone; and three suggestions",
    amt_bar: "Keytime and one suggestion in a suggestion bar",
    amt_inline: "Keytime and one inline suggestion",
  })

export const typingEfficiencyFactorIds: Readonly<
  Record<ExperimentId, EfficiencyFactor>
> = Object.freeze({
  devices: "device",
  amt_bar: "keyStrokeDelay",
  amt_inline: "keyStrokeDelay",
})

export const keyStrokeDelayLabels: Readonly<Record<KeyStrokeDelay, string>> =
  Object.freeze({
    "0": "0 ms",
    "50": "50 ms",
    "100": "100 ms",
    "200": "200 ms",
  })

export const keyAccuracyLabels: Readonly<Record<Accuracy, string>> =
  Object.freeze({
    "0.1": "Accuracy 0.1",
    "0.3": "Accuracy 0.3",
    "0.5": "Accuracy 0.5",
    "0.7": "Accuracy 0.7",
    "0.9": "Accuracy 0.9",
  })

export const labelsByFactors: Readonly<
  Record<Factor, { [group: string]: string }>
> = Object.freeze({
  accuracy: keyAccuracyLabels,
  device: deviceLabels,
  keyStrokeDelay: keyStrokeDelayLabels,
})
