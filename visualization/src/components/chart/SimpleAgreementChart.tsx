import * as React from "react"
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale"
import { max, min, rollup } from "d3-array"
import { schemeRdBu } from "d3-scale-chromatic"
import { animated, useSpring } from "@react-spring/web"
import {
  AgreementAnswer,
  AgreementRow,
  EfficiencyFactor,
  negativeAgreementAnswers,
  neutralAgreementAnswer,
  positiveAgreementAnswers,
} from "../../lib/data"
import ColorLegend from "./ColorLegend"
import { DivergingStack, SolidStack } from "../../lib/stacks"
import { Margin, useChartTheme } from "../../lib/chart-theme"
import StackGroup from "./StackGroup"
import { sortBy } from "lodash"
import XAxis from "./XAxis"
import YAxis from "./YAxis"
import { useMemoMerge } from "../../lib/use-memo-merge"

const orderedAnswers = [
  ...negativeAgreementAnswers,
  ...positiveAgreementAnswers,
  neutralAgreementAnswer,
]

const AgreementDivergentStack = DivergingStack<AgreementAnswer, AgreementRow>({
  getCategory: d => d.answer,
  getValue: d => d.totalAnswers,
  negatives: negativeAgreementAnswers,
  neutral: neutralAgreementAnswer,
  positives: positiveAgreementAnswers,
})

const defaultMargin = { top: 15, right: 25, left: 85, bottom: 120 }
const noLegendDefaultMargin = { ...defaultMargin, bottom: 30 }

type AgreementChartProps = {
  data: AgreementRow[]
  margin?: Partial<Margin>
  width?: number
  height?: number
  colorScale?: (answer: AgreementAnswer) => string
  groups: EfficiencyFactor
  groupLabels: { [key: string]: string }
  legendColumnCount?: number
  noLegend?: boolean
  type: "diverging" | "solid"
}
// Device: on y, proportion on x and color, accuracy and question as parameters.
export default function SimpleAgreementChart({
  data,
  margin: partialMargin,
  width = 850 - defaultMargin.left - defaultMargin.right,
  height = 150,
  legendColumnCount = 3,
  colorScale = scaleOrdinal(
    schemeRdBu[Object.values(AgreementAnswer).length]
  ).domain(Object.values(AgreementAnswer).reverse()),
  groups,
  groupLabels,
  noLegend = false,
  type,
}: AgreementChartProps) {
  let margin = useMemoMerge(
    noLegend ? noLegendDefaultMargin : defaultMargin,
    partialMargin ?? {},
  )

  const theme = useChartTheme()

  let dataGroups = rollup(data, StackFactories[type], d => String(d[groups]))

  const yScale = scaleBand()
    .range([height, 0])
    .domain(
      sortBy(
        Array.from(dataGroups.keys()),
        id => -Object.keys(groupLabels).indexOf(id)
      )
    )
    .paddingInner(theme.stacks.padding.inner)
    .paddingOuter(theme.stacks.padding.outer)

  let domainStart = min(dataGroups.values(), d => d.start) ?? 0
  let domainEnd = max(dataGroups.values(), d => d.start + d.length) ?? 0
  const xScale = scaleLinear()
    .range([0, width])
    .domain([domainStart, domainEnd])
  let bandwidth = yScale.bandwidth()

  return (
    <svg
      width={width + margin.left + margin.right}
      height={height + margin.top + margin.bottom}
    >
      <g transform={`translate(${margin.left},${margin.top})`}>
        <XAxis y={height} scale={xScale} tickHeight={height} step={0.2} />
        <YAxis
          x={-theme.axises.y.ticks.margin}
          groups={Array.from(dataGroups.keys())}
          labels={groupLabels}
          bandwidth={bandwidth}
          scale={yScale}
        />
        <StackGroup
          stacks={dataGroups}
          xScale={xScale}
          yScale={yScale}
          colorScale={colorScale}
          bandwidth={bandwidth}
        />
        <MiddleLine y={height} scale={xScale} tickHeight={height} />
        {!noLegend && (
          <ColorLegend
            x={(width - theme.legend.width) / 2}
            y={height + theme.legend.margin.top}
            scale={colorScale}
            width={theme.legend.width}
            values={orderedAnswers}
            columnCount={legendColumnCount}
          />
        )}
      </g>
    </svg>
  )
}

type MiddleLine = {
  scale: (val: number) => number | undefined
  tickHeight: number
  x?: number
  y?: number
}

function MiddleLine({ scale, tickHeight, x = 0, y = 0 }: MiddleLine) {
  const theme = useChartTheme()
  const middle = scale(0)!
  const middleLineSpring = useSpring({
    x1: x + middle,
    x2: x + middle,
    y1: y,
    y2: tickHeight - y,
    stroke: theme.lines.color,
    strokeWidth: theme.lines.width,
  })
  return <animated.line {...middleLineSpring} />
}

let stackFactoryArgs = {
  getCategory: (d: AgreementRow) => d.answer,
  getValue: (d: AgreementRow) => d.totalAnswers,
  negatives: negativeAgreementAnswers,
  neutral: neutralAgreementAnswer,
  positives: positiveAgreementAnswers,
}
const StackFactories = {
  diverging: DivergingStack<AgreementAnswer, AgreementRow>(stackFactoryArgs),
  solid: SolidStack<AgreementAnswer, AgreementRow>(stackFactoryArgs),
}
