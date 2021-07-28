import * as React from "react"
import { FormControl, FormLabel, Slider } from "@material-ui/core"

type AccuracyControlProps = {
  availableValues: number[]
  value?: number
  onChange: (newValue: number) => any
}
export default function AccuracyControl({
  availableValues,
  value,
  onChange,
}: AccuracyControlProps) {
  return (
    <FormControl fullWidth>
      <FormLabel>Accuracy</FormLabel>
      <Slider
        value={value}
        onChange={(evt, newValue) => {
          onChange(newValue as number)
        }}
        step={null}
        min={0}
        max={1}
        marks={availableValues.map(a => ({
          value: a,
          label: formatAccuracy(a),
        }))}
      />
    </FormControl>
  )
}

function formatAccuracy(x: number) {
  return `${(x * 100).toFixed(0)}%`
}
