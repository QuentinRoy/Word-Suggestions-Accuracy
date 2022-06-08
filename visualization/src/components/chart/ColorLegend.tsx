import { max } from "d3-array"
import { useChartTheme } from "../../lib/chart-theme"
import { translate } from "../../lib/transforms"

type LegendProps<T> = {
  width: number
  rows: (T | null)[][]
  colorScale: (value: T) => string
  getLabel: (value: T) => string
  x?: number
  y?: number
}
export default function ColorLegend<T>({
  rows,
  width,
  colorScale,
  getLabel,
  x = 0,
  y = 0,
}: LegendProps<T>): JSX.Element {
  const { legend } = useChartTheme()
  let columnCount = max(rows, row => row.length) || 1
  let itemWidth = width / columnCount
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
          {row.map((answer, i) => {
            if (answer === null) return null
            let color = colorScale(answer)
            return (
              <g key={color}>
                <rect
                  fill={colorScale(answer)}
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
                  {getLabel(answer)}
                </text>
              </g>
            )
          })}
        </g>
      ))}
    </g>
  )
}
