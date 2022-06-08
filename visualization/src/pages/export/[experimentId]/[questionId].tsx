import fs from "fs/promises"
import path from "path"
import { GetStaticProps, InferGetStaticPropsType } from "next"
import Head from "next/head"
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
} from "../../../lib/data"
import { ChartThemeProvider } from "../../../lib/chart-theme"
import CompoundAgreementChart from "../../../components/chart/CompoundAgreementChart"

export default function IndexPage({
  experiment,
  data,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  let groups = typingEfficiencyFactorIds[experiment]
  let groupLabels = labelsByFactors[groups]
  let accuracyLabels = labelsByFactors.accuracy

  return (
    <>
      <Head>
        <title>Experiment Results</title>
      </Head>
      <div
        css={{
          padding: "32px",
          background: "white",
          fontFamily: '"Linux Libertine"',
        }}
      >
        <ChartThemeProvider>
          <CompoundAgreementChart
            height={experiment === "devices" ? 300 : 520}
            facets="accuracy"
            groups={groups}
            data={data}
            groupLabels={groupLabels}
            facetLabels={accuracyLabels}
            type="solid"
          />
        </ChartThemeProvider>
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps<
  {
    data: AgreementRow[]
    experiment: ExperimentId
    question: QuestionId
  },
  { experimentId: ExperimentId; questionId: QuestionId }
> = async context => {
  let csvData = await fs.readFile(
    path.join(process.cwd(), "data", "agreement-data.csv"),
    "utf-8"
  )
  if (context.params == null) {
    throw new Error("No parameters provided to the page")
  }
  const { experimentId, questionId } = context.params
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
  return {
    props: {
      experiment: experimentId,
      question: questionId,
      data: data.filter(
        d => d.experiment === experimentId && d.question === questionId
      ),
    },
  }
}

export async function getStaticPaths() {
  let paths = []
  for (let experimentId of Object.keys(experimentLabels)) {
    for (let questionId of Object.keys(questionLabels)) {
      paths.push({ params: { experimentId, questionId } })
    }
  }
  return { paths, fallback: false }
}
