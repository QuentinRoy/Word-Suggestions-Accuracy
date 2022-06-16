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
  Accuracy,
  KeyStrokeDelay,
  questionLabels,
} from "../lib/data"
import ChoiceControl from "../components/ChoiceControl"
import useVisualizationData from "../lib/use-visualization-data"
import Compound2dAgreementChart from "../components/chart/Compound2dAgreementChart"

const accuracyLabels = labelsByFactors.accuracy

export default function CompoundPage({
  data,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const {
    selectedRows,
    selectedExperiments,
    selectedQuestions,
    availableExperiments,
    setSelectedExperiments,
  } = useVisualizationData(data, { accuracies: "*", questions: "*" })

  if (selectedExperiments.size !== 1) {
    throw new Error(
      "Expected exactly one selected experiment and one selected question"
    )
  }

  // There should always be only one experiment and question selected.
  let [selectedExperiment] = selectedExperiments

  let groups = typingEfficiencyFactorIds[selectedExperiment]
  let groupLabels = labelsByFactors[groups]

  return (
    <>
      <Head>
        <title>Experiment Results</title>
      </Head>
      <div
        css={{
          "@media print": {
            display: "none",
          },
        }}
      >
        <Container maxWidth="md">
          <Paper component="header" sx={{ my: 2, p: 2 }}>
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
          </Paper>
        </Container>
      </div>

      <div
        css={{
          width: "fit-content",
          margin: "20px auto",
          background: "white",
          fontFamily: '"Linux Libertine"',
          "@media print": {
            border: "solid 1px black",
          },
        }}
      >
        <Compound2dAgreementChart
          height={selectedExperiment === "devices" ? 600 : 1000}
          width={1000}
          theme={
            selectedExperiment === "devices"
              ? {
                  plot: { margin: { left: 100, top: 20, bottom: 100 } },
                  facets: { label: { margin: 90 } },
                }
              : {
                  plot: { margin: { left: 90, top: 20, bottom: 100 } },
                  facets: { label: { margin: 80 } },
                }
          }
          facet1="accuracy"
          facet2="question"
          groups={groups}
          data={selectedRows}
          groupLabels={groupLabels as Record<string, string>}
          facet1Labels={accuracyLabels}
          facet2Labels={questionLabels}
          facet2Columns={2}
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
