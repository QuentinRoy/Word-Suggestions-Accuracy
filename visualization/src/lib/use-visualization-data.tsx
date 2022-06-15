import * as React from "react"
import {
  Accuracy,
  AgreementRow,
  ExperimentId,
  experimentLabels,
  accuracyLabels,
  QuestionId,
  questionLabels,
} from "./data"
import { findClosest } from "./find-closest"
import { group } from "d3-array"

export const WILDCARD = "*"
type Wildcard = typeof WILDCARD

interface State {
  availableExperiments: Set<ExperimentId>
  requestedExperiments: ExperimentId[] | Wildcard | null
  selectedExperiments: Set<ExperimentId>
  availableAccuracies: Set<Accuracy>
  requestedAccuracies: Accuracy[] | Wildcard | null
  selectedAccuracies: Set<Accuracy>
  availableQuestions: Set<QuestionId>
  requestedQuestions: QuestionId[] | Wildcard | null
  selectedQuestions: Set<QuestionId>
  groupedRows: Map<ExperimentId, Map<QuestionId, Map<Accuracy, AgreementRow[]>>>
}

type InitialSelection = {
  experiments?: ExperimentId[] | Wildcard
  questions?: QuestionId[] | Wildcard
  accuracies?: Accuracy[] | Wildcard
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
      setSelectedExperiments(experiments: ExperimentId[]) {
        dispatch({ type: "setSelectedExperiments", experiments })
      },
      setSelectedQuestions(questions: QuestionId[]) {
        dispatch({ type: "setSelectedQuestions", questions })
      },
      setSelectedAccuracies(accuracies: Accuracy[]) {
        dispatch({ type: "setSelectedAccuracies", accuracies })
      },
    }),
    [dispatch]
  )

  return React.useMemo(() => {
    let selectedRows: AgreementRow[] = []

    for (let experiment of state.selectedExperiments) {
      for (let question of state.selectedQuestions) {
        for (let accuracy of state.selectedAccuracies) {
          let rows = groupedRows.get(experiment)?.get(question)?.get(accuracy)
          if (rows != null) selectedRows.push(...rows)
        }
      }
    }
    return { selectedRows, ...state, ...callbacks }
  }, [state, groupedRows, callbacks])
}

type InitStateArgs = InitialSelection & { data: AgreementRow[] }
function getInitState({
  data,
  experiments,
  questions,
  accuracies,
}: InitStateArgs): State {
  let groupedRows = group(
    data,
    d => d.experiment,
    d => d.question,
    d => d.accuracy
  )
  let availableExperiments = new Set(groupedRows.keys())

  let selectedExperiments: Set<ExperimentId>
  if (experiments == null) {
    selectedExperiments = new Set()
    let firstPossible = findFirstPossible(
      Object.keys(experimentLabels) as ExperimentId[],
      availableExperiments
    )
    if (firstPossible != null) selectedExperiments.add(firstPossible)
  } else if (experiments === "*") {
    selectedExperiments = new Set(availableExperiments)
  } else if (experiments.every(exp => availableExperiments.has(exp))) {
    selectedExperiments = new Set(experiments)
  } else {
    // Throws if some requested experiments are not available.
    throw new Error(
      `Unavailable experiments: ${experiments
        .filter(exp => !availableExperiments.has(exp))
        .join(", ")}`
    )
  }

  let availableQuestions = getAvailableQuestions(
    groupedRows,
    selectedExperiments
  )

  let selectedQuestions: Set<QuestionId>
  if (questions == null) {
    selectedQuestions = new Set()
    let firstPossible = findFirstPossible(
      Object.keys(questionLabels) as QuestionId[],
      availableQuestions
    )
    if (firstPossible != null) selectedQuestions.add(firstPossible)
  } else if (questions === "*") {
    selectedQuestions = new Set(availableQuestions)
  } else if (questions.every(q => availableQuestions.has(q))) {
    selectedQuestions = new Set(questions)
  } else {
    // Throws if some requested experiments are not available.
    throw new Error(
      `Unavailable questions: ${questions
        .filter(q => !availableQuestions.has(q))
        .join(", ")}`
    )
  }

  let availableAccuracies = getAvailableAccuracies(
    groupedRows,
    selectedExperiments,
    selectedQuestions
  )

  let selectedAccuracies: Set<Accuracy>
  if (accuracies == null) {
    selectedAccuracies = new Set()
    let firstPossible = findFirstPossible(
      Object.keys(accuracyLabels) as Accuracy[],
      availableAccuracies
    )
    if (firstPossible != null) selectedAccuracies.add(firstPossible)
  } else if (accuracies === "*") {
    selectedAccuracies = new Set(availableAccuracies)
  } else if (accuracies.every(a => availableAccuracies.has(a))) {
    selectedAccuracies = new Set(accuracies)
  } else {
    // Throws if some requested experiments are not available.
    throw new Error(
      `Unavailable accuracies: ${accuracies
        .filter(a => !availableAccuracies.has(a))
        .join(", ")}`
    )
  }

  return {
    availableExperiments,
    requestedExperiments: experiments ?? null,
    selectedExperiments,
    availableQuestions,
    requestedQuestions: questions ?? null,
    selectedQuestions,
    availableAccuracies,
    requestedAccuracies: accuracies ?? null,
    selectedAccuracies,
    groupedRows,
  }
}

const questionIds = Object.keys(questionLabels) as QuestionId[]

type Action =
  | { type: "setSelectedExperiments"; experiments: ExperimentId[] | Wildcard }
  | { type: "setSelectedQuestions"; questions: QuestionId[] | Wildcard }
  | { type: "setSelectedAccuracies"; accuracies: Accuracy[] | Wildcard }

