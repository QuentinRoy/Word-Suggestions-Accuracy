import { chunk } from "lodash"
import * as React from "react"
import { useChartTheme } from "../../lib/chart-theme"
import { translate } from "../../lib/transforms"

type LegendProps<T = any> = {
  columnCount: number
  width: number
  values: T[]
  scale: (value: T) => string
  x?: number
  y?: number
}
const ColorLegend: React.FC<LegendProps> = ({
  columnCount,
  values,
  width,
  scale,
  x = 0,
  y = 0,
}) => {
  const { legend } = useChartTheme()
  let itemWidth = width / columnCount
  let rows = chunk(values, columnCount)
  return (
    <g transform={translate(x, y)}>
      {rows.map((row, i) => (
        <g
          key={i}
          transform={translate(
            0,
            i * (legend.items.size + legend.items.margin)
          )}
        >
          {row.map((answer, i) => (
            <g key={answer}>
              <rect
                fill={scale(answer)}
                width={legend.items.size}
                height={legend.items.size}
                y={0}
                x={i * itemWidth}
              />
              <text
                x={i * itemWidth + legend.items.size + legend.items.margin}
                y={legend.items.size / 2}
                dominantBaseline="middle"
                fill={legend.items.label.color}
                style={{ fontSize: legend.items.label.size }}
              >
                {answer}
              </text>
            </g>
          ))}
        </g>
      ))}
    </g>
  )
}

export default ColorLegend
