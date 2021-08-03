import * as React from "react"
import {
  scaleBand,
  ScaleContinuousNumeric,
  scaleLinear,
  scaleOrdinal,
} from "d3-scale"
import { extent, max, min, range, rollup } from "d3-array"
import { schemeRdBu } from "d3-scale-chromatic"
import { animated, useSprings, useSpring } from "@react-spring/web"
import {
  AgreementAnswer,
  AgreementRow,
  EfficiencyFactor,
  negativeAgreementAnswers,
  neutralAgreementAnswer,
  positiveAgreementAnswers,
} from "../utils/data"
import ColorLegend from "./color-legend"
import DivergentStack from "../utils/diverging-stack"
import { Margin, useChartTheme } from "../utils/chart-theme"
import { translate } from "../utils/transforms"
import StackGroup from "./stack-group"
import { sortBy } from "lodash"

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

type AgreementGraphProps = {
  data: AgreementRow[]
  margin?: Partial<Margin>
  width?: number
  height?: number
  colorScale?: (answer: AgreementAnswer) => string
  groups: EfficiencyFactor
  groupLabels: { [key: string]: string }
  legendColumnCount?: number
}
const defaultMargin = { top: 15, right: 25, left: 100, bottom: 120 }
// Device: on y, proportion on x and color, accuracy and question as parameters.
export default function AgreementGraph({
  data,
  margin: partialMargin,
  width = 785,
  height = 150,
  legendColumnCount = 3,
  colorScale = scaleOrdinal(
    schemeRdBu[Object.values(AgreementAnswer).length]
  ).domain(Object.values(AgreementAnswer).reverse()),
  groups,
  groupLabels,
}: AgreementGraphProps) {
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
        <XAxisForeground y={height} scale={xScale} tickHeight={height} />
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

const ticks = range(-1, 1, 0.2)
const tickFormat = (x: number) => `${(Math.abs(x) * 100).toFixed(0)}%`
const isInDomain = (t: number, start: number, end: number) =>
  t >= start && t <= end

type XAxisProps = {
  scale: ScaleContinuousNumeric<number, number>
  tickHeight: number
  x?: number
  y?: number
}
function XAxis({ scale, tickHeight, x = 0, y }: XAxisProps) {
  const theme = useChartTheme()
  const [start, end] = extent(scale.domain())
  const springs = useSprings(
    ticks.length,
    ticks.map(t => ({
      opacity:
        start != null && end != null && isInDomain(t, start, end) ? 1 : 0,
      transform: translate(scale(t), 0),
      from: {
        opacity: 0,
        transform: translate(scale(t), 0),
      },
    }))
  )

  return (
    <g transform={translate(x, y)}>
      {springs.map(({ opacity, transform }, i) => (
        <animated.g style={{ opacity }} transform={transform} key={i}>
          <line
            x1={0}
            x2={0}
            y1={-tickHeight}
            y2={0}
            stroke={theme.axises.x.ticks.color}
            strokeWidth={theme.axises.x.ticks.width}
          />
          <text
            x={0}
            y={theme.axises.x.ticks.margin}
            textAnchor="middle"
            dominantBaseline="hanging"
            fill={theme.axises.x.ticks.label.color}
            style={{ fontSize: theme.axises.x.ticks.label.size }}
          >
            {tickFormat(ticks[i])}
          </text>
        </animated.g>
      ))}
    </g>
  )
}

type XAxisForegroundProps = {
  scale: (val: number) => number | undefined
  tickHeight: number
  x?: number
  y?: number
}
function XAxisForeground({
  scale,
  tickHeight,
  x = 0,
  y = 0,
}: XAxisForegroundProps) {
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

type YAxisProps<GroupId extends string | number> = {
  groups: GroupId[]
  bandwidth: number
  scale: (val: GroupId) => number | undefined
  labels: { [key: string]: string }
  x?: number
  y?: number
}
function YAxis<GroupId extends string | number>({
  groups,
  bandwidth,
  labels,
  scale,
  x = 0,
  y,
}: YAxisProps<GroupId>) {
  const theme = useChartTheme()
  return (
    <g transform={translate(x, y)}>
      {groups.map(key => (
        <text
          key={key}
          y={scale(key)! + bandwidth / 2}
          textAnchor="end"
          fill={theme.axises.y.ticks.label.color}
          style={{ fontSize: theme.axises.y.ticks.label.size }}
        >
          {labels[key]}
        </text>
      ))}
    </g>
  )
}
