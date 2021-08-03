import * as React from "react"
import { useChartTheme } from "../../lib/chart-theme"
import { translate } from "../../lib/transforms"

type YAxisProps<GroupId extends string | number> = {
  groups: GroupId[]
  bandwidth: number
  scale: (val: GroupId) => number | undefined
  labels: { [key: string]: string }
  x?: number
  y?: number
}
export default function YAxis<GroupId extends string | number>({
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
