import * as React from "react"
import fs from "fs/promises"
import path from "path"
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
  Accuracy,
  KeyStrokeDelay,
  questionLabels,
} from "../lib/data"
import ChoiceControl from "../components/ChoiceControl"
import useVisualizationData from "../lib/use-visualization-data"
import Compound2dAgreementChart from "../components/chart/Compound2dAgreementChart"
import { ptToMM } from "../lib/units"
import { useMemoMerge } from "../lib/use-memo-merge"
import { ChartTheme } from "../lib/chart-theme"
import { PartialDeep } from "type-fest"

const PAPER_TEXT_WIDTH = 139.0959 // mm

const accuracyLabels = labelsByFactors.accuracy

const baseTheme: PartialDeep<ChartTheme> = {
  animation: "none",
  plot: {
    margin: { top: 3, right: 3, left: 10, bottom: 15 },
  },
  subPlot: {
    gap: { vertical: 8, horizontal: 10 },
    label: { size: ptToMM(7), fontFamily: "Linux Libertine", margin: 1 },
  },
  facets: {
    label: {
      size: ptToMM(7),
      fontFamily: "Linux Libertine Capitals",
    },
    padding: { inner: 0.1, outer: 0.05 },
  },
  stacks: {
    padding: { inner: 0.05, outer: 0 },
  },
  axises: {
    x: {
      ticks: {
        margin: 0,
        width: 0.1,
        label: { size: ptToMM(6), fontFamily: "Linux Libertine Capitals" },
      },
    },
    y: {
      ticks: {
        margin: 1,
        width: 0.1,
        label: { size: ptToMM(7), fontFamily: "Linux Libertine Capitals" },
      },
    },
  },
  lines: { width: 0.1 },
  labels: { size: ptToMM(6), fontFamily: "Linux Libertine Capitals" },
  legend: {
    margin: { top: 5, right: 5, bottom: 5, left: 5 },
    width: 120,
    items: {
      size: ptToMM(7),
      margin: 1,
      label: { size: ptToMM(7), fontFamily: "Linux Libertine Capitals" },
    },
  },
}

export default function CompoundPage({
  data,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const {
    selectedRows,
    selectedExperiments,
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

  let experimentLabel = experimentLabels[selectedExperiment]

  let theme = useMemoMerge(
    baseTheme,
    selectedExperiment === "devices"
      ? {
          plot: { margin: { left: 14.5 } },
          facets: { label: { margin: 14.5 } },
        }
      : {
          plot: { margin: { left: 12.5 } },
          facets: { label: { margin: 12.5 } },
        }
  ) as ChartTheme

  let plotWidth =
    PAPER_TEXT_WIDTH - theme.plot.margin.left - theme.plot.margin.right
  let plotHeight = selectedExperiment === "devices" ? 70 : 130

  return (
    <>
      <Head>
        <title>{experimentLabel} - Results</title>
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
      <h1
        css={{
          display: "none",
          fontSize: "small",
          textAlign: "center",
          "@media print": {
            display: "block",
          },
        }}
      >
        {experimentLabel}
      </h1>
      <div
        css={{
          margin: "20px auto",
          background: "white",
          fontFamily: '"Linux Libertine"',
          width: "800px",
          "@media print": {
            width: `${plotWidth}mm`,
            border: "solid 1px black",
          },
        }}
      >
        <Compound2dAgreementChart
          width={plotWidth}
          height={plotHeight}
          theme={theme}
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
