import { ScaleContinuousNumeric } from "d3-scale"
import { extent, range } from "d3-array"
import { animated, useSprings } from "@react-spring/web"

import { useChartTheme } from "../../lib/chart-theme"
import { translate } from "../../lib/transforms"

const tickFormat = (x: number) => `${(Math.abs(x) * 100).toFixed(0)}%`
const tickKey = (t: number) => `${(t * 100).toFixed(0)}%`

const isInDomain = (t: number, start: number, end: number) =>
  t >= start && t <= end

type XAxisProps = {
  scale: ScaleContinuousNumeric<number, number>
  tickHeight: number
  noLabels?: boolean
  x?: number
  y?: number
  step?: number
}
export default function XAxis({
  scale,
  tickHeight,
  x = 0,
  y,
  noLabels,
  step = 0.1,
}: XAxisProps) {
  const theme = useChartTheme()
  // the last value in range is not included, so we have to go 1 tick further.
  const ticks = range(-1, 1 + step, step).map(value => ({
    value,
    label: tickFormat(value),
    key: tickKey(value),
  }))
  const [start, end] = extent(scale.domain())
  const springs = useSprings(
    ticks.length,
    ticks.map(t => ({
      opacity:
        start != null && end != null && isInDomain(t.value, start, end) ? 1 : 0,
      translateX: scale(t.value),
    }))
  )

  return (
    <g transform={translate(x, y ?? 0)}>
      {springs.map(({ opacity, translateX }, i) => (
        <animated.g
          key={ticks[i].key}
          style={{ opacity }}
          transform={translateX.to(x => translate(x, 0))}
        >
          <line
            x1={0}
            x2={0}
            y1={-tickHeight}
            y2={0}
            stroke={theme.axises.x.ticks.color}
            strokeWidth={theme.axises.x.ticks.width}
          />
          {!noLabels && (
            <text
              x={0}
              y={theme.axises.x.ticks.margin}
              textAnchor="middle"
              dominantBaseline="hanging"
              fill={theme.axises.x.ticks.label.color}
              style={{ fontSize: theme.axises.x.ticks.label.size }}
            >
              {ticks[i].label}
            </text>
          )}
        </animated.g>
      ))}
    </g>
  )
}
