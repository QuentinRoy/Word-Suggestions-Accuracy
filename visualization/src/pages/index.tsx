import fs from "fs/promises"
import path from "path"
import * as React from "react"
import { GetStaticProps, InferGetStaticPropsType } from "next"
import Head from "next/head"
import { Box, Container, Paper } from "@mui/material"
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
} from "../lib/data"
import { ChartThemeProvider } from "../lib/chart-theme"
import AgreementChart from "../components/chart/AgreementChart"
import ChoiceControl from "../components/ChoiceControl"
import AccuracyControl from "../components/AccuracyControl"
import useVisualizationData from "../lib/use-visualization-data"

export default function IndexPage({
  data,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const {
    selectedRows,
    selectedAccuracy,
    selectedExperiment,
    selectedQuestion,
    availableQuestions,
    availableAccuracies,
    availableExperiments,
    selectExperiment,
    selectQuestion,
    selectAccuracy,
  } = useVisualizationData(data, { accuracy: 0.5 })

  let groups = typingEfficiencyFactorIds[selectedExperiment!]
  let groupLabels = labelsByFactors[groups]

  return (
    <>
      <Head>
        <title>Experiment Results</title>
      </Head>

      <ChartThemeProvider>
        <Container maxWidth="md">
          <Box component="header">
            <Box my={4}>
              <ChoiceControl
                groupLabel="Experiment"
                value={selectedExperiment}
                onChange={experiment => selectExperiment(experiment)}
                availableValues={availableExperiments}
                labels={experimentLabels}
              />
            </Box>
            <Box my={4}>
              <ChoiceControl
                groupLabel="Question"
                value={selectedQuestion}
                onChange={question => selectQuestion(question)}
                availableValues={availableQuestions}
                labels={questionLabels}
              />
            </Box>
            {selectedAccuracy === "*" ? null : (
              <Box my={4}>
                <AccuracyControl
                  value={selectedAccuracy}
                  onChange={accuracy => selectAccuracy(accuracy)}
                  availableValues={availableAccuracies}
                />
              </Box>
            )}
          </Box>
          <Paper>
            <AgreementChart
              groups={groups}
              data={selectedRows}
              groupLabels={groupLabels}
            />
          </Paper>
        </Container>
      </ChartThemeProvider>
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
    accuracy: parseFloat(rawRow.accuracy as string),
    device: rawRow.device as DeviceId,
    keyStrokeDelay: parseInt(rawRow.keyStrokeDelay as string, 10),
    question: rawRow.question as QuestionId,
    answer: rawRow.answer as AgreementAnswer,
    totalAnswers: parseInt(rawRow.totalAnswers as string, 10),
  }))
  return { props: { data } }
}
