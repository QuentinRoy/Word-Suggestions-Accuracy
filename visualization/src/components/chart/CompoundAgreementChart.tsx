import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale"
import { max, min, reverse, rollup, sort } from "d3-array"
import { schemeRdBu } from "d3-scale-chromatic"
import { animated, useSpring } from "@react-spring/web"
import {
  AgreementAnswer,
  agreementAnswerLabels,
  AgreementRow,
  negativeAgreementAnswers,
  neutralAgreementAnswer,
  positiveAgreementAnswers,
} from "../../lib/data"
import ColorLegend from "./ColorLegend"
import { DivergingStack, SolidStack } from "../../lib/stacks"
import { Margin, useChartTheme } from "../../lib/chart-theme"
import StackGroup from "./StackGroup"
import XAxis from "./XAxis"
import YAxis from "./YAxis"
import { rotate, transform, translate } from "../../lib/transforms"
import { useMemoMerge } from "../../lib/use-memo-merge"

const orderedAgreementAnswers = [
  ...negativeAgreementAnswers,
  neutralAgreementAnswer,
  ...reverse(positiveAgreementAnswers),
]
const divergingOrderLegendRows = [
  negativeAgreementAnswers,
  [neutralAgreementAnswer, null, null],
  positiveAgreementAnswers,
]
const positivityOrderLegendRows = [
  negativeAgreementAnswers,
  [neutralAgreementAnswer, null, null],
  reverse(positiveAgreementAnswers),
]

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

const defaultMargin = { top: 15, right: 25, left: 115, bottom: 120 }
const noLegendDefaultMargin = { ...defaultMargin, bottom: 30 }
const defaultColorScale = scaleOrdinal(
  schemeRdBu[orderedAgreementAnswers.length]
).domain(orderedAgreementAnswers)

type CompoundAgreementChartProps = {
  data: AgreementRow[]
  margin?: Partial<Margin>
  width?: number
  height?: number
  colorScale?: (answer: AgreementAnswer) => string
  facets: keyof AgreementRow
  groups: keyof AgreementRow
  groupLabels: Record<string, string>
  facetLabels: Record<string, string>
  noLegend?: boolean
  type: "diverging" | "solid"
}
// Device: on y, proportion on x and color, accuracy and question as parameters.
export default function CompoundAgreementChart({
  data,
  margin: partialMargin,
  width = 850 - defaultMargin.left - defaultMargin.right,
  height = 350,
  colorScale = defaultColorScale,
  facets,
  groups,
  groupLabels,
  facetLabels,
  type,
  noLegend = false,
}: CompoundAgreementChartProps) {
  let margin = useMemoMerge(
    noLegend ? noLegendDefaultMargin : defaultMargin,
    partialMargin
  ) as Margin
  const theme = useChartTheme()

  let dataGroups = rollup(
    data,
    StackFactories[type],
    d => String(d[facets]),
    d => String(d[groups])
  )

  let facetOrder = Object.keys(facetLabels)
  let facetScale = scaleBand()
    .range([height, 0])
    .domain(sort(dataGroups.keys(), id => -facetOrder.indexOf(id)))
    .paddingInner(theme.facets.padding.inner)
    .paddingOuter(theme.facets.padding.outer)
  let facetHeight = facetScale.bandwidth()

  let xDomain = [
    min(dataGroups.values(), g => min(g.values(), d => d.start)) ?? 0,
    max(dataGroups.values(), g => max(g.values(), d => d.start + d.length)) ??
      0,
  ]
  let xScale = scaleLinear().range([0, width]).domain(xDomain)

  let groupOrder = Object.keys(groupLabels)

  return (
    <svg
      width={width + margin.left + margin.right}
      height={height + margin.top + margin.bottom}
    >
      <g transform={translate(margin.left, margin.top)}>
        <XAxis
          y={height}
          scale={xScale}
          tickHeight={height}
          step={type == "diverging" ? 0.2 : 0.1}
        />
        {Array.from(dataGroups, ([key, stacks], i) => {
          let yScale = scaleBand()
            .range([facetHeight, 0])
            .domain(sort(stacks.keys(), id => -groupOrder.indexOf(id)))
            .paddingInner(theme.stacks.padding.inner)
            .paddingOuter(theme.stacks.padding.outer)
          let bandwidth = yScale.bandwidth()
          return (
            <g transform={translate(0, facetScale(key) ?? 0)} key={key}>
              <text
                x={0}
                y={0}
                transform={transform(
                  translate(-theme.facets.label.margin, facetHeight / 2),
                  rotate(-90)
                )}
                textAnchor="middle"
                dominantBaseline="hanging"
                fill={theme.axises.x.ticks.label.color}
                style={{ fontSize: theme.facets.label.size }}
              >
                {facetLabels[key]}
              </text>
              <YAxis
                x={-theme.axises.y.ticks.margin}
                groups={Array.from(stacks.keys())}
                labels={groupLabels}
                bandwidth={bandwidth}
                scale={yScale}
              />
              <StackGroup
                stacks={stacks}
                xScale={xScale}
                yScale={yScale}
                colorScale={colorScale}
                bandwidth={bandwidth}
              />
              {type === "diverging" && (
                <MiddleLine
                  y={facetHeight}
                  scale={xScale}
                  tickHeight={facetHeight}
                />
              )}
            </g>
          )
        })}

        {!noLegend && (
          <ColorLegend
            x={(width - theme.legend.width) / 2}
            y={height + theme.legend.margin.top}
            colorScale={colorScale}
            getLabel={d => agreementAnswerLabels[d]}
            width={theme.legend.width}
            rows={
              type == "diverging"
                ? divergingOrderLegendRows
                : positivityOrderLegendRows
            }
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
