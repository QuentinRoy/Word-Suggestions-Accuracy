import * as React from "react"
import fs from "fs/promises"
import path from "path"
import AgreementGraph from "./agreement-chart"
import { Box, Container, Paper } from "@material-ui/core"
import {
  AgreementAnswer,
  AgreementRow,
  DeviceId,
  efficiencyFactors,
  ExperimentId,
  experimentLabels,
  labelsByFactors,
  QuestionId,
  questionLabels,
} from "../utils/data-types"
import { findClosestNumber } from "../utils/find-closest"
import { group } from "d3-array"
import ChoiceControl from "./ChoiceControl"
import AccuracyControl from "./AccuracyControl"

function findFirstPossible<T>(values: T[], availableValues: Set<any>) {
  return values.find(v => availableValues.has(v))
}

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
  | { type: "setExperiment"; experiment: ExperimentId }
  | { type: "setQuestion"; question: QuestionId }
  | { type: "setAccuracy"; accuracy: number }

type VisualizationProps = {
  data: AgreementRow[]
}
export default function Visualization({ data }: VisualizationProps) {
  const [
    {
      groupedRows,
      selectedAccuracy,
      selectedExperiment,
      selectedQuestion,
      availableQuestions,
      availableAccuracies,
      availableExperiments,
    },
    dispatch,
  ] = React.useReducer(reducer, data, initState)

  let selectedRows =
    (selectedExperiment != null &&
      selectedQuestion != null &&
      selectedAccuracy != null &&
      groupedRows
        .get(selectedExperiment)
        ?.get(selectedQuestion)
        ?.get(selectedAccuracy)) ||
    []

  let groups = efficiencyFactors[selectedExperiment!]
  let groupLabels = labelsByFactors[groups]

  return (
    <Container maxWidth="md">
      <Box component="header">
        <Box my={4}>
          <ChoiceControl
            groupLabel="Experiment"
            value={selectedExperiment}
            onChange={experiment =>
              dispatch({ type: "setExperiment", experiment })
            }
            availableValues={availableExperiments}
            labels={experimentLabels}
          />
        </Box>
        <Box my={4}>
          <ChoiceControl
            groupLabel="Question"
            value={selectedQuestion}
            onChange={question => dispatch({ type: "setQuestion", question })}
            availableValues={availableQuestions}
            labels={questionLabels}
          />
        </Box>
        <Box my={4}>
          <AccuracyControl
            value={selectedAccuracy}
            onChange={accuracy => dispatch({ type: "setAccuracy", accuracy })}
            availableValues={availableAccuracies}
          />
        </Box>
      </Box>

      <Paper>
        <AgreementGraph
          groups={groups}
          data={selectedRows}
          groupLabels={groupLabels}
        />
      </Paper>
    </Container>
  )
}

function initState(rows: AgreementRow[]): State {
  let groupedRows = group(
    rows,
    d => d.experiment,
    d => d.question,
    d => d.accuracy
  )

  let availableExperiments = new Set(groupedRows.keys())
  let selectedExperiment = findFirstPossible(
    Object.keys(experimentLabels) as ExperimentId[],
    availableExperiments
  )
  let availableQuestions = selectedExperiment
    ? new Set(groupedRows.get(selectedExperiment)?.keys())
    : new Set<QuestionId>()
  const selectedQuestion = findFirstPossible(
    Object.keys(questionLabels) as QuestionId[],
    availableQuestions
  )

  let availableAccuracies = Array.from(
    (selectedQuestion != null &&
      selectedExperiment != null &&
      groupedRows.get(selectedExperiment)?.get(selectedQuestion)?.keys()) ||
      []
  )

  let selectedAccuracy = availableAccuracies[0]

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
    case "setExperiment":
      selectedExperiment = action.experiment
      if (!availableExperiments.has(selectedExperiment)) {
        throw new Error(`Unavailable experiment: ${selectedExperiment}`)
      }
      availableQuestions = new Set(groupedRows.get(action.experiment)?.keys())
      break
    case "setQuestion":
      selectedQuestion = action.question
      if (!availableQuestions.has(selectedQuestion)) {
        throw new Error(`Unavailable question: ${selectedQuestion}`)
      }
      break
    case "setAccuracy":
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
