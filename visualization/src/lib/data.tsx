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
export type AgreementAnswer =
  | "strongly agree"
  | "agree"
  | "somewhat agree"
  | "neither agree nor disagree"
  | "somewhat disagree"
  | "disagree"
  | "strongly disagree"

// All the possible answers ordered by strength.
export const neutralAgreementAnswer =
  "neither agree nor disagree" as AgreementAnswer
export const positiveAgreementAnswers = [
  "strongly agree",
  "agree",
  "somewhat agree",
] as AgreementAnswer[]
export const negativeAgreementAnswers = [
  "strongly disagree",
  "disagree",
  "somewhat disagree",
] as AgreementAnswer[]

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
  desktop: "desktop",
  tablet: "tablet",
  phone: "phone",
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

export const agreementAnswerLabels: Readonly<Record<AgreementAnswer, string>> =
  Object.freeze({
    "strongly agree": "strongly agree",
    agree: "agree",
    "somewhat agree": "somewhat agree",
    "neither agree nor disagree": "neither agree nor disagree",
    "somewhat disagree": "somewhat disagree",
    disagree: "disagree",
    "strongly disagree": "strongly disagree",
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

export const accuracyLabels: Readonly<Record<Accuracy, string>> = Object.freeze(
  {
    "0.1": "accuracy 0.1",
    "0.3": "accuracy 0.3",
    "0.5": "accuracy 0.5",
    "0.7": "accuracy 0.7",
    "0.9": "accuracy 0.9",
  }
)

export const labelsByFactors: Readonly<
  Record<Factor, { [group: string]: string }>
> = Object.freeze({
  accuracy: accuracyLabels,
  device: deviceLabels,
  keyStrokeDelay: keyStrokeDelayLabels,
})
