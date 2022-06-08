import * as React from "react"
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale"
import { max, min, rollup } from "d3-array"
import { schemeRdBu } from "d3-scale-chromatic"
import { animated, useSpring } from "@react-spring/web"
import {
  AgreementAnswer,
  AgreementRow,
  negativeAgreementAnswers,
  neutralAgreementAnswer,
  positiveAgreementAnswers,
} from "../../lib/data"
import ColorLegend from "./ColorLegend"
import { DivergingStack, SolidStack } from "../../lib/stacks"
import { Margin, useChartTheme } from "../../lib/chart-theme"
import StackGroup from "./StackGroup"
import { merge, sortBy } from "lodash"
import XAxis from "./XAxis"
import YAxis from "./YAxis"
import { rotate, transform, translate } from "../../lib/transforms"
import { useMemoMerge } from "../../lib/use-memo-merge"

const orderedAnswers = [
  ...negativeAgreementAnswers,
  ...positiveAgreementAnswers,
  neutralAgreementAnswer,
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
  legendColumnCount?: number
  noLegend?: boolean
  type: "diverging" | "solid"
}
// Device: on y, proportion on x and color, accuracy and question as parameters.
export default function CompoundAgreementChart({
  data,
  margin: partialMargin,
  width = 850 - defaultMargin.left - defaultMargin.right,
  height = 350,
  legendColumnCount = 3,
  colorScale = scaleOrdinal(
    schemeRdBu[Object.values(AgreementAnswer).length]
  ).domain(Object.values(AgreementAnswer).reverse()),
  facets,
  groups,
  groupLabels,
  facetLabels,
  type,
  noLegend = false,
}: CompoundAgreementChartProps) {
  let margin: Margin = useMemoMerge(
    noLegend ? noLegendDefaultMargin : defaultMargin,
    partialMargin == null ? {} : partialMargin
  )

  const theme = useChartTheme()

  let dataGroups = rollup(
    data,
    StackFactories[type],
    d => String(d[facets]),
    d => String(d[groups])
  )

  let facetScale = scaleBand()
    .range([height, 0])
    .domain(
      sortBy(
        Array.from(dataGroups.keys()),
        id => -Object.keys(facetLabels).indexOf(id)
      )
    )
    .paddingInner(theme.facets.padding.inner)
    .paddingOuter(theme.facets.padding.outer)
  let facetHeight = facetScale.bandwidth()

  let domainStart =
    min(dataGroups.values(), g => min(g.values(), d => d.start)) ?? 0
  let domainEnd =
    max(dataGroups.values(), g => max(g.values(), d => d.start + d.length)) ?? 0
  let xScale = scaleLinear().range([0, width]).domain([domainStart, domainEnd])

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
            .domain(
              sortBy(
                Array.from(stacks.keys()),
                id => -Object.keys(groupLabels).indexOf(id)
              )
            )
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
