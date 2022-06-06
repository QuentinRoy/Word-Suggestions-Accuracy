import * as React from "react"
import {
  AgreementRow,
  ExperimentId,
  experimentLabels,
  QuestionId,
  questionLabels,
} from "./data"
import { findClosestNumber } from "./find-closest"
import { group } from "d3-array"

type InitialSelection = {
  experiment?: ExperimentId
  question?: QuestionId
  accuracy?: number
}

// The data argument is not controlled, only the initial value will be used and
// further changes will be ignored.
export default function useVisualizationData(
  data: AgreementRow[],
  init: InitialSelection = {}
) {
  // We use a reduce rather than different states because the different
  // selections depend on each other; for example the selected question
  // depends on the selected experiment.
  // We extract groupedRows from the state because this is internal and we do
  // not want it to be part of the result.
  const [{ groupedRows, ...state }, dispatch] = React.useReducer(
    reducer,
    { data, ...init },
    getInitState
  )
  // useMemo ensures the functions do not change, and allows us to create all
  // of them at once.
  const callbacks = React.useMemo(
    () => ({
      selectExperiment(experiment: ExperimentId) {
        dispatch({ type: "selectExperiment", experiment })
      },
      selectQuestion(question: QuestionId) {
        dispatch({ type: "selectQuestion", question })
      },
      selectAccuracy(accuracy: number) {
        dispatch({ type: "selectAccuracy", accuracy })
      },
    }),
    [dispatch]
  )
  return React.useMemo(
    () => ({
      selectedRows:
        (state.selectedExperiment != null &&
          state.selectedQuestion != null &&
          state.selectedAccuracy != null &&
          groupedRows
            .get(state.selectedExperiment)
            ?.get(state.selectedQuestion)
            ?.get(state.selectedAccuracy)) ||
        [],
      ...state,
      ...callbacks,
    }),
    [state, groupedRows, callbacks]
  )
}

type InitStateArgs = InitialSelection & { data: AgreementRow[] }
function getInitState({
  data,
  experiment,
  question,
  accuracy,
}: InitStateArgs): State {
  let groupedRows = group(
    data,
    d => d.experiment,
    d => d.question,
    d => d.accuracy
  )
  let availableExperiments = new Set(groupedRows.keys())
  let selectedExperiment =
    experiment ??
    findFirstPossible(
      Object.keys(experimentLabels) as ExperimentId[],
      availableExperiments
    )
  if (
    selectedExperiment != null &&
    !availableExperiments.has(selectedExperiment)
  ) {
    throw new Error(`Unavailable experiment: ${selectedExperiment}`)
  }

  let availableQuestions = selectedExperiment
    ? new Set(groupedRows.get(selectedExperiment)?.keys())
    : new Set<QuestionId>()
  const selectedQuestion =
    question ??
    findFirstPossible(
      Object.keys(questionLabels) as QuestionId[],
      availableQuestions
    )
  if (selectedQuestion != null && !availableQuestions.has(selectedQuestion)) {
    throw new Error(`Unavailable question: ${selectedQuestion}`)
  }

  let availableAccuracies = Array.from(
    (selectedQuestion != null &&
      selectedExperiment != null &&
      groupedRows.get(selectedExperiment)?.get(selectedQuestion)?.keys()) ||
      []
  )
  let selectedAccuracy = accuracy ?? availableAccuracies[0]
  if (
    selectedAccuracy != null &&
    !availableAccuracies.includes(selectedAccuracy)
  ) {
    throw new Error(`Unavailable accuracy: ${selectedAccuracy}`)
  }
  return {
    groupedRows,
    availableExperiments,
    selectedExperiment,
    availableQuestions,
    selectedQuestion,
    availableAccuracies,
    selectedAccuracy,
  }
}

function updateChoiceSelection<T>(
  selection: T,
  availabilities: Set<any>,
  order: T[]
): T | undefined {
  if (availabilities.has(selection)) return selection
  return findFirstPossible(order, availabilities)
}

const questionIds = Object.keys(questionLabels) as QuestionId[]

interface State {
  availableAccuracies: number[]
  selectedAccuracy?: number
  availableExperiments: Set<ExperimentId>
  selectedExperiment?: ExperimentId
  availableQuestions: Set<QuestionId>
  selectedQuestion?: QuestionId
  groupedRows: Map<ExperimentId, Map<QuestionId, Map<number, AgreementRow[]>>>
}

type Action =
  | { type: "selectExperiment"; experiment: ExperimentId }
  | { type: "selectQuestion"; question: QuestionId }
  | { type: "selectAccuracy"; accuracy: number }

function findFirstPossible<T>(values: T[], availableValues: Set<any>) {
  return values.find(v => availableValues.has(v))
}

function reducer(prevState: State, action: Action): State {
  let {
    selectedExperiment,
    selectedQuestion,
    selectedAccuracy,
    availableQuestions,
    availableExperiments,
    availableAccuracies,
    groupedRows,
  } = prevState
  switch (action.type) {
    case "selectExperiment":
      selectedExperiment = action.experiment
      if (!availableExperiments.has(selectedExperiment)) {
        throw new Error(`Unavailable experiment: ${selectedExperiment}`)
      }
      availableQuestions = new Set(groupedRows.get(action.experiment)?.keys())
      break
    case "selectQuestion":
      selectedQuestion = action.question
      if (!availableQuestions.has(selectedQuestion)) {
        throw new Error(`Unavailable question: ${selectedQuestion}`)
      }
      break
    case "selectAccuracy":
      selectedAccuracy = action.accuracy
      if (!availableAccuracies.includes(selectedAccuracy)) {
        throw new Error(`Unavailable accuracy: ${selectedAccuracy}`)
      }
  }
  selectedQuestion = updateChoiceSelection(
    selectedQuestion,
    availableQuestions,
    questionIds
  )
  availableAccuracies = Array.from(
    (selectedQuestion != null &&
      selectedExperiment != null &&
      groupedRows.get(selectedExperiment)?.get(selectedQuestion)?.keys()) ||
      []
  )
  selectedAccuracy = findClosestNumber(
    selectedAccuracy ?? 0,
    availableAccuracies
  )

  return {
    ...prevState,
    availableExperiments,
    selectedExperiment,
    availableQuestions,
    selectedQuestion,
    selectedAccuracy,
    availableAccuracies,
  }
}
