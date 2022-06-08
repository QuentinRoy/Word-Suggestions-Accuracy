import fs from "fs/promises"
import path from "path"
import * as React from "react"
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
import { ChartThemeProvider } from "../lib/chart-theme"
import SimpleAgreementChart from "../components/chart/SimpleAgreementChart"
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
  } = useVisualizationData(data, { accuracy: "0.5" })

  let groups = typingEfficiencyFactorIds[selectedExperiment!]
  let groupLabels = labelsByFactors[groups]

  return (
    <>
      <Head>
        <title>Experiment Results</title>
      </Head>

      <Container maxWidth="md" sx={{ my: 2 }}>
        <Paper component="header" sx={{ p: 2, mb: 2 }}>
          <Box mb={2}>
            <ChoiceControl
              groupLabel="Experiment"
              value={selectedExperiment}
              onChange={experiment => selectExperiment(experiment)}
              availableValues={availableExperiments}
              labels={experimentLabels}
            />
          </Box>
          <Box mb={selectedAccuracy === "*" ? 0 : 2}>
            <ChoiceControl
              groupLabel="Question"
              value={selectedQuestion}
              onChange={question => selectQuestion(question)}
              availableValues={availableQuestions}
              labels={questionLabels}
            />
          </Box>
          {selectedAccuracy === "*" ? null : (
            <Box>
              <AccuracyControl
                value={selectedAccuracy}
                onChange={accuracy => selectAccuracy(accuracy)}
                availableValues={availableAccuracies}
              />
            </Box>
          )}
        </Paper>
        <Card>
          <ChartThemeProvider>
            <SimpleAgreementChart
              type="diverging"
              groups={groups}
              data={selectedRows}
              groupLabels={groupLabels}
            />
          </ChartThemeProvider>
        </Card>
      </Container>
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
