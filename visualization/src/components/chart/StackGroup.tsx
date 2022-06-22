import { useSpring, animated } from "@react-spring/web"
import { useChartTheme } from "../../lib/chart-theme"
import { StackData } from "../../lib/stacks"
import { translate } from "../../lib/transforms"
import Stack from "./Stack"

type StackGroupProps<Group, Category> = {
  stacks: Map<Group, StackData<Category, any>>
  xScale: (value: number) => number | undefined
  yScale: (value: Group) => number | undefined
  colorScale: (value: Category) => string | undefined
  bandwidth: number
}
export default function StackGroup<Group, Category>({
  stacks,
  yScale,
  xScale,
  colorScale,
  bandwidth,
}: StackGroupProps<Group, Category>) {
  const theme = useChartTheme()
  let x0 = xScale(0)
  let bandsXScale = (value: number) => {
    let x = xScale(value)
    if (x == null || x0 == null) return undefined
    return x - x0
  }

  let bands = Array.from(stacks.entries(), ([key, value]) =>
    value == null ? null : (
      <Stack
        key={String(key)}
        y={yScale(key)}
        bars={value.bars}
        xScale={bandsXScale}
        colorScale={colorScale}
        height={bandwidth}
      />
    )
  )

  const spring = useSpring({
    immediate: theme.animation === "none",
    transform: translate(x0 ?? 0, 0),
  })

  return <animated.g transform={spring.transform}>{bands}</animated.g>
}
