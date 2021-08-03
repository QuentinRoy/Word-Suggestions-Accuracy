import * as React from "react"
import fs from "fs/promises"
import path from "path"
import {
  AgreementAnswer,
  AgreementRow,
  DeviceId,
  ExperimentId,
  QuestionId,
} from "../utils/data-types"
import { csvParse } from "d3-dsv"
import { ChartThemeProvider } from "../utils/chart-theme"
import Visualization from "../components/Visualization"
import { GetStaticProps, InferGetStaticPropsType } from "next"
import Head from "next/head"

export default function IndexPage({
  data,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <Head>
        <title>Experiment Results</title>
      </Head>
      <ChartThemeProvider>
        <Visualization data={data} />
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
