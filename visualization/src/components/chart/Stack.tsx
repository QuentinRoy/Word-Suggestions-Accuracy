import * as React from "react"
import { useSprings, animated } from "@react-spring/web"
import { useChartTheme } from "../../lib/chart-theme"
import { Bar } from "../../lib/diverging-stack"
import { rotate, translate, transform } from "../../lib/transforms"

const labelFormat = (n: number) => `${Math.round(n * 10) / 10}`

type StackProps<Category> = {
  bars: Bar<Category, any>[]
  x?: number
  y?: number
  xScale: (value: number) => number | undefined
  height: number
  colorScale: (value: Category) => string | undefined
}
export default function Stack<Category>({
  bars,
  x: gx = 0,
  y: gy = 0,
  xScale,
  height,
  colorScale,
}: StackProps<Category>) {
  const { labels } = useChartTheme()
  let y = height / 2

  const springs = useSprings(
    bars.length,
    bars.map(d => {
      let x = xScale(d.start)!
      let x0 = xScale(0)!
      let width = xScale(d.length + d.start)! - x
      let centerX = x + width / 2
      let rotation =
        d.value == 0 || width > labels.size * labelFormat(d.value).length
          ? 0
          : -90
      return {
        from: {
          width: 0,
          x: x0 + gx,
          y: gy,
          fill: colorScale(d.category),
          text: d.value,
          height,
          textOpacity: 0,
          opacity: 0,
          textTransform: transform(translate(x0, y + gy), rotate(0)),
        },
        to: {
          width,
          x: x + gx,
          y: gy,
          height,
          fill: colorScale(d.category),
          text: d.value,
          textTransform: transform(
            translate(centerX, y + gy),
            rotate(rotation)
          ),
          opacity: 1,
          textOpacity: width > 0 ? 1 : 0,
        },
      }
    })
  )

  return (
    <g>
      {springs.map(({ x, y, width, height, fill, opacity }, i) => (
        <g key={i}>
          <animated.rect
            x={x}
            y={y}
            width={width}
            fill={fill}
            height={height}
            opacity={opacity}
          />
        </g>
      ))}
      {springs.map(({ text, textOpacity, textTransform }, i) => (
        <g key={i}>
          <animated.text
            dominantBaseline="central"
            textAnchor="middle"
            opacity={textOpacity}
            fill={labels.color}
            transform={textTransform}
            style={{ fontSize: labels.size }}
          >
            {text.to(labelFormat)}
          </animated.text>
        </g>
      ))}
    </g>
  )
}
