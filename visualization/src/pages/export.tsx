import fs from "fs/promises"
import path from "path"
import { GetStaticProps, InferGetStaticPropsType } from "next"
import Head from "next/head"
import { Box, Card, Container, Paper } from "@mui/material"
import { csvParse } from "d3-dsv"
import {
  AgreementAnswer,
  AgreementRow,
  DeviceId,
  ExperimentId,
  QuestionId,
  typingEfficiencyFactorIds,
  experimentLabels,
  labelsByFactors,
  questionLabels,
  Accuracy,
  KeyStrokeDelay,
} from "../lib/data"
import ChoiceControl from "../components/ChoiceControl"
import useVisualizationData from "../lib/use-visualization-data"
import CompoundAgreementChart from "../components/chart/CompoundAgreementChart"

const accuracyLabels = labelsByFactors.accuracy

export default function CompoundPage({
  data,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const {
    selectedRows,
    selectedExperiments,
    selectedQuestions,
    availableQuestions,
    availableExperiments,
    setSelectedExperiments,
    setSelectedQuestions,
  } = useVisualizationData(data, { accuracies: "*" })

  if (selectedExperiments.size !== 1 || selectedQuestions.size !== 1) {
    throw new Error(
      "Expected exactly one selected experiment and one selected question"
    )
  }

  // There should always be only one experiment and question selected.
  let [selectedExperiment] = selectedExperiments
  let [selectedQuestion] = selectedQuestions

  let groups = typingEfficiencyFactorIds[selectedExperiment!]
  let groupLabels = labelsByFactors[groups]

  return (
    <>
      <Head>
        <title>Experiment Results</title>
      </Head>
      <Paper component="header" sx={{ p: 2, mb: 2 }}>
        <Box mb={2}>
          <ChoiceControl
            groupLabel="Experiment"
            value={selectedExperiment}
            onChange={experiment => {
              setSelectedExperiments([experiment])
            }}
            availableValues={availableExperiments}
            labels={experimentLabels}
          />
        </Box>
        <Box>
          <ChoiceControl
            groupLabel="Question"
            value={selectedQuestion}
            onChange={question => {
              setSelectedQuestions([question])
            }}
            availableValues={availableQuestions}
            labels={questionLabels}
          />
        </Box>
      </Paper>

      <div
        css={{
          width: "fit-content",
          margin: "20px auto",
          background: "white",
          fontFamily: '"Linux Libertine"',
        }}
      >
        <CompoundAgreementChart
          height={selectedExperiment === "devices" ? 300 : 520}
          theme={
            selectedExperiment === "devices"
              ? {
                  plot: { margin: { left: 100 } },
                  facets: { label: { margin: 90 } },
                }
              : {
                  plot: { margin: { left: 90 } },
                  facets: { label: { margin: 80 } },
                }
          }
          facets="accuracy"
          groups={groups}
          data={selectedRows}
          groupLabels={groupLabels}
          facetLabels={accuracyLabels}
          type="solid"
        />
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps<{
  data: AgreementRow[]
}> = async () => {
  let csvData = await fs.readFile(
    path.join(process.cwd(), "data", "agreement-data.csv"),
    "utf-8"
  )
  let data = csvParse<AgreementRow, string>(csvData, rawRow => ({
    experiment: rawRow.experiment as ExperimentId,
    // Do not convert accuracy and keyStrokeDelay to numbers, because it could
    // cause floating point issues, and they are discreet values anyway.
    accuracy: rawRow.accuracy as Accuracy,
    keyStrokeDelay: rawRow.keyStrokeDelay as KeyStrokeDelay,
    device: rawRow.device as DeviceId,
    question: rawRow.question as QuestionId,
    answer: rawRow.answer as AgreementAnswer,
    totalAnswers: parseInt(rawRow.totalAnswers as string, 10),
  }))
  return { props: { data } }
}

type Action =
  | { type: "selectExperiment"; experiment: ExperimentId }
  | { type: "setSelectedQuestions"; questions: QuestionId[] }

type State = {
  selectedRows: AgreementRow[]
  selectedExperiment: ExperimentId
  selectedQuestions: QuestionId[]
  availableQuestions: QuestionId[]
  availableExperiments: ExperimentId[]
}
