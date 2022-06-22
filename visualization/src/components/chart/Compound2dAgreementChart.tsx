import * as React from "react"
import { scaleBand, scaleLinear, scaleOrdinal } from "d3-scale"
import { max, min, range, reverse, rollup, sort } from "d3-array"
import { schemeRdBu } from "d3-scale-chromatic"
import { animated, useSpring } from "@react-spring/web"
import { PartialDeep, ValueOf } from "type-fest"
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
import {
  ChartTheme,
  ChartThemeProvider,
  useChartTheme,
} from "../../lib/chart-theme"
import StackGroup from "./StackGroup"
import XAxis from "./XAxis"
import YAxis from "./YAxis"
import { rotate, transform, translate } from "../../lib/transforms"

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

const defaultColorScale = scaleOrdinal(
  schemeRdBu[orderedAgreementAnswers.length]
).domain(orderedAgreementAnswers)

interface Compound2dAgreementChartProps<
  Facet1Prop extends keyof AgreementRow,
  Facet2Prop extends keyof AgreementRow,
  GroupProp extends keyof AgreementRow
> {
  data: AgreementRow[]
  theme?: PartialDeep<ChartTheme>
  width?: number
  height?: number
  colorScale?: (answer: AgreementAnswer) => string
  facet1: Facet1Prop
  facet2: Facet2Prop
  groups: GroupProp
  facet1Labels: Record<AgreementRow[Facet1Prop], string>
  facet2Labels: Record<AgreementRow[Facet2Prop], string>
  groupLabels: Record<AgreementRow[GroupProp], string>
  facet2Columns?: number
  noLegend?: boolean
  type: "diverging" | "solid"
}
// Device: on y, proportion on x and color, accuracy and question as parameters.
export default function Compound2dAgreementChart<
  Facet1Prop extends keyof AgreementRow,
  Facet2Prop extends keyof AgreementRow,
  GroupProp extends keyof AgreementRow
