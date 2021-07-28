import { range } from "d3-array"

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

export type QuestionId =
  | "controls_satisfactory"
  | "suggestions_accuracy"
  | "keyboard_use_efficiency"
  | "suggestion_distraction"
export type DeviceId = "desktop" | "tablet" | "phone"
export type ExperimentId = "devices" | "amt_bar" | "amt_inline"
export type EfficiencyFactor = "device" | "keyStrokeDelay"

export interface AgreementRow {
  experiment: ExperimentId
  accuracy: number
  device: DeviceId
  keyStrokeDelay: number
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
    amt_bar: "Keytime and three suggestions",
    amt_inline: "Keytime and one suggestion",
  })

export const efficiencyFactors: Readonly<
  Record<ExperimentId, EfficiencyFactor>
> = Object.freeze({
  devices: "device",
  amt_bar: "keyStrokeDelay",
  amt_inline: "keyStrokeDelay",
})

const getKeyStrokeDelayLabel = (kt: number) => `${kt} ms`
export const keyStrokeDelayLabels = Object.freeze(
  Object.fromEntries(
    range(0, 250, 50).map(kt => [`${kt}`, getKeyStrokeDelayLabel(kt)])
  )
)

export const labelsByFactors: Readonly<
  Record<EfficiencyFactor, { [group: string]: string }>
> = Object.freeze({
  device: deviceLabels,
  keyStrokeDelay: keyStrokeDelayLabels,
})
