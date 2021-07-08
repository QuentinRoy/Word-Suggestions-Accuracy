import * as React from "react"
import { useSpring, animated } from "react-spring"
import { StackData } from "../utils/diverging-stack"
import { translate } from "../utils/transforms"
import Stack from "./stack"

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
  let x0 = xScale(0)
  let bandsXScale = (value: number) => {
    let x = xScale(value)
    if (x == null || x0 == null) return undefined
    return x - x0
  }

  let bands = [...stacks.entries()].map(([key, value]) =>
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

  const spring = useSpring({ transform: translate(x0) })

  return <animated.g transform={spring.transform}>{bands}</animated.g>
}
