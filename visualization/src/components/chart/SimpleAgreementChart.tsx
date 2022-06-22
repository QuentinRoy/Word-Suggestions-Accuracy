import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale"
import { max, min, reverse, rollup, sort } from "d3-array"
import { schemeRdBu } from "d3-scale-chromatic"
import { animated, useSpring } from "@react-spring/web"
import { PartialDeep } from "type-fest"
import {
  AgreementAnswer,
  agreementAnswerLabels,
  AgreementRow,
  EfficiencyFactor,
  negativeAgreementAnswers,
  neutralAgreementAnswer,
  positiveAgreementAnswers,
} from "../../lib/data"
import ColorLegend from "./ColorLegend"
import { DivergingStack, SolidStack } from "../../lib/stacks"
import {
  ChartTheme,
  ChartThemeProvider,
  defaultTheme,
  useChartTheme,
} from "../../lib/chart-theme"
import StackGroup from "./StackGroup"
import XAxis from "./XAxis"
import YAxis from "./YAxis"

const orderedAgreementAnswers = [
  ...negativeAgreementAnswers,
  neutralAgreementAnswer,
  ...reverse(positiveAgreementAnswers),
]
const divergingOrderLegendRows = [
  negativeAgreementAnswers,
  positiveAgreementAnswers,
  [neutralAgreementAnswer, null, null],
]
const positivityOrderLegendRows = [
  negativeAgreementAnswers,
  [neutralAgreementAnswer, null, null],
  reverse(positiveAgreementAnswers),
]

const defaultColorScale = scaleOrdinal(
  schemeRdBu[orderedAgreementAnswers.length]
).domain(orderedAgreementAnswers)

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

type AgreementChartProps = {
  data: AgreementRow[]
  theme?: PartialDeep<ChartTheme>
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
  theme: partialTheme,
  width = 850 - defaultTheme.plot.margin.left - defaultTheme.plot.margin.right,
  height = 150,
  colorScale = defaultColorScale,
  groups,
  groupLabels,
  noLegend = false,
  type,
}: AgreementChartProps) {
  const theme = useChartTheme(partialTheme)

  let dataGroups = rollup(data, StackFactories[type], d => String(d[groups]))

  let groupOrder = Object.keys(groupLabels)
  const yScale = scaleBand()
    .range([height, 0])
    .domain(sort(dataGroups.keys(), id => -groupOrder.indexOf(id)))
    .paddingInner(theme.stacks.padding.inner)
    .paddingOuter(theme.stacks.padding.outer)

  let domainStart = min(dataGroups.values(), d => d.start) ?? 0
  let domainEnd = max(dataGroups.values(), d => d.start + d.length) ?? 0
  const xScale = scaleLinear()
    .range([0, width])
    .domain([domainStart, domainEnd])
  let bandwidth = yScale.bandwidth()

  let fullWidth = width + theme.plot.margin.left + theme.plot.margin.right
  let fullHeight = height + theme.plot.margin.top + theme.plot.margin.bottom

  return (
    <ChartThemeProvider theme={theme}>
      <svg
        width={fullWidth}
        height={fullHeight}
        viewBox={`0 0 ${fullWidth} ${fullHeight}`}
      >
        <g
          transform={`translate(${theme.plot.margin.left},${theme.plot.margin.top})`}
        >
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
              colorScale={colorScale}
              width={theme.legend.width}
              getLabel={d => agreementAnswerLabels[d]}
              rows={
                type == "diverging"
                  ? divergingOrderLegendRows
                  : positivityOrderLegendRows
              }
            />
          )}
        </g>
      </svg>
    </ChartThemeProvider>
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