>({
  data,
  theme: partialTheme,
  width: _width,
  height = 350,
  colorScale = defaultColorScale,
  facet1,
  facet2,
  groups,
  groupLabels,
  facet1Labels,
  facet2Labels,
  facet2Columns = 2,
  type,
  noLegend = false,
}: Compound2dAgreementChartProps<Facet1Prop, Facet2Prop, GroupProp>) {
  const theme = useChartTheme(partialTheme)

  // Creates a new variable because _width is number|undefined
  // but we need to use it as a number.
  let width =
    _width != null
      ? _width
      : 850 - theme.plot.margin.left - theme.plot.margin.right

  let dataGroups = React.useMemo(
    () =>
      rollup(
        data,
        StackFactories[type],
        d => d[facet2],
        d => d[facet1],
        d => d[groups]
      ),
    [data, facet1, facet2, groups, type]
  )

  let facet2Order = Object.keys(facet2Labels) as (keyof typeof facet2Labels)[]
  let facet2Grid = createPlotGrid(
    facet2Order.filter(d => dataGroups.has(d)),
    facet2Columns
  )
  let getFacet2Coords = (d: AgreementRow[Facet2Prop]): [number, number] => {
    for (let x = 0; x < facet2Grid.length; x++) {
      let col = facet2Grid[x]
      for (let y = 0; y < col.length; y++) {
        if (col[y] === d) {
          return [x, y]
        }
      }
    }
    throw new Error(`${d} not found in Facet2 (${facet2}) grid`)
  }
  let columnScale = scaleBand<number>()
    .domain(range(0, max(facet2Grid, d => d.length) ?? 0))
    .paddingInner(theme.subPlot.gap.horizontal / width)
    .range([0, width])
  let rowScale = scaleBand<number>()
    .domain(range(0, facet2Grid.length))
    .paddingInner(theme.subPlot.gap.vertical / height)
    .range([0, height])
  let facet2ScaleXBandwidth = columnScale.bandwidth()
  let facet2ScaleYBandwidth = rowScale.bandwidth()

  let facet1Order = Object.keys(facet1Labels) as (keyof typeof facet1Labels)[]
  let facet1Values = new Set(data.map(d => d[facet1]))
  let facet1Scale = scaleBand<ValueOf<AgreementRow>>()
    .range([facet2ScaleYBandwidth, 0])
    .domain(
      sort(
        facet1Values.values(),
        (id: AgreementRow[Facet1Prop]) => -facet1Order.indexOf(id)
      )
    )
    .paddingInner(theme.facets.padding.inner)
    .paddingOuter(theme.facets.padding.outer)
  let facet1Height = facet1Scale.bandwidth()

  let xDomain = React.useMemo(() => {
    let minX
    let maxX
    for (let g1 of dataGroups.values()) {
      for (let g2 of g1.values()) {
        for (let row of g2.values()) {
          let { start } = row
          let end = start + row.length
          minX = minX == null ? start : Math.min(minX, start)
          maxX = maxX == null ? end : Math.max(minX, end)
        }
      }
    }
    return [minX ?? 0, maxX ?? 0] as const
  }, [dataGroups])

  let xScale = scaleLinear()
    .range([0, facet2ScaleXBandwidth])
    .domain(xDomain)
    .nice()

  let groupOrder = Object.keys(groupLabels) as (keyof typeof groupLabels)[]

  let fullWidth = width + theme.plot.margin.left + theme.plot.margin.right
  let fullHeight = height + theme.plot.margin.top + theme.plot.margin.bottom

  return (
    <ChartThemeProvider theme={theme}>
      <svg
        css={{ width: "100%", display: "block" }}
        viewBox={`0 0 ${fullWidth} ${fullHeight}`}
      >
        <g transform={translate(theme.plot.margin.left, theme.plot.margin.top)}>
          {Array.from(dataGroups, ([facet2Key, facet2Group]) => {
            let [col, row] = getFacet2Coords(facet2Key)
            return (
              <g
                key={facet2Key}
                transform={translate(columnScale(col) ?? 0, rowScale(row) ?? 0)}
              >
                <text
                  textAnchor="middle"
                  x={facet2ScaleXBandwidth / 2}
                  y={-theme.subPlot.label.margin}
                  fontSize={theme.subPlot.label.size}
                  fontFamily={theme.subPlot.label.fontFamily}
                  fill={theme.subPlot.label.color}
                >
                  {facet2Labels[facet2Key]}
                </text>
                <XAxis
                  y={facet2ScaleYBandwidth}
                  scale={xScale}
                  tickHeight={facet2ScaleYBandwidth}
                  step={type == "diverging" ? 0.2 : 0.1}
                  noLabels={facet2Grid[row + 1]?.[col] != null}
                />
                {Array.from(facet2Group, ([facet1Key, facet1Group]) => {
                  let yScale = scaleBand<AgreementRow[GroupProp]>()
                    .range([facet1Height, 0])
                    .domain(
                      sort(facet1Group.keys(), k => -groupOrder.indexOf(k))
                    )
                    .paddingInner(theme.stacks.padding.inner)
                    .paddingOuter(theme.stacks.padding.outer)
                  let bandwidth = yScale.bandwidth()
                  let y = facet1Scale(facet1Key) ?? 0
                  return (
                    <g transform={translate(0, y)} key={facet1Key}>
                      {col === 0 ? (
                        <>
                          <text
                            transform={transform(
                              // Use translate from (0,0) to simplify the
                              // transform.
                              translate(
                                -theme.facets.label.margin,
                                facet1Height / 2
                              ),
                              rotate(-90)
                            )}
                            textAnchor="middle"
                            dominantBaseline="hanging"
                            fill={theme.axises.x.ticks.label.color}
                            fontSize={theme.facets.label.size}
                            fontFamily={theme.facets.label.fontFamily}
                          >
                            {facet1Labels[facet1Key]}
                          </text>
                          <YAxis
                            x={-theme.axises.y.ticks.margin}
                            groups={Array.from(facet1Group.keys())}
                            labels={groupLabels}
                            bandwidth={bandwidth}
                            scale={yScale}
                          />
                        </>
                      ) : null}
                      <StackGroup
                        stacks={facet1Group}
                        xScale={xScale}
                        yScale={yScale}
                        colorScale={colorScale}
                        bandwidth={bandwidth}
                      />
                      {type === "diverging" && (
                        <MiddleLine
                          y={facet1Height}
                          scale={xScale}
                          tickHeight={facet1Height}
                        />
                      )}
                    </g>
                  )
                })}
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

function createPlotGrid<T>(values: Iterable<T>, cols: number): T[][] {
  let grid: T[][] = []
  let currentRow: T[] = []
  for (let v of values) {
    currentRow.push(v)
    if (currentRow.length === cols) {
      grid.push(currentRow)
      currentRow = []
    }
  }
  return grid
}