function reducer(prevState: State, action: Action): State {
  let {
    selectedExperiments,
    selectedAccuracies,
    selectedQuestions,
    availableExperiments,
    availableAccuracies,
    availableQuestions,
    requestedExperiments,
    requestedQuestions,
    requestedAccuracies,
    groupedRows,
  } = prevState
  switch (action.type) {
    case "setSelectedExperiments":
      requestedExperiments = action.experiments
      if (
        requestedExperiments === WILDCARD ||
        requestedExperiments.every(exp => availableExperiments.has(exp))
      ) {
        selectedExperiments =
          requestedExperiments === WILDCARD
            ? availableExperiments
            : new Set(requestedExperiments)
        availableQuestions = getAvailableQuestions(
          groupedRows,
          selectedExperiments
        )
        selectedQuestions = updateQuestionSelection(
          requestedQuestions,
          availableQuestions
        )
        availableAccuracies = getAvailableAccuracies(
          groupedRows,
          selectedExperiments,
          selectedQuestions
        )
        selectedAccuracies = updateAccuracySelection(
          requestedAccuracies,
          availableAccuracies
        )
      } else {
        // Throws if some requested experiments are not available.
        throw new Error(
          `Unavailable experiments: ${requestedExperiments
            .filter(exp => !availableExperiments.has(exp))
            .join(", ")}`
        )
      }
      break
    case "setSelectedQuestions":
      requestedQuestions = action.questions
      if (
        requestedQuestions === WILDCARD ||
        requestedQuestions.every(q => availableQuestions.has(q))
      ) {
        selectedQuestions = updateQuestionSelection(
          requestedQuestions,
          availableQuestions
        )
        availableAccuracies = getAvailableAccuracies(
          groupedRows,
          selectedExperiments,
          selectedQuestions
        )
        selectedAccuracies = updateAccuracySelection(
          requestedAccuracies,
          availableAccuracies
        )
      } else {
        // Throws if some requested experiments are not available.
        throw new Error(
          `Unavailable questions: ${requestedQuestions
            .filter(q => !availableQuestions.has(q))
            .join(", ")}`
        )
      }
      break
    case "setSelectedAccuracies":
      requestedAccuracies = action.accuracies
      if (
        requestedAccuracies === WILDCARD ||
        requestedAccuracies.every(a => availableAccuracies.has(a))
      ) {
        selectedAccuracies = updateAccuracySelection(
          requestedAccuracies,
          availableAccuracies
        )
      } else {
        // Throws if some requested experiments are not available.
        throw new Error(
          `Unavailable accuracies: ${requestedAccuracies
            .filter(a => !availableAccuracies.has(a))
            .join(", ")}`
        )
      }
  }

  return {
    ...prevState,
    availableExperiments,
    selectedExperiments,
    availableQuestions,
    selectedQuestions,
    selectedAccuracies,
    availableAccuracies,
    requestedExperiments,
    requestedQuestions,
    requestedAccuracies,
  }
}

function getAvailableQuestions(
  groupedRows: State["groupedRows"],
  selectedExperiments: Set<ExperimentId>
) {
  let availableQuestions = new Set<QuestionId>()
  if (selectedExperiments.size > 0) {
    selectedExperiments.forEach(exp => {
      let g = groupedRows.get(exp)
      if (g != null) {
        for (let qid of g.keys()) {
          availableQuestions.add(qid)
        }
      }
    })
  }
  return availableQuestions
}

function updateQuestionSelection(
  requestedSelection: Iterable<QuestionId> | Wildcard | null,
  availabilities: Set<QuestionId>
): Set<QuestionId> {
  if (requestedSelection === WILDCARD) {
    return availabilities
  }
  let newSelections = new Set<QuestionId>()
  let isRequestedSelectionEmpty = true
  for (let sel of requestedSelection ?? []) {
    isRequestedSelectionEmpty = false
    if (availabilities.has(sel)) {
      newSelections.add(sel)
    }
  }
  // Strive to always return a non empty selection, unless it is explicitly
  // requested.
  if (
    (!isRequestedSelectionEmpty && newSelections.size === 0) ||
    requestedSelection === null
  ) {
    let first = questionIds.find(v => availabilities.has(v))
    if (first != null) newSelections.add(first)
  }
  return newSelections
}

function getAvailableAccuracies(
  groupedRows: State["groupedRows"],
  selectedExperiments: Set<ExperimentId>,
  selectedQuestions: Set<QuestionId>
) {
  let availableAccuracies = new Set<Accuracy>()
  if (selectedExperiments.size > 0 && selectedQuestions.size > 0) {
    selectedExperiments.forEach(exp => {
      selectedQuestions.forEach(q => {
        let g = groupedRows.get(exp)?.get(q)
        if (g != null) {
          for (let a of g.keys()) {
            availableAccuracies.add(a)
          }
        }
      })
    })
  }
  return availableAccuracies
}

function updateAccuracySelection(
  requestedSelection: Iterable<Accuracy> | Wildcard | null,
  availabilities: Set<Accuracy>
): Set<Accuracy> {
  if (requestedSelection === WILDCARD) {
    return availabilities
  }
  if (requestedSelection == null) {
    let [first] = availabilities
    return new Set([first])
  }
  let newSelections = new Set<Accuracy>()
  let availabilitiesList = Array.from(availabilities)
  for (let sel of requestedSelection ?? []) {
    let closest = findClosest(parseFloat(sel), availabilitiesList, (v, a) =>
      Math.abs(v - parseFloat(a))
    )
    newSelections.add(closest)
  }
  return newSelections
}

function findFirstPossible<T>(values: T[], availableValues: Set<any>) {
  return values.find(v => availableValues.has(v))
}
