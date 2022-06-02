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
import DivergentStack from "../../lib/diverging-stack"
import { Margin, useChartTheme } from "../../lib/chart-theme"
import StackGroup from "./StackGroup"
import { sortBy } from "lodash"
import XAxis from "./XAxis"
import YAxis from "./YAxis"

const orderedAnswers = [
  ...negativeAgreementAnswers,
  ...positiveAgreementAnswers,
  neutralAgreementAnswer,
]

const AgreementDivergentStack = DivergentStack<AgreementAnswer, AgreementRow>({
  getCategory: d => d.answer,
  getValue: d => d.totalAnswers,
  negatives: negativeAgreementAnswers,
  neutral: neutralAgreementAnswer,
  positives: positiveAgreementAnswers,
})

const defaultMargin = { top: 15, right: 25, left: 85, bottom: 120 }

type AgreementChartProps = {
  data: AgreementRow[]
  margin?: Partial<Margin>
  width?: number
  height?: number
  colorScale?: (answer: AgreementAnswer) => string
  groups: EfficiencyFactor
  groupLabels: { [key: string]: string }
  legendColumnCount?: number
}
// Device: on y, proportion on x and color, accuracy and question as parameters.
export default function AgreementChart({
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
}: AgreementChartProps) {
  let margin: Margin = { ...partialMargin, ...defaultMargin }

  const theme = useChartTheme()

  let dataGroups = rollup(data, AgreementDivergentStack, d => String(d[groups]))

  const yScale = scaleBand()
    .range([height, 0])
    .domain(
      sortBy(
        Array.from(dataGroups.keys()),
        id => -Object.keys(groupLabels).indexOf(id)
      )
    )
    .paddingInner(theme.groups.padding.inner)
    .paddingOuter(theme.groups.padding.outer)

  let domainStart = min(dataGroups.values(), d => d.start) ?? 0
  let domainEnd = max(dataGroups.values(), d => d.start + d.length) ?? 0
  const xScale = scaleLinear()
    .range([0, width])
    .domain([domainStart, domainEnd])
    .nice()
  let bandwidth = yScale.bandwidth()

  return (
    <svg
      width={width + margin.left + margin.right}
      height={height + margin.top + margin.bottom}
    >
      <g transform={`translate(${margin.left},${margin.top})`}>
        <XAxis y={height} scale={xScale} tickHeight={height} />
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
        <ColorLegend
          x={(width - theme.legend.width) / 2}
          y={height + theme.legend.margin.top}
          scale={colorScale}
          width={theme.legend.width}
          values={orderedAnswers}
          columnCount={legendColumnCount}
        />
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
