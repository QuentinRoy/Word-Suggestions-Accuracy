import * as React from "react"
import { useChartTheme } from "../../lib/chart-theme"
import { translate } from "../../lib/transforms"

type YAxisProps<GroupId extends string | number> = {
  groups: GroupId[]
  bandwidth: number
  scale: (val: GroupId) => number | undefined
  labels: Record<GroupId, string>
  x?: number
  y?: number
}
export default function YAxis<GroupId extends string | number>({
  groups,
  bandwidth,
  labels,
  scale,
  x = 0,
  y = 0,
}: YAxisProps<GroupId>) {
  const theme = useChartTheme()
  return (
    <g transform={translate(x, y)}>
      {groups.map(groupId => {
        let baseY = scale(groupId)
        if (baseY == undefined) return null
        return (
          <text
            key={groupId}
            y={baseY + bandwidth / 2}
            textAnchor="end"
            dominantBaseline="central"
            fill={theme.axises.y.ticks.label.color}
            style={{ fontSize: theme.axises.y.ticks.label.size }}
          >
            {labels[groupId]}
          </text>
        )
      })}
    </g>
  )
}
