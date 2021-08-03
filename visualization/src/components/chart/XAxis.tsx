import * as React from "react"
import { ScaleContinuousNumeric } from "d3-scale"
import { extent, range } from "d3-array"
import { animated, useSprings } from "@react-spring/web"

import { useChartTheme } from "../../lib/chart-theme"
import { translate } from "../../lib/transforms"

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
export default function XAxis({ scale, tickHeight, x = 0, y }: XAxisProps) {
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
